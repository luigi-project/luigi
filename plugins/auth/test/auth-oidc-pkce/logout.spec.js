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
    signoutRedirectCallback: jest.fn().mockRejectedValue(new Error('no response')),
    signinSilent: jest.fn().mockResolvedValue({})
  })),
  WebStorageStateStore: jest.fn(),
  InMemoryWebStorage: jest.fn()
}));

const { UserManager } = require('oidc-client-ts');

describe('auth-oidc-pkce logout', () => {
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

    it('signoutRedirect method should be called after logout and promise is resolved', async () => {
      plugin.client.signoutRedirect = jest.fn().mockResolvedValue('ok');

      const mockedSignoutData = {
        id_token_hint: '123456',
        url_state: window.location.href
      };
      const mockedAuthOnLogoutFn = jest.fn();
      const signoutRedirectSpy = jest.spyOn(plugin.client, 'signoutRedirect');

      await plugin.logout({ idToken: '123456' }, mockedAuthOnLogoutFn);
      expect.assertions(2);
      expect(mockedAuthOnLogoutFn).toHaveBeenCalled();
      expect(signoutRedirectSpy).toHaveBeenCalledWith(mockedSignoutData);
    });

    it('signoutRedirect method should be called after logout and promise is rejected', async () => {
      plugin.client.signoutRedirect = jest.fn().mockRejectedValue('message');

      const mockedSignoutData = {
        id_token_hint: '123456',
        url_state: window.location.href
      };
      const mockedAuthOnLogoutFn = jest.fn();
      const signoutRedirectSpy = jest.spyOn(plugin.client, 'signoutRedirect');
      const consoleErrorSpy = jest.spyOn(console, 'error');

      await plugin.logout({ idToken: '123456' }, mockedAuthOnLogoutFn);
      expect.assertions(3);
      expect(mockedAuthOnLogoutFn).toHaveBeenCalled();
      expect(signoutRedirectSpy).toHaveBeenCalledWith(mockedSignoutData);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[OIDC] logout() Error', 'message');
    });
  });
});
