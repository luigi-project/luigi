import { AuthStoreSvc } from '../../services';
import { LuigiAuth } from '../../core-api';
import { GenericHelpers } from './';

class AuthHelpersClass {
  getStoredAuthData() {
    return AuthStoreSvc.getAuthData();
  }

  isLoggedIn() {
    const storedAuthData = this.getStoredAuthData();
    const isAuthValid = () => storedAuthData.accessTokenExpirationDate > Number(new Date());
    return storedAuthData && isAuthValid();
  }

  /**
   * Checks if there is a error parameter in the url
   * and returns error and error description
   */
  parseUrlAuthErrors() {
    const error = GenericHelpers.getUrlParameter('error');
    const errorDescription = GenericHelpers.getUrlParameter('errorDescription');
    if (error) {
      return { error, errorDescription };
    }
    return;
  }

  /**
   * Triggers onAuthError event with the found error
   * and error parameters.
   * @param {object} providerInstanceSettings
   * @param {string} error
   * @param {string} errorDescription
   */
  async handleUrlAuthErrors(providerInstanceSettings, error, errorDescription) {
    if (error) {
      return await LuigiAuth.handleAuthEvent(
        'onAuthError',
        providerInstanceSettings,
        { error, errorDescription },
        providerInstanceSettings.logoutUrl +
          '?post_logout_redirect_uri=' +
          providerInstanceSettings.post_logout_redirect_uri +
          '&error=' +
          encodeURIComponent(error) +
          '&errorDescription=' +
          encodeURIComponent(errorDescription || '')
      );
    }
    return true;
  }
}

export const AuthHelpers = new AuthHelpersClass();
