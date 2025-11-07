
class AuthStoreSvcClass {
  private _authKey: any;
  private _storageType: any;
  private _defaultStorage: any;
  private _newlyAuthorizedKey: any;
  private _invalidStorageMsg: any;
  
  constructor() {
    this._defaultStorage = 'localStorage';
    this._authKey = 'luigi.auth';
    this._newlyAuthorizedKey = 'luigi.newlyAuthorized';
    this._invalidStorageMsg =
      'Configuration Error: Invalid auth.storage value defined. Must be one of localStorage, sessionStorage or none.';
  }

  getStorageKey() {
    return this._authKey;
  }

  getStorageType() {
    if (!this._storageType) {
      this._storageType = LuigiConfig.getConfigValue('auth.storage') || this._defaultStorage;
    }
    return this._storageType;
  }

  getAuthData() {
    return this._getStore(this.getStorageKey());
  }

  setAuthData(values) {
    this._setStore(this.getStorageKey(), values);
  }

  removeAuthData() {
    this._setStore(this.getStorageKey(), undefined);
  }

  isNewlyAuthorized() {
    return !!this._getStore(this._newlyAuthorizedKey);
  }

  setNewlyAuthorized() {
    this._setStore(this._newlyAuthorizedKey, true);
  }

  removeNewlyAuthorized() {
    this._setStore(this._newlyAuthorizedKey, undefined);
  }

  _setStore(key, data) {
    switch (this.getStorageType()) {
      case 'localStorage':
      case 'sessionStorage':
        if (data !== undefined) {
          window[this.getStorageType()].setItem(key, JSON.stringify(data));
        } else {
          window[this.getStorageType()].removeItem(key);
        }
        break;

      case 'none':
        this[key] = data;
        break;

      default:
        console.error(this._invalidStorageMsg);
    }
  }

  _getStore(key) {
    try {
      switch (this.getStorageType()) {
        case 'localStorage':
        case 'sessionStorage':
          return JSON.parse(window[this.getStorageType()].getItem(key));

        case 'none':
          return this[key];

        default:
          console.error(this._invalidStorageMsg);
      }
    } catch (e) {
      console.warn('Error parsing authorization data. Auto-logout might not work!');
    }
  }
}

export const AuthStoreSvc = new AuthStoreSvcClass();
