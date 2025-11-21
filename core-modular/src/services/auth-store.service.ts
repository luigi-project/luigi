import { ConfigHelpers } from '../utilities/helpers/config-helpers';

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

  getStorageType(): string {
    if (!this._storageType) {
      this._storageType = ConfigHelpers.getConfigValue('auth.storage') || this._defaultStorage;
    }
    return this._storageType;
  }

  getAuthData() {
    return this._getStore(this.getStorageKey());
  }

  setAuthData(values: any) {
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

  _getWebStorage(sType: string): Storage {
    return (window as any)[this.getStorageType()] as Storage;
  }

  _setStore(key: string, data: any) {
    switch (this.getStorageType()) {
      case 'localStorage':
      case 'sessionStorage':
        if (data !== undefined) {
          this._getWebStorage(this.getStorageType()).setItem(key, JSON.stringify(data));
        } else {
          this._getWebStorage(this.getStorageType()).removeItem(key);
        }
        break;

      case 'none':
        (this as any)[key] = data;
        break;

      default:
        console.error(this._invalidStorageMsg);
    }
  }

  _getStore(key: string): any {
    try {
      switch (this.getStorageType()) {
        case 'localStorage':
        case 'sessionStorage':
          return JSON.parse(this._getWebStorage(this.getStorageType()).getItem(key) as string);

        case 'none':
          return (this as any)[key];

        default:
          console.error(this._invalidStorageMsg);
      }
    } catch (e) {
      console.warn('Error parsing authorization data. Auto-logout might not work!');
    }
  }
}

export const AuthStoreSvc = new AuthStoreSvcClass();
