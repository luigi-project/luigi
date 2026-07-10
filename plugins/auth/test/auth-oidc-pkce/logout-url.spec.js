import openIdConnect from '../../src/auth-oidc-pkce/index.js';

// Capture the callbacks the plugin registers on the UserManager events, so we
// can invoke them directly and assert what handleAuthEvent gets called with.
const eventCallbacks = {};

jest.mock('oidc-client-ts', () => ({
  UserManager: jest.fn().mockImplementation((settings) => ({
    settings,
    events: {
      addUserLoaded: jest.fn((cb) => {
        eventCallbacks.userLoaded = cb;
      }),
      addAccessTokenExpired: jest.fn((cb) => {
        eventCallbacks.accessTokenExpired = cb;
      }),
      addAccessTokenExpiring: jest.fn((cb) => {
        eventCallbacks.accessTokenExpiring = cb;
      }),
      addSilentRenewError: jest.fn((cb) => {
        eventCallbacks.silentRenewError = cb;
      })
    },
    signinRedirectCallback: jest.fn().mockRejectedValue(new Error('no response')),
    signinSilent: jest.fn().mockResolvedValue({})
  })),
  WebStorageStateStore: jest.fn(),
  InMemoryWebStorage: jest.fn()
}));

const { UserManager } = require('oidc-client-ts');

describe('auth-oidc-pkce logoutUrl', () => {
  let handleAuthEventSpy;

  beforeEach(() => {
    UserManager.mockClear();
    for (const key of Object.keys(eventCallbacks)) delete eventCallbacks[key];
    handleAuthEventSpy = jest.fn();
    global.Luigi.auth = jest.fn(() => ({
      store: { setAuthData: jest.fn(), removeAuthData: jest.fn() },
      handleAuthEvent: handleAuthEventSpy
    }));
  });

  describe('default value', () => {
    it('falls back to post_logout_redirect_uri when logoutUrl is not set', async () => {
      await new openIdConnect({ post_logout_redirect_uri: 'https://app.example.com/bye' });

      const passed = UserManager.mock.calls[0][0];
      expect(passed.logoutUrl).toBe('https://app.example.com/bye');
    });

    it('falls back to the built-in default when neither is set', async () => {
      await new openIdConnect({});

      const passed = UserManager.mock.calls[0][0];
      expect(passed.logoutUrl).toBe(window.location.origin + '/logout.html');
    });

    it('keeps logoutUrl independent from post_logout_redirect_uri when both are set', async () => {
      await new openIdConnect({
        post_logout_redirect_uri: 'https://idp.example.com/endsession',
        logoutUrl: 'https://app.example.com/logout'
      });

      const passed = UserManager.mock.calls[0][0];
      expect(passed.post_logout_redirect_uri).toBe('https://idp.example.com/endsession');
      expect(passed.logoutUrl).toBe('https://app.example.com/logout');
    });

    it('prepends origin for a relative logoutUrl', async () => {
      await new openIdConnect({ logoutUrl: '/internal/logout' });

      const passed = UserManager.mock.calls[0][0];
      expect(passed.logoutUrl).toBe(window.location.origin + '/internal/logout');
    });
  });

  describe('error-redirect routing', () => {
    it('setTokenExpirationAction: addAccessTokenExpired uses logoutUrl (not post_logout_redirect_uri)', async () => {
      const plugin = await new openIdConnect({
        post_logout_redirect_uri: 'https://idp.example.com/endsession',
        logoutUrl: 'https://app.example.com/logout'
      });
      plugin.setTokenExpirationAction();

      eventCallbacks.accessTokenExpired();

      expect(handleAuthEventSpy).toHaveBeenCalledWith(
        'onAuthExpired',
        expect.any(Object),
        undefined,
        'https://app.example.com/logout?error=tokenExpired'
      );
    });

    it('setTokenExpirationAction: silent-renew known error uses logoutUrl', async () => {
      const plugin = await new openIdConnect({
        post_logout_redirect_uri: 'https://idp.example.com/endsession',
        logoutUrl: 'https://app.example.com/logout'
      });
      plugin.setTokenExpirationAction();

      eventCallbacks.silentRenewError({ message: 'login_required' });

      expect(handleAuthEventSpy).toHaveBeenCalledWith(
        'onAuthError',
        expect.any(Object),
        expect.any(Object),
        'https://app.example.com/logout?error=tokenExpired&errorDescription=login_required'
      );
    });

    it('setTokenExpirationAction: silent-renew unknown error uses logoutUrl', async () => {
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const plugin = await new openIdConnect({
        post_logout_redirect_uri: 'https://idp.example.com/endsession',
        logoutUrl: 'https://app.example.com/logout'
      });
      plugin.setTokenExpirationAction();

      eventCallbacks.silentRenewError({ message: 'network_down' });

      expect(handleAuthEventSpy).toHaveBeenCalledWith(
        'onAuthError',
        expect.any(Object),
        expect.any(Object),
        'https://app.example.com/logout?error=tokenExpired&errorDescription=network_down'
      );
      errSpy.mockRestore();
    });

    it('setTokenExpirationAction: skips addAccessTokenExpired handler when automaticSilentRenew is true', async () => {
      const plugin = await new openIdConnect({
        automaticSilentRenew: true,
        logoutUrl: 'https://app.example.com/logout'
      });
      plugin.setTokenExpirationAction();

      expect(eventCallbacks.accessTokenExpired).toBeUndefined();
      // silent-renew error handler must still be registered
      expect(eventCallbacks.silentRenewError).toBeDefined();
    });

    it('collapse fallback: without logoutUrl, error redirect still uses post_logout_redirect_uri', async () => {
      const plugin = await new openIdConnect({ post_logout_redirect_uri: 'https://app.example.com/bye' });
      plugin.setTokenExpirationAction();

      eventCallbacks.accessTokenExpired();

      expect(handleAuthEventSpy).toHaveBeenCalledWith(
        'onAuthExpired',
        expect.any(Object),
        undefined,
        'https://app.example.com/bye?error=tokenExpired'
      );
    });
  });
});
