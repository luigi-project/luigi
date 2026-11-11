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

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('tryToSignIn method should not be called after login and promise is resolved', async () => {
      plugin.tryToSignIn = jest.fn().mockResolvedValue({});
      window.location.search = '?query=test';

      const tryToSignInSpy = jest.spyOn(plugin, 'tryToSignIn');

      expect.assertions(2);
      await expect(plugin._processLoginResponse()).resolves.toEqual(true);
      expect(tryToSignInSpy).not.toHaveBeenCalled();
    });

    it('tryToSignIn method should be called after login and promise is resolved with error', async () => {
      plugin.tryToSignIn = jest.fn().mockResolvedValue({ error: true });
      window.location.search = '?query=code';

      const tryToSignInSpy = jest.spyOn(plugin, 'tryToSignIn');
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const luigiAuthSpy = jest.spyOn(global.Luigi, 'auth');

      expect.assertions(4);
      await expect(plugin._processLoginResponse()).resolves.toEqual(false);
      expect(tryToSignInSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(luigiAuthSpy).not.toHaveBeenCalled();
    });

    it('tryToSignIn method should be called after login and promise is resolved without error', async () => {
      plugin.tryToSignIn = jest.fn().mockResolvedValue({});
      window.location.search = '?query=code';

      const tryToSignInSpy = jest.spyOn(plugin, 'tryToSignIn');
      const luigiAuthSpy = jest.spyOn(global.Luigi, 'auth');

      expect.assertions(3);
      await expect(plugin._processLoginResponse()).resolves.toEqual(true);
      expect(tryToSignInSpy).toHaveBeenCalled();
      expect(luigiAuthSpy).not.toHaveBeenCalled();
    });

    it('tryToSignIn method should be called after login and promise is rejected', async () => {
      plugin.tryToSignIn = jest.fn().mockRejectedValue(new Error('failure'));
      window.location.search = '?query=code';

      const tryToSignInSpy = jest.spyOn(plugin, 'tryToSignIn');
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const luigiAuthSpy = jest.spyOn(global.Luigi, 'auth');

      expect.assertions(4);
      await expect(plugin._processLoginResponse()).rejects.toThrow('failure');
      expect(tryToSignInSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(luigiAuthSpy).toHaveBeenCalledTimes(2);
    });
  });
});
