import { OIDC_MOCK, installOidcPkceIntercepts, buildOidcPkceAuthConfig } from '../../support/oidcMock';

/**
 * e2e coverage for the `@luigi-project/plugin-auth-oidc-pkce` plugin, running the REAL
 * plugin (and its bundled `oidc-client-ts`) against a Docker-free mock IdP built on
 * `cy.intercept` (see cypress/e2e/support/oidcMock.js). This replaces the Dockerized
 * `scripts/oidc-mockserver` for CI. The legacy `auth-oidc` e2e is untouched.
 *
 * The four flows covered: login round-trip, state return-to-path, logout, silent-renew
 * iframe callback.
 *
 * Navigation note (the crux of this spec): the OIDC flows cross full-page navigations —
 * the plugin drives `window.location.assign('/authorize')` and the mock 302-redirects back
 * to the app with `?code=...`. Cypress `cy.visit` `onLoad`/`onBeforeLoad` fire ONLY on the
 * initial visit, NOT on those redirect-driven loads, so config applied only in `onLoad`
 * would never reach the callback page and the plugin would never exchange the code.
 *
 * To make the app behave like a real one (config present on every load), we register a
 * `Cypress.on('window:before:load')` handler that re-applies the Luigi config on EVERY page
 * load in the test — including the callback load. That handler runs before the app's scripts,
 * so it waits for `win.Luigi` (loaded synchronously from `luigi.js` in the body) via the
 * document `readystatechange` and applies the config as soon as Luigi is available.
 */
describe('JS-TEST-APP auth-oidc-pkce', () => {
  const AUTH_KEY = 'luigi.auth';

  const baseConfig = (win, authOverrides = {}) => {
    const auth = buildOidcPkceAuthConfig(win);
    Object.assign(auth.openIdConnect, authOverrides);
    return {
      navigation: {
        nodes: [{ pathSegment: 'home', label: 'Home', viewUrl: '/examples/microfrontends/multipurpose.html' }]
      },
      routing: { useHashRouting: true },
      settings: { header: { title: 'Luigi OIDC PKCE E2E' } },
      auth
    };
  };

  /**
   * Apply the pkce auth config on EVERY page load (initial visit AND every redirect-driven
   * load) for the remainder of the current test. `window:before:load` fires before the app's
   * own scripts, so we wait until Luigi has been loaded (synchronous `luigi.js` in the body)
   * before calling `setConfig`. Returns nothing — call it once, then `cy.visit`.
   */
  // Handlers registered on `window:before:load` for the current test; removed in afterEach so
  // they never leak into sibling tests (or other specs sharing the runner).
  let loadHandlers = [];

  const applyConfigOnEveryLoad = (authOverrides = {}) => {
    const handler = (win) => {
      const trySetConfig = () => {
        if (win.__pkceConfigApplied) return true;
        if (win.Luigi && typeof win.Luigi.setConfig === 'function') {
          win.__pkceConfigApplied = true;
          win.Luigi.setConfig(baseConfig(win, authOverrides));
          return true;
        }
        return false;
      };
      if (trySetConfig()) return;
      win.document.addEventListener('readystatechange', trySetConfig);
      win.addEventListener('DOMContentLoaded', trySetConfig);
      win.addEventListener('load', trySetConfig);
    };
    loadHandlers.push(handler);
    Cypress.on('window:before:load', handler);
  };

  beforeEach(() => {
    cy.clearLocalStorage();
    installOidcPkceIntercepts();
  });

  afterEach(() => {
    loadHandlers.forEach((handler) => Cypress.off('window:before:load', handler));
    loadHandlers = [];
  });

  it('login round-trip: auto-login redirects through /authorize and exchanges the code for tokens', () => {
    // Auto-login (disableAutoLogin is not set) triggers the plugin's login() which redirects
    // to /authorize; the mock returns a code; oidc-client-ts POSTs to /token on the callback
    // load (config is re-applied there via applyConfigOnEveryLoad).
    applyConfigOnEveryLoad();
    cy.visit(`${OIDC_MOCK.redirectUri}`);

    cy.wait('@oidcAuthorize');
    cy.wait('@oidcToken');

    // Tokens are persisted under localStorage['luigi.auth'] by the plugin's `userLoaded`
    // handler, which runs slightly after the /token response resolves — poll until present.
    cy.window()
      .its('localStorage')
      .invoke('getItem', AUTH_KEY)
      .should((raw) => {
        const stored = JSON.parse(raw);
        expect(stored, 'luigi.auth is populated').to.be.an('object');
        expect(stored.accessToken, 'accessToken present').to.be.a('string').and.not.be.empty;
        expect(stored.idToken, 'idToken present').to.be.a('string').and.not.be.empty;
      });
  });

  it('state return-to-path: the deep path that started login is restored after callback', () => {
    // Start login from a deep route. The plugin sets `state = window.location.href`, the mock
    // reflects it back, and _processLoginResponse restores the path via history.pushState.
    applyConfigOnEveryLoad();
    cy.visit(`${OIDC_MOCK.redirectUri}#/home`);

    cy.wait('@oidcAuthorize').then((interception) => {
      // oidc-client-ts round-trips the caller-supplied state; the plugin set it to the href
      // captured at login time, so the deep path is present in what the IdP receives back.
      const state = new URL(interception.request.url).searchParams.get('state') || '';
      expect(decodeURIComponent(state), 'state round-trips the login-time href').to.be.a('string');
    });
    cy.wait('@oidcToken');

    // After the code exchange the plugin restores the originating path via pushState.
    cy.expectPathToBe('/home');
  });

  it('logout: /endsession is hit and stored auth is cleared', () => {
    // Arrive authenticated first.
    applyConfigOnEveryLoad();
    cy.visit(`${OIDC_MOCK.redirectUri}`);
    cy.wait('@oidcToken');
    cy.window().its('localStorage').invoke('getItem', AUTH_KEY).should('not.be.null');

    // Wait until the authenticated shell has rendered before logging out. `logout()` reads
    // `idpProviderInstance.settings`, and that instance is only assigned once checkAuth's
    // provider promise resolves — which happens slightly after the /token exchange. The home
    // MFE iframe rendering is the observable signal that checkAuth + navigation completed.
    cy.get('.iframeContainer iframe', { timeout: 10000 }).should('exist');

    // Trigger logout — the plugin calls signoutRedirect() which navigates to /endsession.
    cy.window().then((win) => {
      win.Luigi.auth().logout();
    });

    cy.wait('@oidcEndSession');
    // The mock redirects to post_logout_redirect_uri carrying `?logout`. On that load the
    // plugin's _processLogoutResponse detects `?logout` and calls signoutRedirectCallback(),
    // which asynchronously clears the stored auth. On slow CI that async clear can take a
    // while after the URL already shows `?logout`, so poll storage with a generous timeout
    // rather than assuming it is cleared the moment the location changes.
    cy.location('search', { timeout: 15000 }).should('contain', 'logout');
    cy.window({ timeout: 15000 }).its('localStorage').invoke('getItem', AUTH_KEY).should('be.null');
  });

  it('silent-renew iframe callback: automaticSilentRenew runs /authorize (prompt=none) in a hidden iframe and refreshes the token', () => {
    // Authenticate with a short-lived token and automatic silent renew enabled. The first
    // /token response expires quickly so oidc-client-ts schedules a silent renew, which loads
    // silent_redirect_uri in a hidden iframe; that page posts the callback URL back to the
    // parent (see public/auth/oidc-pkce-silent-callback.html), driving a fresh /authorize
    // (prompt=none) + /token exchange.
    installOidcPkceIntercepts({ tokenExpiresIn: 10 });

    let firstAccessToken;

    applyConfigOnEveryLoad({
      automaticSilentRenew: true,
      // Fire the renew ~immediately: notify when >5s of a 10s lifetime remain.
      accessTokenExpiringNotificationTimeInSeconds: 5
    });
    cy.visit(`${OIDC_MOCK.redirectUri}`);

    // Consume the interactive /authorize (no prompt) from the initial auto-login so the next
    // `@oidcAuthorize` we wait on is unambiguously the silent-renew one.
    cy.wait('@oidcAuthorize').then((interception) => {
      expect(new URL(interception.request.url).searchParams.get('prompt'), 'initial login is interactive').to.not.eq(
        'none'
      );
    });
    cy.wait('@oidcToken');
    // Poll until the initial token is persisted (the plugin's `userLoaded` handler writes it
    // slightly after /token resolves), then capture it to compare against the renewed one.
    cy.window()
      .its('localStorage')
      .invoke('getItem', AUTH_KEY)
      .should('not.be.null')
      .then((raw) => {
        firstAccessToken = JSON.parse(raw).accessToken;
        expect(firstAccessToken, 'initial access token present').to.be.a('string').and.not.be.empty;
      });

    // The silent-renew /authorize (prompt=none) fires in a hidden iframe and a fresh /token
    // exchange occurs.
    cy.wait('@oidcAuthorize', { timeout: 20000 }).then((interception) => {
      expect(new URL(interception.request.url).searchParams.get('prompt'), 'silent renew uses prompt=none').to.eq(
        'none'
      );
    });
    cy.wait('@oidcToken', { timeout: 20000 });

    // The silent renew's `userLoaded` event writes the fresh token back to storage slightly
    // after the /token response resolves, so poll until the stored access token changes.
    cy.window()
      .its('localStorage')
      .invoke('getItem', AUTH_KEY)
      .should((raw) => {
        const renewed = JSON.parse(raw).accessToken;
        expect(renewed, 'access token was refreshed by silent renew').to.not.equal(firstAccessToken);
      });
  });
});
