import { LuigiAuth } from "../../src/core-api/auth";
import type { Luigi } from "../../src/core-api/luigi";
import { AuthLayerSvc } from "../../src/services/auth-layer.service";
import { AuthStoreSvc } from "../../src/services/auth-store.service";
import { ConfigHelpers } from "../../src/utilities/helpers/config-helpers";

describe('Auth', () => {
  let auth_use: string | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(ConfigHelpers, 'getConfigValue').mockImplementation((key) => {
      if (key === 'auth.use') {
        return auth_use;
      } 

      return undefined;
    });
    auth_use = undefined;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('isAuthorizationEnabled', () => {
      expect(LuigiAuth.isAuthorizationEnabled()).toEqual(false);

      auth_use = 'someIDP';
      expect(LuigiAuth.isAuthorizationEnabled()).toEqual(true);
  });

  it('login', () => {
    const startAuthorizationSpy = jest.spyOn(AuthLayerSvc, 'startAuthorization');

    LuigiAuth.login();
    expect(startAuthorizationSpy).not.toHaveBeenCalled();

    auth_use = 'someIDP';
    LuigiAuth.login();
    expect(startAuthorizationSpy).toHaveBeenCalled();
  });

  it('logout', () => {
    const logoutSpy = jest.spyOn(AuthLayerSvc, 'logout').mockImplementation();

    LuigiAuth.logout();
    expect(logoutSpy).not.toHaveBeenCalled();

    auth_use = 'someIDP';
    LuigiAuth.logout();
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('handleAuthEvent', async () => {
    const cfgFnMock = jest.spyOn(ConfigHelpers, 'executeConfigFnAsync').mockImplementation();
    LuigiAuth.handleAuthEvent('onAuthWhatever', {});

    cfgFnMock.mockImplementation(() => {
      return Promise.resolve(true);
    });
    LuigiAuth.handleAuthEvent('onAuthWhatever', {}, undefined, '/redirect');
  });

  it('get store', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    let store = LuigiAuth.store;
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

    jest.spyOn(ConfigHelpers, 'getLuigi').mockImplementation(() => {
      return {
        initialized: true
      } as unknown as Luigi;
    });
    store = LuigiAuth.store;    
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

    const spysToExecute = [];
    spysToExecute.push(jest.spyOn(AuthStoreSvc, 'getStorageKey').mockImplementation());
    spysToExecute.push(jest.spyOn(AuthStoreSvc, 'getStorageType').mockImplementation());
    spysToExecute.push(jest.spyOn(AuthStoreSvc, 'getAuthData').mockImplementation());
    spysToExecute.push(jest.spyOn(AuthStoreSvc, 'setAuthData').mockImplementation());
    spysToExecute.push(jest.spyOn(AuthStoreSvc, 'removeAuthData').mockImplementation());
    spysToExecute.push(jest.spyOn(AuthStoreSvc, 'setNewlyAuthorized').mockImplementation());
    spysToExecute.push(jest.spyOn(AuthLayerSvc, 'resetExpirationChecks').mockImplementation());

    store.getStorageKey();
    store.getStorageType();
    store.getAuthData();
    store.setAuthData({});
    store.removeAuthData();
    store.setNewlyAuthorized();

    spysToExecute.forEach((spy) => {
      expect(spy).toHaveBeenCalledTimes(1);
    })
  });
});
