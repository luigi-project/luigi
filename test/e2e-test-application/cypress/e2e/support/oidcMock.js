/**
 * OIDC PKCE mock for e2e — a Docker-free fake IdP built entirely on `cy.intercept`.
 *
 * Why this exists: the `auth-oidc-pkce` plugin drives `oidc-client-ts`, which performs
 * a real `/authorize` redirect, a real `/token` POST (PKCE code exchange), and ID-token
 * claim validation. The old approach ran a Dockerized `oidc-server-mock`, which is not
 * suitable for CI. Instead we intercept the three OIDC endpoints in the browser and pass
 * inline `metadata` in the Luigi auth config so no discovery/JWKS round-trip is needed.
 *
 * What `oidc-client-ts@3.5.0` actually requires (verified against its source):
 *  - Discovery is skipped when `metadata` is supplied inline.
 *  - It does NOT verify the ID-token signature — `JwtUtils.decode` is a plain base64 decode.
 *    `ResponseValidator._validateIdTokenAttributes` only checks claims (`sub`, and `nonce`
 *    ONLY when a nonce was stored — the code flow does not generate one by default). So an
 *    unsigned JWT carrying `sub`/`iss`/`aud`/`exp` is accepted.
 *  - The token response must contain an `id_token` so `isOpenId` is true and the profile is
 *    stored.
 *
 * Usage in a spec:
 *   import { installOidcPkceIntercepts, OIDC_MOCK, buildOidcPkceAuthConfig } from '../../support/oidcMock';
 *   installOidcPkceIntercepts();
 *   // then pass buildOidcPkceAuthConfig(win) into the Luigi config on visit
 */

export const OIDC_MOCK = {
  authority: 'http://oidc.mock',
  clientId: 'pkce-mock-client',
  issuer: 'http://oidc.mock',
  authorizeEndpoint: 'http://oidc.mock/authorize',
  tokenEndpoint: 'http://oidc.mock/token',
  endSessionEndpoint: 'http://oidc.mock/endsession',
  subject: 'luigi-e2e-user',
  // Served by the :4500 JS test app (see public/auth/oidc-pkce-silent-callback.html).
  silentRedirectUri: 'http://localhost:4500/auth/oidc-pkce-silent-callback.html',
  postLogoutRedirectUri: 'http://localhost:4500/?logout',
  // Where the IdP sends the authorization-code callback for the interactive flow.
  redirectUri: 'http://localhost:4500/'
};

/** base64url without padding, as used in JWTs. */
function base64url(input) {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Build an unsigned (`alg: none`) JWT with the given payload. oidc-client-ts does not verify
 * the signature, so an empty signature segment is accepted.
 */
export function buildUnsignedJwt(payloadOverrides = {}) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    iss: OIDC_MOCK.issuer,
    aud: OIDC_MOCK.clientId,
    sub: OIDC_MOCK.subject,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
    name: 'Luigi User',
    email: 'luigi.user@example.com',
    ...payloadOverrides
  };
  return `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}.`;
}

// Monotonic counter so every issued token set is unique — lets a test prove that a silent
// renew actually replaced the previous access token.
let tokenIssueCount = 0;

/** A token-endpoint response body. `expiresIn` lets a test force near-immediate expiry. */
export function buildTokenResponse({ expiresIn = 3600, idTokenClaims = {} } = {}) {
  tokenIssueCount += 1;
  return {
    access_token: `mock-access-token-${tokenIssueCount}`,
    id_token: buildUnsignedJwt({ exp: Math.floor(Date.now() / 1000) + expiresIn, ...idTokenClaims }),
    token_type: 'Bearer',
    expires_in: expiresIn,
    scope: 'openid profile email'
  };
}

/**
 * The Luigi `auth` config that wires the real pkce plugin against the mocked endpoints.
 * `win` provides the plugin global exposed by the :4500 app's index.html.
 */
export function buildOidcPkceAuthConfig(win) {
  return {
    use: 'openIdConnect',
    storage: 'localStorage',
    openIdConnect: {
      idpProvider: win.LuigiAuthOIDCPKCE,
      authority: OIDC_MOCK.authority,
      client_id: OIDC_MOCK.clientId,
      scope: 'openid profile email',
      response_type: 'code',
      redirect_uri: OIDC_MOCK.redirectUri,
      silent_redirect_uri: OIDC_MOCK.silentRedirectUri,
      post_logout_redirect_uri: OIDC_MOCK.postLogoutRedirectUri,
      // Skip the discovery + JWKS round-trips entirely.
      metadata: {
        issuer: OIDC_MOCK.issuer,
        authorization_endpoint: OIDC_MOCK.authorizeEndpoint,
        token_endpoint: OIDC_MOCK.tokenEndpoint,
        end_session_endpoint: OIDC_MOCK.endSessionEndpoint
      }
    }
  };
}

/**
 * Register the intercepts that stand in for the IdP. Call before `cy.visit`.
 *
 * Aliases created (for `cy.wait`):
 *   @oidcAuthorize  /authorize redirect (both interactive and silent-renew prompt=none)
 *   @oidcToken      /token PKCE code exchange
 *   @oidcEndSession /endsession logout redirect
 *
 * @param {object} opts
 * @param {number} [opts.tokenExpiresIn] expires_in (seconds) for the /token response.
 */
export function installOidcPkceIntercepts({ tokenExpiresIn = 3600 } = {}) {
  // /authorize — oidc-client-ts appends `redirect_uri`, `state`, and (for silent renew)
  // `prompt=none`. We reflect `state` back so the plugin can round-trip the return path,
  // and redirect to the requested callback with a fake authorization `code`. A single
  // handler covers both the interactive and the silent (prompt=none) flows; the only
  // difference is the callback target, which oidc-client-ts supplies via `redirect_uri`.
  cy.intercept('GET', `${OIDC_MOCK.authorizeEndpoint}*`, (req) => {
    const url = new URL(req.url);
    const state = url.searchParams.get('state') || '';
    const isSilent = url.searchParams.get('prompt') === 'none';
    const callbackBase =
      url.searchParams.get('redirect_uri') || (isSilent ? OIDC_MOCK.silentRedirectUri : OIDC_MOCK.redirectUri);
    const code = isSilent ? 'mock_silent_code' : 'mock_auth_code';
    const separator = callbackBase.includes('?') ? '&' : '?';
    const location = `${callbackBase}${separator}code=${code}&state=${encodeURIComponent(state)}`;

    req.reply({ statusCode: 302, headers: { location } });
  }).as('oidcAuthorize');

  // /token — the PKCE code exchange. Return a fresh token set (with an id_token so the
  // profile is stored). No PKCE verifier check is needed for the mock.
  cy.intercept('POST', `${OIDC_MOCK.tokenEndpoint}*`, (req) => {
    req.reply({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: buildTokenResponse({ expiresIn: tokenExpiresIn })
    });
  }).as('oidcToken');

  // /endsession — the plugin's logout detection keys on the literal `?logout` on the
  // post-logout redirect target, so make sure it is present.
  cy.intercept('GET', `${OIDC_MOCK.endSessionEndpoint}*`, (req) => {
    const url = new URL(req.url);
    const requested = url.searchParams.get('post_logout_redirect_uri') || OIDC_MOCK.postLogoutRedirectUri;
    const location = requested.includes('logout')
      ? requested
      : `${requested}${requested.includes('?') ? '&' : '?'}logout`;
    req.reply({ statusCode: 302, headers: { location } });
  }).as('oidcEndSession');
}
