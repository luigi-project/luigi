import { AuthStoreSvc } from "../../src/services/auth-store.service";
import { ConfigHelpers } from "../../src/utilities/helpers/config-helpers";

describe('Auth-Store Service', () => {
  let mockedStorageType: unknown = undefined;
  let storageGetItemMock: jest.Mock;  
  let storageSetItemMock: jest.Mock;
  let storageRemoveItemMock: jest.Mock;
  let localStorageMock: unknown;
  let sessionStorageMock: unknown;

  beforeEach(() => {
    jest.spyOn(ConfigHelpers, 'getConfigValue').mockImplementation((key) => { 
      if (key === 'auth.storage') {
        return mockedStorageType;
      }
      return undefined;
    });

    storageGetItemMock = jest.fn();
    storageSetItemMock = jest.fn();
    storageRemoveItemMock = jest.fn();

    localStorageMock = {
      getItem: storageGetItemMock,
      setItem: storageSetItemMock,
      removeItem: storageRemoveItemMock,
      type: 'local'
    };

    sessionStorageMock = {
      getItem: storageGetItemMock,
      setItem: storageSetItemMock,
      removeItem: storageRemoveItemMock,
      type: 'session'
    };

    jest.spyOn(window, 'window', 'get').mockImplementation(() => {
      return {
        localStorage: localStorageMock,
        sessionStorage: sessionStorageMock,
      } as unknown as Window & typeof globalThis;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();    
    AuthStoreSvc.reset();
  })

  it('getStorageKey', () => {
    expect(AuthStoreSvc.getStorageKey()).toEqual('luigi.auth');
  });

  it('getStorageType', () => {
    // default
    expect(AuthStoreSvc.getStorageType()).toEqual('localStorage');

    // config
    AuthStoreSvc.reset();
    mockedStorageType = 'someStorage';
    expect(AuthStoreSvc.getStorageType()).toEqual('someStorage');
  });

  it('getAuthData', () => {
    mockedStorageType = 'localStorage';
    const authData = { some: 'object' };
    storageGetItemMock.mockReturnValue(JSON.stringify(authData));
    expect(AuthStoreSvc.getAuthData()).toEqual(authData);
    expect(storageGetItemMock).toHaveBeenCalledWith(AuthStoreSvc.getStorageKey());
  });

  it('setAuthData', () => {    
    mockedStorageType = 'localStorage';
    const authData = { some: 'object' };
    AuthStoreSvc.setAuthData(authData);
    expect(storageSetItemMock).toHaveBeenCalledWith(AuthStoreSvc.getStorageKey(), JSON.stringify(authData));
  });

  it('removeAuthData', () => {    
    mockedStorageType = 'localStorage';
    AuthStoreSvc.removeAuthData();
    expect(storageRemoveItemMock).toHaveBeenCalledWith(AuthStoreSvc.getStorageKey());
  });

  it('isNewlyAuthorized', () => {
    mockedStorageType = 'localStorage';
    let isAuthorized = AuthStoreSvc.isNewlyAuthorized();
    expect(storageGetItemMock).toHaveBeenCalledWith('luigi.newlyAuthorized');
    expect(isAuthorized).toEqual(false);

    storageGetItemMock.mockReturnValue('true');
    isAuthorized = AuthStoreSvc.isNewlyAuthorized();
    expect(isAuthorized).toEqual(true);
  });

  it('setNewlyAuthorized', () => {
    mockedStorageType = 'localStorage';
    AuthStoreSvc.setNewlyAuthorized();
    expect(storageSetItemMock).toHaveBeenCalledWith('luigi.newlyAuthorized', 'true');
  });

  it('removeNewlyAuthorized', () => {
    mockedStorageType = 'localStorage';
    AuthStoreSvc.removeNewlyAuthorized();
    expect(storageRemoveItemMock).toHaveBeenCalledWith('luigi.newlyAuthorized');
  });

  it('_getWebStorage', () => {
    expect(AuthStoreSvc._getWebStorage('localStorage')).toEqual(localStorageMock);
    expect(AuthStoreSvc._getWebStorage('sessionStorage')).toEqual(sessionStorageMock);
  });

  it('_setStore', () => {
    mockedStorageType = 'localStorage';
    AuthStoreSvc._setStore('key', {});
    expect(storageSetItemMock).toHaveBeenCalledWith('key', '{}');

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockedStorageType = 'invalidStorage';
    AuthStoreSvc.reset();
    AuthStoreSvc._setStore('key', {});
    expect(consoleSpy).toHaveBeenCalledWith(AuthStoreSvc['_invalidStorageMsg']);
  });

  it('_getStore', () => {
    mockedStorageType = 'localStorage';
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    AuthStoreSvc._getStore('key');
    expect(storageGetItemMock).toHaveBeenCalledWith('key');
    expect(consoleWarnSpy).toHaveBeenCalled();

    const consoleErrorSpy = jest.spyOn(console, 'error');
    mockedStorageType = 'invalidStorage';
    AuthStoreSvc.reset();
    AuthStoreSvc._getStore('key');
    expect(consoleErrorSpy).toHaveBeenCalledWith(AuthStoreSvc['_invalidStorageMsg']);
  });

  it('_setStore & _getStore for storageType "none"', () => {
    mockedStorageType = 'none';
    const someObject = { foo: 'bar' };

    AuthStoreSvc._setStore('key', someObject);
    expect(AuthStoreSvc._getStore('key')).toEqual(someObject);

    expect(storageGetItemMock).not.toHaveBeenCalled();
    expect(storageSetItemMock).not.toHaveBeenCalled();
    expect(storageRemoveItemMock).not.toHaveBeenCalled();
  });
});
