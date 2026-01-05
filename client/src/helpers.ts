/**
 * @name Helpers
 * @private
 */
class Helpers {
  listeners: any[] = [];
  origin: string = '';

  /** @private */
  constructor() {
    const helperListener = (evt: MessageEvent<any>): void => {
      if (!evt.data.msg) {
        return;
      }

      if (evt.data.msg === 'custom') {
        const message: Record<string, any> = this.convertCustomMessageInternalToUser(evt.data);

        this.listeners
          .filter((listener) => listener.name === message['id'])
          .map((listener) => listener.eventFn(message, listener.listenerId));
      } else {
        this.listeners
          .filter((listener) => listener.name === evt.data.msg)
          .map((listener) => listener.eventFn(evt, listener.listenerId));
      }
    };

    window.addEventListener('message', helperListener);
  }

  convertCustomMessageInternalToUser(internalMessage: Record<string, any>): Record<string, any> {
    return internalMessage['data'] as Record<string, any>;
  }

  convertCustomMessageUserToInternal(message: Record<string, any>): Record<string, any> {
    return {
      msg: 'custom',
      data: message
    };
  }

  convertStorageMessageToInternal(message: Record<string, any>): Record<string, any> {
    return {
      msg: 'storage',
      data: message
    };
  }

  /**
   * Registers a post message listener
   * Don't forget to remove the event listener at the end of
   * your eventFn if you do not need it anymore.
   * @private
   * @param {string} name - event name
   * @param {function} eventFn - callback function
   * @returns {string} listener id
   */
  addEventListener(name: string, eventFn: (event: any, listener?: any) => void): string {
    const listenerId: number = this.getRandomId();

    this.listeners.push({
      name,
      eventFn,
      listenerId
    });

    return `${listenerId}`;
  }

  /**
   * Removes a post message listener
   * @private
   * @param {string} id - listenerId
   * @returns {boolean}
   */
  removeEventListener(id: string): boolean {
    const listenerExists: boolean = this.listeners.find(listener => listener.listenerId === id);

    if (listenerExists) {
      this.listeners = this.listeners.filter(listener => listener.listenerId !== id);

      return true;
    }

    return false;
  }

  /**
   * Creates a random ID
   * @private
   * @returns {number}
   */
  getRandomId(): number {
    return window.crypto.getRandomValues(new Uint32Array(1))[0];
  }

  /**
   * Simple function check
   * @private
   * @param {function} item
   * @returns {boolean}
   */
  isFunction(item: any): boolean {
    return typeof item === 'function';
  }

  /**
   * Simple object check
   * @private
   * @param {Object} item
   * @returns {boolean}
   */
  isObject(item: any): boolean {
    return Object.prototype.toString.call(item) === '[object Object]';
  }

  getLuigiCoreDomain(): string {
    return this.origin;
  }

  setLuigiCoreDomain(origin: string): void {
    // protect against "null" string set by at least Chrome browser when file protocol used
    if (origin && origin !== 'null') {
      this.origin = origin;
    }
  }

  setTargetOrigin(origin: string): void {
    this.setLuigiCoreDomain(origin);
  }

  sendPostMessageToLuigiCore(msg: any): void {
    if (this.origin) {
      // protect against potential postMessage problems, since origin value may be set incorrectly
      try {
        window.parent.postMessage(msg, this.origin);
      } catch (error) {
        console.warn('Unable to post message ' + msg + ' to Luigi Core from origin ' + this.origin + ': ' + error);
      }
    } else {
      console.warn(
        'There is no target origin set. You can specify the target origin by calling LuigiClient.setTargetOrigin("targetorigin") in your micro frontend.'
      );
    }
  }

  /**
   * Checks if given path contains intent navigation special syntax
   * @param {string} path - path to be checked
   * @returns {boolean}
   */
  hasIntent(path: string): boolean {
    return !!path && path.toLowerCase().includes('#?intent=');
  }

  deSanitizeParamsMap(paramsMap: Record<string, any>) {
    return Object.entries(paramsMap).reduce<any>((sanitizedMap, paramPair) => {
      sanitizedMap[this.deSanitizeParam(paramPair[0] as string)] = this.deSanitizeParam(paramPair[1] as string);

      return sanitizedMap;
    }, {});
  }

  deSanitizeParam(param = ''): string {
    return String(param)
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll('&sol;', '/');
  }
}

export const helpers: Helpers = new Helpers();
