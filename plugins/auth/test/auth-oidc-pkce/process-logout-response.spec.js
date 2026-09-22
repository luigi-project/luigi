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

describe('auth-oidc-pkce processLogoutResponse', () => {
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

    it('signoutRedirectCallback method should be called after logout and promise is resolved', async () => {
      plugin.client.signoutRedirectCallback = jest.fn().mockResolvedValue({ state: 'success' });
      window.location.href = 'http://localhost/?logout';

      const signoutRedirectCallbackSpy = jest.spyOn(plugin.client, 'signoutRedirectCallback');
      const luigiAuthSpy = jest.spyOn(global.Luigi, 'auth');

      expect.assertions(3);
      await expect(plugin._processLogoutResponse()).resolves.toEqual({ state: 'success' });
      expect(signoutRedirectCallbackSpy).toHaveBeenCalled();
      expect(luigiAuthSpy).toHaveBeenCalled();
    });

    it('signoutRedirectCallback method should be called after logout and promise is rejected', async () => {
      plugin.client.signoutRedirectCallback = jest.fn().mockRejectedValue(new Error('fail'));
      window.location.href = 'http://localhost/?logout';

      const signoutRedirectCallbackSpy = jest.spyOn(plugin.client, 'signoutRedirectCallback');
      const consoleErrorSpy = jest.spyOn(console, 'error');

      expect.assertions(3);
      await expect(plugin._processLogoutResponse()).rejects.toThrow('fail');
      expect(signoutRedirectCallbackSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('signoutRedirectCallback method should not be called after logout and promise is resolved', async () => {
      plugin.client.signoutRedirectCallback = jest.fn().mockResolvedValue({ state: 'success' });
      window.location.href = 'http://localhost/';

      const signoutRedirectCallbackSpy = jest.spyOn(plugin.client, 'signoutRedirectCallback');

      expect.assertions(2);
      await expect(plugin._processLogoutResponse()).resolves.toEqual(true);
      expect(signoutRedirectCallbackSpy).not.toHaveBeenCalled();
    });
  });
});
