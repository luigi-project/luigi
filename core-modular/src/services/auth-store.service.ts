import type { Luigi } from '../core-api/luigi';

export class AuthStoreService {
  _authKey!: string;
  _defaultStorage!: string;
  _invalidStorageMsg!: string;
  _newlyAuthorizedKey!: string;
  _storageType!: string;

  constructor(private luigi: Luigi) {
    this._authKey = 'luigi.auth';
    this._defaultStorage = 'localStorage';
    this._invalidStorageMsg =
      'Configuration Error: Invalid auth.storage value defined. Must be one of localStorage, sessionStorage or none.';
    this._newlyAuthorizedKey = 'luigi.newlyAuthorized';
  }

  getStorageKey(): string {
    return this._authKey;
  }

  getStorageType(): string {
    if (!this._storageType) {
      this._storageType = this.luigi.getConfigValue('auth.storage') || this._defaultStorage;
    }

    return this._storageType;
  }

  getAuthData(): any {
    return this._getStore(this.getStorageKey());
  }

  setAuthData(values: any): void {
    this._setStore(this.getStorageKey(), values);
  }

  removeAuthData(): void {
    this._setStore(this.getStorageKey(), undefined);
  }

  isNewlyAuthorized(): boolean {
    return !!this._getStore(this._newlyAuthorizedKey);
  }

  setNewlyAuthorized(): void {
    this._setStore(this._newlyAuthorizedKey, true);
  }

  removeNewlyAuthorized(): void {
    this._setStore(this._newlyAuthorizedKey, undefined);
  }

  private _setStore(key: string, data: any): void {
    switch (this.getStorageType()) {
      case 'localStorage':
      case 'sessionStorage':
        if (data !== undefined) {
          (window[this.getStorageType() as any] as any).setItem(key, JSON.stringify(data));
        } else {
          (window[this.getStorageType() as any] as any).removeItem(key);
        }
        break;
      case 'none':
        (this as any)[key] = data;
        break;
      default:
        console.error(this._invalidStorageMsg);
    }
  }

  private _getStore(key: string): any {
    try {
      switch (this.getStorageType()) {
        case 'localStorage':
        case 'sessionStorage':
          return JSON.parse((window[this.getStorageType() as any] as any).getItem(key));
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
