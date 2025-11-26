import { LuigiAuth } from "../../src/core-api/auth";
import type { Luigi } from "../../src/core-api/luigi";
import { AuthLayerSvc } from "../../src/services/auth-layer.service";
import { AuthStoreSvc } from "../../src/services/auth-store.service";
import { AuthHelpers } from "../../src/utilities/helpers/auth-helpers";
import { ConfigHelpers } from "../../src/utilities/helpers/config-helpers";
import { get } from "../../src/utilities/store";

describe('Auth-Layer Service', () => {
  let auth_use: string | undefined;
  let auth_disableAutoLogin = false;
  let profileLogoutFn: unknown;
  let customIdpLogoutFn: unknown;
  let locationMock = { search: '' };
  let providerInstanceSettings: Record<string, unknown> = {
    logoutUrl: 'lo',
    post_logout_redirect_uri: 'plor'
  };
  let getConfigValue: jest.Mock;
  let getConfigValueAsync: jest.Mock;
  let getEngine: jest.Mock;

  let onAuthConfigErrorFn: jest.Mock | undefined;
  let onAuthSuccessfulFn: jest.Mock | undefined;

  beforeEach(() => {
    getConfigValue = jest.fn();
    getConfigValueAsync = jest.fn();
    getEngine = jest.fn();
    
    jest.spyOn(ConfigHelpers, 'getLuigi').mockImplementation(() => {
      return {
          getConfigValue,
          getConfigValueAsync,
          getEngine
      } as unknown as Luigi;
    });
    jest.spyOn(ConfigHelpers, 'getConfigValue').mockImplementation((key) => {
      if (key === 'auth.use') {
        return auth_use;
      } else if (key === 'auth.myProvider') {
        return providerInstanceSettings;
      } else if (key === 'auth.storage') {
        return 'none';
      } else if (key === 'auth.events.onAuthConfigError') {
        return onAuthConfigErrorFn;
      } else if (key === 'auth.disableAutoLogin') {
        return auth_disableAutoLogin;
      } else if (key === 'auth.myIDPWithCustomLogout.logoutFn') {
        return customIdpLogoutFn;
      } else if (key === 'auth.events.onAuthSuccessful') {
        return onAuthSuccessfulFn;
      }
     
      return undefined;
    });
    jest.spyOn(ConfigHelpers, 'getConfigValueAsync').mockImplementation((key) => {
      if (key === 'navigation.profile.logout.customLogoutFn') {
        return profileLogoutFn;
      }
      return undefined;
    });
    onAuthConfigErrorFn = undefined;
    onAuthSuccessfulFn = undefined;
    locationMock = { search: '' };
    auth_use = undefined;
    profileLogoutFn = undefined;
    customIdpLogoutFn = undefined;
    auth_disableAutoLogin = false;
    providerInstanceSettings = {
      logoutUrl: 'lo',
      post_logout_redirect_uri: 'plor'
    };
    jest.spyOn(window, 'window', 'get').mockImplementation(() => {
      return {
        location: locationMock
      } as Window & typeof globalThis;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    AuthLayerSvc.idpProviderInstance = undefined;
  });


  it('set/get/subscribe UserInfo', () => {
    const uinfoSubMock = jest.fn();
    const uinfo = { user: 'info' };
    AuthLayerSvc.setUserInfo(uinfo);
    AuthLayerSvc.getUserInfoStore().subscribe(uinfoSubMock);

    expect(uinfoSubMock).toHaveBeenCalledWith(uinfo);
    expect(get(AuthLayerSvc.getUserInfoStore())).toEqual(uinfo);

    AuthLayerSvc.setUserInfo(undefined);
    expect(uinfoSubMock).toHaveBeenCalledWith(undefined);
    expect(get(AuthLayerSvc.getUserInfoStore())).toEqual(undefined);
  });

  it('set/get/subscribe LoggedIn', () => {
    const loggedinSubMock = jest.fn();
    AuthLayerSvc.setLoggedIn(true);
    AuthLayerSvc.getLoggedInStore().subscribe(loggedinSubMock);

    expect(loggedinSubMock).toHaveBeenCalledWith(true);
    expect(get(AuthLayerSvc.getLoggedInStore())).toEqual(true);

    AuthLayerSvc.setLoggedIn(false);
    expect(loggedinSubMock).toHaveBeenCalledWith(false);
    expect(get(AuthLayerSvc.getLoggedInStore())).toEqual(false);
  });

  describe('Init & checkAuth', () => {
    it('init without auth config', () => {
      expect(AuthLayerSvc.init()).resolves.toEqual(true);
    });

    it('init with url errors', async () => {
      auth_use = 'myProvider';
      locationMock = { search: '?error=error&errorDescription=errorDescription' };
      const handleAuthEventSpy = jest.spyOn(LuigiAuth, 'handleAuthEvent').mockImplementation();

      expect(AuthLayerSvc.init()).resolves.toEqual(undefined);
      expect(handleAuthEventSpy).toHaveBeenCalledWith(
        'onAuthError',
        providerInstanceSettings,
        { error: 'error', errorDescription: 'errorDescription' },
        'lo?post_logout_redirect_uri=plor&error=error&errorDescription=errorDescription'
      );
    });

    it('init with no idpProviderInstance', async () => {
      auth_use = 'myProvider';      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      await AuthLayerSvc.init();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('init with valid idpProviderInstance and valid session', async () => {
      auth_use = 'myProvider';
      const loginFn = jest.fn();
      const setTokenExpirationActionFn = jest.fn();
      const setTokenExpireSoonActionFn = jest.fn();

      providerInstanceSettings.idpProvider = class {
        constructor(private settings: unknown) {}

        login () {
          loginFn();
          return new Promise((resolve) => {
            resolve(undefined);
          })
        }

        setTokenExpirationAction () {
          setTokenExpirationActionFn();
        }

        setTokenExpireSoonAction () {
          setTokenExpireSoonActionFn(); 
        }

        userInfo (settings: unknown) {
          return new Promise((resolve) => {
            if (settings) {
              resolve({ name: 'Luigi' });
            }
          });
        }
      }

      jest.spyOn(AuthHelpers, 'getStoredAuthData').mockReturnValue({
        accessTokenExpirationDate: new Date().getTime() + 5000
      });
      
      await AuthLayerSvc.init();
      expect(loginFn).not.toHaveBeenCalled();
      expect(AuthStoreSvc.isNewlyAuthorized()).toBe(false);
      expect(setTokenExpirationActionFn).toHaveBeenCalled();
      expect(setTokenExpireSoonActionFn).toHaveBeenCalled();
      expect(get(AuthLayerSvc.getLoggedInStore())).toEqual(true);
      expect(get(AuthLayerSvc.getUserInfoStore())).toEqual( { name: 'Luigi'});

      AuthLayerSvc.idpProviderInstance = undefined;
      providerInstanceSettings.userInfoFn = () => {
        return new Promise((resolve) => {
          resolve({ name: 'Mario' });
        });
      }
      await AuthLayerSvc.init();
      expect(get(AuthLayerSvc.getUserInfoStore())).toEqual( { name: 'Mario'});
    });

    it('init with valid idpProviderInstance and valid session and newly authorized', async () => {
      auth_use = 'myProvider';
      const loginFn = jest.fn();
      onAuthSuccessfulFn = jest.fn();

      providerInstanceSettings.idpProvider = class {
        constructor(private settings: unknown) {}

        login () {
          loginFn();
          return new Promise((resolve) => {
            resolve(undefined);
          })
        }
      }

      jest.spyOn(AuthHelpers, 'getStoredAuthData').mockReturnValue({
        accessTokenExpirationDate: new Date().getTime() + 5000
      });

      jest.spyOn(AuthStoreSvc, 'isNewlyAuthorized').mockReturnValueOnce(true);
      
      await AuthLayerSvc.init();
      expect(loginFn).not.toHaveBeenCalled();
      expect(AuthStoreSvc.isNewlyAuthorized()).toBe(false);
      expect(onAuthSuccessfulFn).toHaveBeenCalled();
      expect(get(AuthLayerSvc.getLoggedInStore())).toEqual(true);
    });

    it('init with valid idpProviderInstance and expired session', async () => {
      auth_use = 'myProvider';
      const loginFn = jest.fn();

      providerInstanceSettings.idpProvider = class {
        constructor(private settings: unknown) {}

        login () {
          loginFn();
          return new Promise((resolve) => {
            resolve(undefined);
          })
        }
      }

      jest.spyOn(AuthHelpers, 'getStoredAuthData').mockReturnValue({
        accessTokenExpirationDate: 0
      });
      
      await AuthLayerSvc.init();
      expect(loginFn).toHaveBeenCalled();
      expect(AuthStoreSvc.isNewlyAuthorized()).toBe(true);
    });

    it('init with disableAutoLogin', async () => {
      auth_use = 'myProvider';
      auth_disableAutoLogin = true;
      const loginFn = jest.fn();

      providerInstanceSettings.idpProvider = class {
        constructor(private settings: unknown) {}

        login () {
          loginFn();
          return new Promise((resolve) => {
            resolve(undefined);
          })
        }
      }

      jest.spyOn(AuthHelpers, 'getStoredAuthData').mockReturnValue({
        accessTokenExpirationDate: 0
      });
      
      await AuthLayerSvc.init();
      expect(loginFn).not.toHaveBeenCalled();
    });

    it('init with provider instance not a promise', async () => {
      auth_use = 'myProvider';
      providerInstanceSettings.idpProvider = class {
        constructor(private settings: unknown) {}
        login () {
          return new Promise((resolve) => {
            resolve(undefined);
          })
        }
      }

      jest.spyOn(AuthLayerSvc, 'getIdpProviderInstance').mockImplementation(() => {
        return 'no promise' as unknown as Promise<string>;
      });

      const checkAuthSpy = jest.spyOn(AuthLayerSvc, 'checkAuth').mockImplementation();
      
      await AuthLayerSvc.init();
      expect(checkAuthSpy).toHaveBeenCalled();
    });

    it('init with expired session and onAuthExpired handler', async () => {
      auth_use = 'myProvider';
      const loginFn = jest.fn();

      providerInstanceSettings.idpProvider = class {
        constructor(private settings: unknown) {}

        login () {
          loginFn();
          return new Promise((resolve) => {
            resolve(undefined);
          })
        }
      }

      jest.spyOn(AuthHelpers, 'getStoredAuthData').mockReturnValue({
        accessTokenExpirationDate: 0
      });

      jest.spyOn(LuigiAuth, 'handleAuthEvent').mockImplementation((eventName) => {
        return new Promise((resolve) => {
          if (eventName === 'onAuthExpired') {
            resolve(false);
            return;
          }
          resolve(undefined);
        });
      });
      const startAuthorizationSpy = jest.spyOn(AuthLayerSvc, 'startAuthorization');
      
      await AuthLayerSvc.init();
      expect(startAuthorizationSpy).not.toHaveBeenCalled();
    });
  });

  describe('startAuthorization', () => {
    it('no provider instance', async () => {
      expect(AuthLayerSvc.idpProviderInstance).toBeUndefined();
      expect(AuthLayerSvc.startAuthorization()).resolves.toBeUndefined();
    });

    it('provider login resolves normally', async () => {
      auth_use = 'myProvider';
      providerInstanceSettings.idpProvider = class {
        constructor(private settings: unknown) {}
        login () {
          return new Promise((resolve) => {
            resolve(undefined);
          })
        }
      }
      const consoleErrorSpy = jest.spyOn(console, 'error');
      await AuthLayerSvc.init();
      expect(AuthLayerSvc.startAuthorization()).resolves.toBeUndefined();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('provider login resolves with value', async () => {
      auth_use = 'myProvider';
      providerInstanceSettings.idpProvider = class {
        constructor(private settings: unknown) {}
        login () {
          return new Promise((resolve) => {
            resolve('some error');
          })
        }
      }
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      await AuthLayerSvc.init();
      expect(AuthLayerSvc.startAuthorization()).resolves.toEqual(undefined);
      expect(consoleErrorSpy).toHaveBeenCalledWith('some error');
    });
  });

  it('logout', async () => {
    auth_use = 'myProvider';
    providerInstanceSettings.idpProvider = class {
      constructor(private settings: unknown) {}
      login () {
        return new Promise((resolve) => {
          resolve(undefined);
        })
      }
    }
    await AuthLayerSvc.init();
    AuthLayerSvc.logout();

    profileLogoutFn = jest.fn();
    AuthLayerSvc.logout();
    expect(profileLogoutFn).toHaveBeenCalled();

    auth_use = 'myIDPWithCustomLogout';
    customIdpLogoutFn = jest.fn();
    AuthLayerSvc.logout();
    expect(customIdpLogoutFn).toHaveBeenCalled();

    auth_use = 'myProvider';
    const providerLogout = jest.fn();
    providerInstanceSettings.idpProvider = class {
      constructor(private settings: unknown) {}
      login () {
        return new Promise((resolve) => {
          resolve(undefined);
        })
      }
      logout () {
        providerLogout();
      }
    }
    await AuthLayerSvc.init();
    AuthLayerSvc.logout();
    expect(providerLogout).toHaveBeenCalled();
  });

  describe('getIdpProviderInstance', () => {
    it('should throw exeception / reject if no idp present', async () => {
      expect(AuthLayerSvc.getIdpProviderInstance('someIdp', {})).rejects.toBeDefined();
    });

    it('should call onAuthConfigError if no idp present', async () => {
      onAuthConfigErrorFn = jest.fn();
      AuthLayerSvc.getIdpProviderInstance('someIdp', {})
      expect(onAuthConfigErrorFn).toHaveBeenCalled();
    });

    it('should throw exeception / reject if idp has no login function', async () => {
      const idpSettings = {
        idpProvider: class {
          constructor(private settings: unknown) {}
        }
      };
      expect(AuthLayerSvc.getIdpProviderInstance('someIdp', idpSettings)).rejects.toBeDefined();
    });

    it('should return instance of idp', async () => {
      const idpSettings = {
        idpProvider: class {
          marker = 'myIdp';
          constructor(private settings: unknown) {}

          login () {
            return new Promise((resolve) => {
              resolve(undefined);
            })
          }
        }
      };
      const idpInstance = await AuthLayerSvc.getIdpProviderInstance('someIdp', idpSettings);
      expect(idpInstance.marker).toEqual('myIdp');
    });
  });

  it('unload', async () => {
    AuthLayerSvc.unload(); // should just do nothing  if no provider configured

    auth_use = 'myProvider';
    const unloadFn = jest.fn();
    providerInstanceSettings.idpProvider = class {
      constructor(private settings: unknown) {}
      login () {
        return new Promise((resolve) => {
          resolve(undefined);
        })
      }
      unload () {
        unloadFn();
      }
    }

    jest.spyOn(AuthHelpers, 'getStoredAuthData').mockReturnValue({
      accessTokenExpirationDate: new Date().getTime() + 5000
    });    
    await AuthLayerSvc.init();
    AuthLayerSvc.unload();

    expect(unloadFn).toHaveBeenCalled();
  });

  it('resetExpirationChecks', async () => {    
    AuthLayerSvc.resetExpirationChecks(); // should just do nothing  if no provider configured

    auth_use = 'myProvider';
    const resetExpirationChecksFn = jest.fn();
    providerInstanceSettings.idpProvider = class {
      constructor(private settings: unknown) {}
      login () {
        return new Promise((resolve) => {
          resolve(undefined);
        })
      }
      resetExpirationChecks () {
        resetExpirationChecksFn();
      }
    }

    jest.spyOn(AuthHelpers, 'getStoredAuthData').mockReturnValue({
      accessTokenExpirationDate: new Date().getTime() + 5000
    });    
    await AuthLayerSvc.init();
    AuthLayerSvc.resetExpirationChecks();
    
    expect(resetExpirationChecksFn).toHaveBeenCalled();
  });
});
