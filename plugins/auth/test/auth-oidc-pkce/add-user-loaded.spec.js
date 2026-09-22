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

describe('auth-oidc-pkce addUserLoaded', () => {
  let handleAuthEventSpy;

  beforeEach(() => {
    UserManager.mockClear();
    for (const key of Object.keys(eventCallbacks)) delete eventCallbacks[key];
    handleAuthEventSpy = jest.fn();
    global.Luigi.executeConfigFnAsync = jest.fn((prop, error, params) => {
      return {
        auth_time: params['auth_time'],
        nonce: params['nonce']
      };
    });
    global.Luigi.auth = jest.fn(() => ({
      store: { setAuthData: jest.fn(), removeAuthData: jest.fn() },
      handleAuthEvent: handleAuthEventSpy
    }));
  });

  describe('executeConfigFnAsync', () => {
    let plugin;

    beforeEach(async () => {
      plugin = await new openIdConnect({});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should accept the payload and execute interceptor function when "profileStorageInterceptorFn" is configured', async () => {
      global.Luigi.getConfigValue.mockReturnValue(jest.fn());

      const mockedPayload = {
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
      const addUserLoadedSpy = jest.spyOn(plugin.client.events, 'addUserLoaded');
      const executeConfigFnSpy = jest.spyOn(global.Luigi, 'executeConfigFnAsync');
      const luigiAuthSpy = jest.spyOn(global.Luigi, 'auth');
      const postMessageSpy = jest.spyOn(window, 'postMessage');

      expect.assertions(4);
      expect(addUserLoadedSpy).toHaveBeenCalled();
      await eventCallbacks.userLoaded(mockedPayload);
      expect(executeConfigFnSpy).toHaveBeenCalledWith('auth.openIdConnect.profileStorageInterceptorFn', true, {
        auth_time: mockedPayload.profile['auth_time'],
        nonce: mockedPayload.profile['nonce']
      });
      expect(luigiAuthSpy).toHaveBeenCalled();
      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          authData: {
            accessToken: mockedPayload['access_token'],
            accessTokenExpirationDate: mockedPayload['expires_at'] * 1000,
            idToken: mockedPayload['id_token'],
            profile: {
              auth_time: mockedPayload.profile['auth_time'],
              nonce: mockedPayload.profile['nonce']
            },
            scope: mockedPayload['scope']
          },
          msg: 'luigi.auth.tokenIssued'
        },
        'http://localhost'
      );
    });

    it('should accept the payload and not execute interceptor function when "profileStorageInterceptorFn" is not configured', async () => {
      global.Luigi.getConfigValue.mockReturnValue(undefined);

      const mockedPayload = {
        access_token: 'abcdef',
        expires_at: 1000,
        id_token: '123456',
        profile: {
          auth_time: 200,
          nonce: 'dhfghdfgdfgw4523wsdfsd'
        },
        session_state: null,
        scope: 'test'
      };
      const addUserLoadedSpy = jest.spyOn(plugin.client.events, 'addUserLoaded');
      const executeConfigFnSpy = jest.spyOn(global.Luigi, 'executeConfigFnAsync');
      const luigiAuthSpy = jest.spyOn(global.Luigi, 'auth');
      const postMessageSpy = jest.spyOn(window, 'postMessage');

      expect.assertions(4);
      expect(addUserLoadedSpy).toHaveBeenCalled();
      await eventCallbacks.userLoaded(mockedPayload);
      expect(executeConfigFnSpy).not.toHaveBeenCalled();
      expect(luigiAuthSpy).toHaveBeenCalled();
      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          authData: {
            accessToken: mockedPayload['access_token'],
            accessTokenExpirationDate: mockedPayload['expires_at'] * 1000,
            idToken: mockedPayload['id_token'],
            profile: {
              auth_time: mockedPayload.profile['auth_time'],
              nonce: mockedPayload.profile['nonce']
            },
            scope: mockedPayload['scope']
          },
          msg: 'luigi.auth.tokenIssued'
        },
        'http://localhost'
      );
    });

    it('should accept the payload and not execute interceptor function when profile data is missing', async () => {
      global.Luigi.getConfigValue.mockReturnValue(jest.fn());

      const mockedPayload = {
        access_token: 'abcdef',
        expires_at: 1000,
        id_token: '123456',
        session_state: null,
        scope: 'test'
      };
      const addUserLoadedSpy = jest.spyOn(plugin.client.events, 'addUserLoaded');
      const executeConfigFnSpy = jest.spyOn(global.Luigi, 'executeConfigFnAsync');
      const luigiAuthSpy = jest.spyOn(global.Luigi, 'auth');
      const postMessageSpy = jest.spyOn(window, 'postMessage');

      expect.assertions(4);
      expect(addUserLoadedSpy).toHaveBeenCalled();
      await eventCallbacks.userLoaded(mockedPayload);
      expect(executeConfigFnSpy).not.toHaveBeenCalled();
      expect(luigiAuthSpy).toHaveBeenCalled();
      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          authData: {
            accessToken: mockedPayload['access_token'],
            accessTokenExpirationDate: mockedPayload['expires_at'] * 1000,
            idToken: mockedPayload['id_token'],
            profile: undefined,
            scope: mockedPayload['scope']
          },
          msg: 'luigi.auth.tokenIssued'
        },
        'http://localhost'
      );
    });

    it('should accept the payload and handle case for "idTokenExpirationDate" property if ID token is correct', async () => {
      global.Luigi.getConfigValue.mockReturnValue(undefined);

      const mockedPayload = {
        access_token: undefined,
        expires_at: 1000,
        id_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vbXktZG9tYWluLmF1dGgwLmNvbSIsInN1YiI6ImF1dGgwfDEyMzQ1NiIsImF1ZCI6IjEyMzRhYmNkZWYiLCJleHAiOjEzMTEyODE5NzAsImlhdCI6MTMxMTI4MDk3MCwibmFtZSI6IkphbmUgRG9lIiwiZ2l2ZW5fbmFtZSI6IkphbmUiLCJmYW1pbHlfbmFtZSI6IkRvZSJ9.bql-jxlG9B_bielkqOnjTY9Di9FillFb6IMQINXoYsw',
        profile: {
          auth_time: 300,
          nonce: 'dhfghdfgdfgw4523wsdfsd'
        },
        session_state: null,
        scope: 'test'
      };
      const addUserLoadedSpy = jest.spyOn(plugin.client.events, 'addUserLoaded');
      const executeConfigFnSpy = jest.spyOn(global.Luigi, 'executeConfigFnAsync');
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const luigiAuthSpy = jest.spyOn(global.Luigi, 'auth');
      const postMessageSpy = jest.spyOn(window, 'postMessage');

      expect.assertions(5);
      expect(addUserLoadedSpy).toHaveBeenCalled();
      await eventCallbacks.userLoaded(mockedPayload);
      expect(executeConfigFnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(luigiAuthSpy).toHaveBeenCalled();
      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          authData: {
            accessToken: mockedPayload['access_token'],
            accessTokenExpirationDate: JSON.parse(atob(mockedPayload['id_token'].split('.')[1])).exp * 1000,
            idToken: mockedPayload['id_token'],
            idTokenExpirationDate: JSON.parse(atob(mockedPayload['id_token'].split('.')[1])).exp * 1000,
            profile: {
              auth_time: mockedPayload.profile['auth_time'],
              nonce: mockedPayload.profile['nonce']
            },
            scope: mockedPayload['scope']
          },
          msg: 'luigi.auth.tokenIssued'
        },
        'http://localhost'
      );
    });

    it('should accept the payload and handle case for "idTokenExpirationDate" property if ID token is incorrect', async () => {
      global.Luigi.getConfigValue.mockReturnValue(undefined);

      const mockedPayload = {
        access_token: undefined,
        expires_at: 1000,
        id_token: '123456',
        profile: {
          auth_time: 400,
          nonce: 'dhfghdfgdfgw4523wsdfsd'
        },
        session_state: null,
        scope: 'test'
      };
      const addUserLoadedSpy = jest.spyOn(plugin.client.events, 'addUserLoaded');
      const executeConfigFnSpy = jest.spyOn(global.Luigi, 'executeConfigFnAsync');
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const luigiAuthSpy = jest.spyOn(global.Luigi, 'auth');
      const postMessageSpy = jest.spyOn(window, 'postMessage');

      expect.assertions(5);
      expect(addUserLoadedSpy).toHaveBeenCalled();
      await eventCallbacks.userLoaded(mockedPayload);
      expect(executeConfigFnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(luigiAuthSpy).toHaveBeenCalled();
      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          authData: {
            accessToken: mockedPayload['access_token'],
            accessTokenExpirationDate: mockedPayload['expires_at'] * 1000,
            idToken: mockedPayload['id_token'],
            profile: {
              auth_time: mockedPayload.profile['auth_time'],
              nonce: mockedPayload.profile['nonce']
            },
            scope: mockedPayload['scope']
          },
          msg: 'luigi.auth.tokenIssued'
        },
        'http://localhost'
      );
    });
  });
});
