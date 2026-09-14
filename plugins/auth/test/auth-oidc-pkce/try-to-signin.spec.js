import openIdConnect from '../../src/auth-oidc-pkce/index.js';

// Capture the callbacks the plugin registers on the UserManager events, so we
// can invoke them directly and assert what handleAuthEvent gets called with.
const eventCallbacks = {};
const mockedUser = {
  access_token: 'abcdef',
  expires_at: 1000,
  id_token: '123456',
  profile: {
    auth_time: 100,
    nonce: 'dhfghdfgdfgw4523wsdfsd'
  },
  session_state: null,
  scope: 'test'
};

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
    signinRedirectCallback: jest.fn().mockResolvedValue(mockedUser),
    signinSilent: jest.fn().mockResolvedValue(mockedUser)
  })),
  WebStorageStateStore: jest.fn(),
  InMemoryWebStorage: jest.fn()
}));

const { UserManager } = require('oidc-client-ts');

describe('auth-oidc-pkce tryToSignIn', () => {
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

    it('signinRedirectCallback method should be called after signing in and promise is resolved', () => {
      const signinRedirectCallbackSpy = jest.spyOn(plugin.client, 'signinRedirectCallback');
      const signinSilentSpy = jest.spyOn(plugin.client, 'signinSilent');
      const consoleDebugSpy = jest.spyOn(console, 'debug');

      plugin.tryToSignIn().then((result) => {
        expect(signinRedirectCallbackSpy).toHaveBeenCalled();
        expect(signinSilentSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).toHaveBeenCalledWith('[OIDC] User was redirected via the sign-in page. Now signed in.');
        expect(result).toEqual(mockedUser);
      });
    });

    it('signinRedirectCallback method should be called after signing in and promise is rejected', () => {
      plugin.client.signinRedirectCallback = jest.fn().mockRejectedValue(new Error('No response.'));

      const signinRedirectCallbackSpy = jest.spyOn(plugin.client, 'signinRedirectCallback');
      const signinSilentSpy = jest.spyOn(plugin.client, 'signinSilent');
      const consoleDebugSpy = jest.spyOn(console, 'debug');

      plugin.tryToSignIn().then((result) => {
        expect(signinRedirectCallbackSpy).toHaveBeenCalled();
        expect(signinSilentSpy).toHaveBeenCalled();
        expect(consoleDebugSpy.mock.calls).toContainEqual(['[OIDC] Silent sign-in completed.']);
        expect(result).toEqual(mockedUser);
      });
    });
  });
});
