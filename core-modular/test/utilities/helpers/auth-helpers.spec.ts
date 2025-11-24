import { LuigiAuth } from '../../../src/core-api/auth';
import { AuthStoreSvc } from '../../../src/services/auth-store.service';
import { AuthHelpers } from '../../../src/utilities/helpers/auth-helpers';

describe('AuthHelpers', () => {
  let authDataMock: unknown = undefined;
  let getAuthDataSpy: jest.SpyInstance;

  beforeEach(() => {
    getAuthDataSpy = jest.spyOn(AuthStoreSvc, 'getAuthData').mockImplementation(() => {
      return authDataMock;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('isLoggedIn no authdata', () => {
    expect(AuthHelpers.getStoredAuthData()).toBeUndefined();
    const loggedIn = AuthHelpers.isLoggedIn();
    expect(getAuthDataSpy).toHaveBeenCalled();
    expect(loggedIn).toEqual(false);
  });

  it('isLoggedIn expired authdata', () => {
    authDataMock = { accessTokenExpirationDate: 0 };
    expect(AuthHelpers.getStoredAuthData().accessTokenExpirationDate).toEqual(0);
    const loggedIn = AuthHelpers.isLoggedIn();
    expect(getAuthDataSpy).toHaveBeenCalled();
    expect(loggedIn).toEqual(false);
  });

  it('isLoggedIn valid authdata', () => {
    const exp = new Date().getTime() + 5000;
    authDataMock = { accessTokenExpirationDate: exp };    
    expect(AuthHelpers.getStoredAuthData().accessTokenExpirationDate).toEqual(exp);
    const loggedIn = AuthHelpers.isLoggedIn();
    expect(getAuthDataSpy).toHaveBeenCalled();
    expect(loggedIn).toEqual(true);
  });

  it('parseUrlAuthErrors', () => {
    const location = { search: '' };
    jest.spyOn(window, 'window', 'get').mockImplementation(() => {
      return {
        location
      } as Window & typeof globalThis;
    });
    
    expect(AuthHelpers.parseUrlAuthErrors()).toBeUndefined();

    location.search = '?error=ERROR&errorDescription=DESC';

    expect(AuthHelpers.parseUrlAuthErrors()).toEqual({ error: 'ERROR', errorDescription: 'DESC'});
  });

  it('handleUrlAuthErrors', () => {
    const providerInstanceSettings = { 
      logoutUrl: 'lo',
      post_logout_redirect_uri: 'plor'
    };
    const handleAuthEventSpy = jest.spyOn(LuigiAuth, 'handleAuthEvent').mockImplementation();
    AuthHelpers.handleUrlAuthErrors(providerInstanceSettings, 'error', 'errorDescription');
    expect(handleAuthEventSpy).toHaveBeenCalledWith(
      'onAuthError', 
      providerInstanceSettings, 
      { error: 'error', errorDescription: 'errorDescription'},
      'lo?post_logout_redirect_uri=plor&error=error&errorDescription=errorDescription'
    );

    expect(AuthHelpers.handleUrlAuthErrors(providerInstanceSettings, undefined, undefined)).resolves.toBe(true);
  });
});
