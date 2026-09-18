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

describe('auth-oidc-pkce login', () => {
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

    it('signinRedirect method should be called after login and promise is resolved', async () => {
      plugin.client.signinRedirect = jest.fn().mockResolvedValue('ok');

      const signinRedirectSpy = jest.spyOn(plugin.client, 'signinRedirect');

      await plugin.login();
      expect.assertions(1);
      expect(signinRedirectSpy).toHaveBeenCalledWith({ state: window.location.href });
    });

    it('signinRedirect method should be called after login and promise is rejected', async () => {
      plugin.client.signinRedirect = jest.fn().mockRejectedValue('message');

      const signinRedirectSpy = jest.spyOn(plugin.client, 'signinRedirect');
      const consoleErrorSpy = jest.spyOn(console, 'error');

      await plugin.login();
      expect.assertions(2);
      expect(signinRedirectSpy).toHaveBeenCalledWith({ state: window.location.href });
      expect(consoleErrorSpy).toHaveBeenCalledWith('[OIDC] login() Error', 'message');
    });
  });
});
