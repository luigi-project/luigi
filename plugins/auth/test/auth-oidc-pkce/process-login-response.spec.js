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
    signoutRedirectCallback: jest.fn().mockResolvedValue({}),
    signinSilent: jest.fn().mockResolvedValue({})
  })),
  WebStorageStateStore: jest.fn(),
  InMemoryWebStorage: jest.fn()
}));

const { UserManager } = require('oidc-client-ts');

describe('auth-oidc-pkce processLoginResponse', () => {
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

  describe('default case', () => {
    let plugin;

    beforeEach(async () => {
      plugin = await new openIdConnect({});
    });

    it('tryToSignIn method should not be called after login and promise is resolved', async () => {
      plugin.tryToSignIn = jest.fn().mockResolvedValue({});
      window.location.search = '?query=test';

      const tryToSignInSpy = jest.spyOn(plugin, 'tryToSignIn');

      await expect(plugin._processLoginResponse()).resolves.toEqual(true);
      expect(tryToSignInSpy).not.toHaveBeenCalled();
    });

    it('tryToSignIn method should be called after login and promise is resolved with error', () => {
      plugin.tryToSignIn = jest.fn().mockResolvedValue({ error: true });
      window.location.search = '?query=code';

      const tryToSignInSpy = jest.spyOn(plugin, 'tryToSignIn');
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const luigiAuthSpy = jest.spyOn(global.Luigi, 'auth');

      plugin._processLoginResponse().then((result) => {
        expect(tryToSignInSpy).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(luigiAuthSpy).not.toHaveBeenCalled();
        expect(result).toEqual(true);
      });
    });

    it('tryToSignIn method should be called after login and promise is resolved without error', () => {
      plugin.tryToSignIn = jest.fn().mockResolvedValue({});
      window.location.search = '?query=code';

      const tryToSignInSpy = jest.spyOn(plugin, 'tryToSignIn');
      const luigiAuthSpy = jest.spyOn(global.Luigi, 'auth');

      plugin._processLoginResponse().then((result) => {
        expect(tryToSignInSpy).toHaveBeenCalled();
        expect(luigiAuthSpy).not.toHaveBeenCalled();
        expect(result).toEqual(true);
      });
    });

    it('tryToSignIn method should be called after login and promise is rejected', () => {
      plugin.tryToSignIn = jest.fn().mockRejectedValue(new Error('failure'));
      window.location.search = '?query=code';

      const tryToSignInSpy = jest.spyOn(plugin, 'tryToSignIn');
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const luigiAuthSpy = jest.spyOn(global.Luigi, 'auth');

      plugin._processLoginResponse().then((result) => {
        expect(tryToSignInSpy).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith('[OIDC] tryToSignIn Error Error: failure');
        expect(luigiAuthSpy).toHaveBeenCalledTimes(2);
        expect(result).toEqual(true);
      });
    });
  });
});
