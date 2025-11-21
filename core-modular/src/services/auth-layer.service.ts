import { get, writable } from '../utilities/store';
import type { LuigiStore } from '../utilities/store';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { LuigiAuth } from '../core-api/auth';
import { ConfigHelpers } from '../utilities/helpers/config-helpers';
import { AuthHelpers } from '../utilities/helpers/auth-helpers';
import { AuthStoreSvc } from './auth-store.service';

class AuthLayerSvcClass {
  idpProviderInstance: any;
  _userInfoStore: LuigiStore;
  private _loggedInStore: LuigiStore;
  _profileLogoutFn: any;

  constructor() {
    this._userInfoStore = writable({});
    this._loggedInStore = writable(false);
  }

  setUserInfo(uInfo: any) {
    this._userInfoStore.set(uInfo);
  }
  setLoggedIn(loggedIn: any) {
    this._loggedInStore.set(loggedIn);
  }

  getUserInfoStore() {
    return this._userInfoStore;
  }

  getLoggedInStore() {
    return this._loggedInStore;
  }

  setProfileLogoutFn(fn: any) {
    this._profileLogoutFn = fn;
  }

  async init() {
    const idpProviderName = ConfigHelpers.getConfigValue('auth.use');
    if (!idpProviderName) {
      // No Authentication active
      return Promise.resolve(true);
    }
    const idpProviderSettings = ConfigHelpers.getConfigValue(`auth.${idpProviderName}`);

    /**
     * Prevent IDP Provider initialization, if an error is present
     * in the url params and onAuthError is defined in the user config.
     * errors are represented by `error` and `errorDescription` param.
     */
    const uaError: any = AuthHelpers.parseUrlAuthErrors() || {};
    const noError = await AuthHelpers.handleUrlAuthErrors(idpProviderSettings, uaError.error, uaError.errorDescription);
    if (!noError) {
      return;
    }

    this.idpProviderInstance = this.getIdpProviderInstance(idpProviderName, idpProviderSettings);
    if (GenericHelpers.isPromise(this.idpProviderInstance)) {
      return this.idpProviderInstance
        .then((resolved: any) => {
          this.idpProviderInstance = resolved;
          return this.checkAuth(idpProviderSettings);
        })
        .catch((err: Error) => {
          const errorMsg = `Error: ${err.message || err}`;
          console.error(errorMsg, err.message && err);
          ConfigHelpers.setErrorMessage(errorMsg);
        });
    }
    return this.checkAuth(idpProviderSettings);
  }

  async checkAuth(idpProviderSettings: any) {
    const authData = AuthHelpers.getStoredAuthData();
    if (!authData || !AuthHelpers.isLoggedIn()) {
      if (ConfigHelpers.getConfigValue('auth.disableAutoLogin')) {
        return;
      }

      /**
       * onAuthExpired
       * If onAuthExpired exists, it will be evaluated.
       * Continues with the standard authorization flow,
       * if `onAuthExpired` it returns undefined or truthy value.
       */
      let startAuth = true;
      if (authData) {
        startAuth = await LuigiAuth.handleAuthEvent('onAuthExpired', idpProviderSettings);
      }
      if (startAuth) {
        return this.startAuthorization();
      }
      return;
    }

    if (this.idpProviderInstance.settings && GenericHelpers.isFunction(this.idpProviderInstance.settings.userInfoFn)) {
      this.idpProviderInstance.settings
        .userInfoFn(this.idpProviderInstance.settings, authData)
        .then((userInfo: any) => {
          this.setUserInfo(userInfo);
          this.setLoggedIn(true);
        });
    } else {
      if (GenericHelpers.isFunction(this.idpProviderInstance.userInfo)) {
        this.idpProviderInstance.userInfo(idpProviderSettings).then((userInfo: any) => {
          this.setUserInfo(userInfo);
          this.setLoggedIn(true);
        });
      } else {
        this.setLoggedIn(true);
        this.setUserInfo(get(this._userInfoStore));
      }
    }

    const hasAuthSuccessFulFn = GenericHelpers.isFunction(ConfigHelpers.getConfigValue('auth.events.onAuthSuccessful'));

    if (hasAuthSuccessFulFn && AuthStoreSvc.isNewlyAuthorized()) {
      await LuigiAuth.handleAuthEvent('onAuthSuccessful', idpProviderSettings, authData);
    }
    AuthStoreSvc.removeNewlyAuthorized();

    if (GenericHelpers.isFunction(this.idpProviderInstance.setTokenExpirationAction)) {
      this.idpProviderInstance.setTokenExpirationAction();
    }
    if (GenericHelpers.isFunction(this.idpProviderInstance.setTokenExpireSoonAction)) {
      this.idpProviderInstance.setTokenExpireSoonAction();
    }
  }

  async startAuthorization() {
    if (this.idpProviderInstance) {
      return this.idpProviderInstance.login().then((res: any) => {
        AuthStoreSvc.setNewlyAuthorized();
        if (res) {
          // TODO: is not required for secure usecases, only if auth is done within core.
          // Normally the login() redirects to external idp and errors are shown there.
          console.error(res);
        }
        return;
      });
    }
  }

  logout() {
    const authData = AuthHelpers.getStoredAuthData();
    const logoutCallback = async (redirectUrl: any) => {
      await LuigiAuth.handleAuthEvent('onLogout', this.idpProviderInstance.settings, undefined, redirectUrl);
      AuthStoreSvc.removeAuthData();
    };
    const customLogoutFn = ConfigHelpers.getConfigValue(`auth.${ConfigHelpers.getConfigValue('auth.use')}.logoutFn`);
    const profileLogoutFn = ConfigHelpers.getConfigValueAsync('navigation.profile.logout.customLogoutFn');
    if (GenericHelpers.isFunction(customLogoutFn)) {
      customLogoutFn(this.idpProviderInstance.settings, authData, logoutCallback);
    } else if (GenericHelpers.isFunction(this.idpProviderInstance.logout)) {
      this.idpProviderInstance.logout(authData, logoutCallback);
    } else if (profileLogoutFn && GenericHelpers.isFunction(profileLogoutFn)) {
      profileLogoutFn(authData, logoutCallback);
    } else {
      logoutCallback(this.idpProviderInstance.settings.logoutUrl);
    }
  }

  IdpProviderException(message: string) {
    return { message, name: 'IdpProviderException' };
  }

  async getIdpProviderInstance(idpProviderName: string, idpProviderSettings: any) {
    // custom provider provided via config:
    const idpProvider = GenericHelpers.getConfigValueFromObject(idpProviderSettings, 'idpProvider');
    if (idpProvider) {
      const customIdpInstance = await new idpProvider(idpProviderSettings);
      ['login'].forEach((requiredFnName) => {
        if (!GenericHelpers.isFunction(customIdpInstance[requiredFnName])) {
          throw this.IdpProviderException(
            `${requiredFnName} function does not exist in custom IDP Provider ${idpProviderName}`
          );
        }
      });

      return customIdpInstance;
    }

    // handle non-existing providers
    const onAuthConfigError = GenericHelpers.isFunction(ConfigHelpers.getConfigValue('auth.events.onAuthConfigError'));
    if (onAuthConfigError) {
      await LuigiAuth.handleAuthEvent('onAuthConfigError', {
        idpProviderName: idpProviderName,
        type: 'IdpProviderException'
      });
    } else {
      throw this.IdpProviderException(`IDP Provider ${idpProviderName} does not exist.`);
    }
  }

  unload() {
    if (this.idpProviderInstance && GenericHelpers.isFunction(this.idpProviderInstance.unload)) {
      this.idpProviderInstance.unload();
    }
  }

  resetExpirationChecks() {
    if (this.idpProviderInstance && GenericHelpers.isFunction(this.idpProviderInstance.resetExpirationChecks)) {
      this.idpProviderInstance.resetExpirationChecks();
    }
  }
}

export const AuthLayerSvc = new AuthLayerSvcClass();
