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
    // Validate error parameter to prevent security bypass
    // Only process known OAuth 2.0 error codes
    const validErrorCodes = [
      'access_denied',
      'unauthorized_client',
      'invalid_request',
      'invalid_scope',
      'invalid_grant',
      'unsupported_response_type',
      'unsupported_grant_type',
      'invalid_client',
      'server_error',
      'temporarily_unavailable'
    ];

    if (error && validErrorCodes.includes(error)) {
      // Sanitize error description to prevent injection
      const sanitizedErrorDescription = errorDescription
        ? String(errorDescription)
            .substring(0, 500)
            .replace(/[<>&"']/g, '')
        : '';

      return await LuigiAuth.handleAuthEvent(
        'onAuthError',
        providerInstanceSettings,
        { error, errorDescription: sanitizedErrorDescription },
        providerInstanceSettings.logoutUrl +
          '?post_logout_redirect_uri=' +
          encodeURIComponent(providerInstanceSettings.post_logout_redirect_uri) +
          '&error=' +
          encodeURIComponent(error) +
          '&errorDescription=' +
          encodeURIComponent(sanitizedErrorDescription)
      );
    }

    // If error is present but invalid, log warning
    if (error) {
      console.warn('[Luigi Auth] Invalid or unrecognized error code:', error);
    }

    return true;
  }
}

export const AuthHelpers = new AuthHelpersClass();
