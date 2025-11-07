import { AuthLayerSvc } from "../services/auth-layer.service";
import { AuthStoreSvc } from "../services/auth-store.service";
import { ConfigHelpers } from "../utilities/helpers/config-helpers";

export class LuigiAuthClass {    
    

    /**
   * Detects if authorization is enabled via configuration.
   * Read more about [custom authorization providers](authorization-configuration.md).
   * @memberof Authorization
   * @returns {boolean} - `true` if authorization is enabled. Otherwise returns `false`.
   * @example
   * Luigi.auth().isAuthorizationEnabled();
   */
  isAuthorizationEnabled() {
    return !!ConfigHelpers.getConfigValue('auth.use');
  }

  /**
   * Login the user dynamically.
   * This will run the same functionality as though the user clicked the login button.
   * @memberof Authorization
   * @since 1.5.0
   * @example
   * Luigi.auth().login();
   */
  login() {
    if (this.isAuthorizationEnabled()) {
      AuthLayerSvc.startAuthorization();
    }
  }

  /**
   * Logout the user dynamically.
   * This will run the same functionality as though the user clicked the logout button.
   * @memberof Authorization
   * @since 1.5.0
   * @example
   * Luigi.auth().logout();
   */
  logout() {
    if (this.isAuthorizationEnabled()) {
      AuthLayerSvc.logout();
    }
  }

  /**
   * @private
   * @memberof Authorization
   * @param {string} eventName
   * @param {Object} providerInstanceSettings
   * @param {AuthData} data
   * @param {string} redirectUrl
   */
  async handleAuthEvent(eventName: string, providerInstanceSettings: any, data?: any, redirectUrl?: string): Promise<any> {
    const result = undefined;// await this.#luigi.executeConfigFnAsync( // TODO: implement
    //   'auth.events.' + eventName,
    //   false,
    //   providerInstanceSettings,
    //   data
    // );
    const redirect = result === undefined || !!result;
    if (redirect && redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }
    return redirect;
  }
  /**
   * Authorization Storage helpers, to be used in your custom authorization provider.
   * Read more about custom authorization providers [here](authorization-configuration.md#implement-a-custom-authorization-provider).
   * @name AuthorizationStore
   */

  /**
   * Authorization object that is stored in auth store and used within Luigi. It is then available in [LuigiClient.addInitListener](luigi-client-api.md#addInitListener) and can also be used in the Core configuration.
   * @typedef {Object} AuthData
   * @property {string} accessToken - access token value
   * @property {string} accessTokenExpirationDate - timestamp value
   * @property {string} scope - scope, can be empty if it is not required
   * @property {string} idToken - id token, used for renewing authentication
   */
  get store() {
    if (!ConfigHelpers.getLuigi()?.initialized) {
      console.warn(
        'Luigi Core is not initialized yet. Consider moving your code to the luigiAfterInit lifecycle hook. ' +
          'Documentation: https://docs.luigi-project.io/docs/lifecycle-hooks'
      );
    }
    return {
      /**
       * Retrieves the key name that is used to store the auth data.
       * @memberof AuthorizationStore
       * @returns {string} - name of the store key
       * @example Luigi.auth().store.getStorageKey()
       */
      getStorageKey: () => AuthStoreSvc.getStorageKey(),
      /**
       * Retrieves the storage type that is used to store the auth data. To set it, use the `storage` property of the `auth` Luigi configuration object. Find out more [here](https://docs.luigi-project.io/docs/authorization-configuration?section=general-authorization-options).
       * @memberof AuthorizationStore
       * @returns {('localStorage'|'sessionStorage'|'none')} - storage type
       * @example Luigi.auth().store.getStorageType()
       */
      getStorageType: () => AuthStoreSvc.getStorageType(),
      /**
       * Retrieves the current auth object.
       * @memberof AuthorizationStore
       * @returns {AuthData} - the current auth data object
       * @example Luigi.auth().store.getAuthData()
       */
      getAuthData: () => AuthStoreSvc.getAuthData(),
      /**
       * Sets authorization data
       * @memberof AuthorizationStore
       * @param {AuthData} data - new auth data object
       * @example Luigi.auth().store.setAuthData(data)
       */
      setAuthData: (data: any) => AuthStoreSvc.setAuthData(data),
      /**
       * Clears authorization data from store
       * @memberof AuthorizationStore
       * @example Luigi.auth().store.removeAuthData()
       */
      removeAuthData: () => AuthStoreSvc.removeAuthData(),
      /**
       * Defines a new authorization session. Must be triggered after initial `setAuthData()` in order to trigger **onAuthSuccessful** event after login.
       * @memberof AuthorizationStore
       * @example Luigi.auth().store.setNewlyAuthorized()
       */
      setNewlyAuthorized: () => {
        AuthStoreSvc.setNewlyAuthorized();
        AuthLayerSvc.resetExpirationChecks();
      }
    };
  }
}


export const LuigiAuth = new LuigiAuthClass();