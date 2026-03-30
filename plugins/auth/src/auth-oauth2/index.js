/* istanbul ignore file */
import { Helpers } from '../helpers';

export default class oAuth2ImplicitGrant {
  constructor(settings = {}) {
    const defaultSettings = {
      oAuthData: {
        redirect_uri: window.location.origin + '/assets/auth-oauth2/callback.html',
        response_type: 'id_token token',
        scope: ''
      },
      authorizeMethod: 'GET',
      logoutUrl: '',
      post_logout_redirect_uri: window.location.origin + '/logout.html',
      accessTokenExpiringNotificationTime: 60,
      expirationCheckInterval: 5
    };
    const mergedSettings = Helpers.deepMerge(defaultSettings, settings);

    this.settings = mergedSettings;
  }

  getAuthData() {
    return Luigi.auth().store.getAuthData();
  }

  parseIdToken(token) {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(payload));
  }

  userInfo() {
    return new Promise((resolve, reject) => {
      let authData = this.getAuthData();
      const tokenInfo = this.parseIdToken(authData.idToken);
      const userInfo = {
        email: tokenInfo.email ? tokenInfo.email : '',
        name: tokenInfo.name ? tokenInfo.name : ''
      };
      resolve(userInfo);
    });
  }

  login() {
    return new Promise((resolve, reject) => {
      const settings = this.settings;
      const generatedNonce = (settings.nonceFn && settings.nonceFn()) || this.generateNonce();
      sessionStorage.setItem('luigi.nonceValue', generatedNonce);
      if (!settings.oAuthData.nonce) {
        settings.oAuthData.nonce = generatedNonce;
      }

      const createInputElement = (name, value) => {
        return Object.assign(document.createElement('input'), {
          name: name,
          id: name,
          value: value,
          type: 'hidden'
        });
      };

      const formElem = Object.assign(document.createElement('form'), {
        name: 'signIn',
        id: 'signIn',
        action: settings.authorizeUrl,
        method: settings.authorizeMethod,
        target: '_self'
      });

      settings.oAuthData.redirect_uri = `${Helpers.prependOrigin(
        settings.oAuthData.redirect_uri
      )}?storageType=${Luigi.auth().store.getStorageType()}`;
      settings.oAuthData.state = btoa(encodeURI(window.location.href) + '_luigiNonce=' + generatedNonce);

      for (const name in settings.oAuthData) {
        const node = createInputElement(name, settings.oAuthData[name]);
        formElem.appendChild(node.cloneNode());
      }

      document.getElementsByTagName('body')[0].appendChild(formElem);
      setTimeout(() => {
        document.querySelector('form#signIn').submit();
      });

      // TODO: We're not resolving the promise at any time,
      // since oauth2 is redirecting off the page
      // maybe it is possible to catch errors
      document.querySelector('form#signIn').addEventListener('load', (e) => {
        console.info('load, e', e, this);
      });
    });
  }

  logout(authData, authEventLogoutFn) {
    const settings = this.settings;
    const logouturl = `${settings.logoutUrl}?id_token_hint=${authData.idToken}&client_id=${
      settings.oAuthData.client_id
    }&post_logout_redirect_uri=${Helpers.prependOrigin(settings.post_logout_redirect_uri)}`;
    authEventLogoutFn && authEventLogoutFn();

    setTimeout(() => {
      window.location.href = logouturl;
    });
  }

  setTokenExpirationAction() {
    const expirationCheckInterval = 5000;
    this.expirationCheckIntervalInstance = setInterval(() => {
      let authData = this.getAuthData();
      if (!authData) {
        return clearInterval(this.expirationCheckIntervalInstance);
      }

      const tokenExpirationDate = (authData && authData.accessTokenExpirationDate) || 0;
      const currentDate = new Date();
      if (tokenExpirationDate - currentDate < expirationCheckInterval) {
        clearInterval(this.expirationCheckIntervalInstance);
        Luigi.auth().store.removeAuthData();
        // TODO: check if valid (mock-auth requires it), post_logout_redirect_uri is an assumption, might not be available for all auth providers
        const redirectUrl = `${
          this.settings.logoutUrl
        }?error=tokenExpired&post_logout_redirect_uri=${Helpers.prependOrigin(this.settings.post_logout_redirect_uri)}`;
        Luigi.auth().handleAuthEvent('onAuthExpired', this.settings, undefined, redirectUrl);
      }
    }, expirationCheckInterval);
  }

  setTokenExpireSoonAction() {
    const accessTokenExpiringNotificationTime = this.settings.accessTokenExpiringNotificationTime * 1000;
    const expirationCheckInterval = this.settings.expirationCheckInterval * 1000;
    let authData = this.getAuthData();
    if (authData) {
      this.expirationSoonCheckIntervalInstance = setInterval(() => {
        const tokenExpirationDate = (authData && authData.accessTokenExpirationDate) || 0;
        const currentDate = new Date();
        if (tokenExpirationDate - currentDate.getTime() < accessTokenExpiringNotificationTime) {
          Luigi.auth().handleAuthEvent('onAuthExpireSoon', this.settings);
          clearInterval(this.expirationSoonCheckIntervalInstance);
        }
      }, expirationCheckInterval);
    }
  }

  generateNonce() {
    const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz';
    const limit = validChars.length;
    const crypto = window.crypto;
    const random = Array.from(crypto.getRandomValues(new Uint8Array(20)));

    return random
      .map((x) => {
        while (x >= Math.floor(256 / limit) * limit) {
          x = crypto.getRandomValues(new Uint8Array(1))[0];
        }
        return validChars[x % limit];
      })
      .join('');
  }

  resetExpirationChecks() {
    this.unload();
    this.setTokenExpirationAction();
    this.setTokenExpireSoonAction();
  }

  unload() {
    clearInterval(this.expirationCheckIntervalInstance);
    clearInterval(this.expirationSoonCheckIntervalInstance);
  }
}
