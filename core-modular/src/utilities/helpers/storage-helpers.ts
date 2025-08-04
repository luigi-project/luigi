class StorageHelpersClass {
  init: boolean;
  storage: Storage;
  browseSupported: boolean | undefined;

  constructor() {
    this.init = false;
    this.storage = undefined as any;
    this.browseSupported = undefined;
  }

  checkInit(): void {
    if (this.init) {
      return;
    }

    this.storage = window.localStorage;
    this.browseSupported = this.supportLocalStorage();
    this.init = true;
  }

  supportLocalStorage(): boolean {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }

  checkStorageBrowserSupport(): void {
    if (!this.browseSupported) {
      throw 'Browser does not support local storage';
    }
  }

  process(microfrontendId, hostname, id, operation, params): void {
    try {
      this.checkInit();
      this.checkStorageBrowserSupport();

      const operationFunction = this[operation];

      if (typeof operationFunction !== 'function') {
        throw operation + ' is not a supported operation for the storage';
      }

      const result = operationFunction.bind(this, this.cleanHostname(hostname), params)();

      this.sendBackOperation(microfrontendId, id, 'OK', result);
    } catch (error) {
      console.log(error);
      this.sendBackOperation(microfrontendId, id, 'ERROR', error);
    }
  }

  cleanHostname(hostname: string): string {
    return hostname.replace('http://', '').replace('https://', '');
  }

  setItem(hostname: string, params: Record<string, string>) {
    this.checkKey(params);

    const value = this.stringifyValue(params.value);
    const key = this.buildKey(hostname, params.key);

    this.storage.setItem(key, value);
  }

  getItem(hostname: string, params: Record<string, string>): any {
    this.checkKey(params);

    const key = this.buildKey(hostname, params.key);
    const item = this.storage.getItem(key);

    if (item) {
      return this.parseJsonIfPossible(item);
    } else {
      return undefined;
    }
  }

  buildKey(hostname: string, subKey: string): string {
    return this.buildPrefix(hostname) + subKey.trim();
  }

  buildPrefix(hostname: string): string {
    return 'Luigi#' + hostname + '#';
  }

  removeItem(hostname: string, params: Record<string, string>): string | undefined {
    this.checkKey(params);

    const key = this.buildKey(hostname, params.key);
    const item = this.storage.getItem(key);

    if (item) {
      this.storage.removeItem(key);

      return item;
    } else {
      return undefined;
    }
  }

  clear(hostname: string, params: Record<string, string>): void {
    const keyPrefix = this.buildPrefix(hostname);

    Object.keys(this.storage)
      .filter(key => key.startsWith(keyPrefix))
      .forEach(key => this.storage.removeItem(key));
  }

  has(hostname: string, params: Record<string, string>): boolean {
    this.checkKey(params);

    const key = this.buildKey(hostname, params.key);
    const item = this.storage.getItem(key);

    return !!item;
  }

  getAllKeys(hostname: string, params: Record<string, string>): string[] {
    const keyPrefix = this.buildPrefix(hostname);

    return Object.keys(this.storage)
      .filter(key => key.startsWith(keyPrefix))
      .map(key => key.substring(keyPrefix.length));
  }

  checkKey(params: Record<string, string>): void {
    if (!params.key || params.key.trim().length === 0) {
      throw 'Missing key, we cannot execute storage operation';
    }
  }

  parseJsonIfPossible(text: string): any {
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }

  stringifyValue(value: any): string {
    if (!value) {
      throw 'Value is empty';
    }

    if (typeof value === 'string' || value instanceof String) {
      return value as string;
    }

    try {
      return JSON.stringify(value);
    } catch (error) {
      throw 'Value cannot be stringify, error: ' + error;
    }
  }

  sendBackOperation(microfrontendId, id, status, result): any {
    // TODO
    let message = {
      msg: 'storage',
      data: {
        id,
        status,
        result
      }
    };

    return message;
  }
}

export const StorageHelpers = new StorageHelpersClass();
