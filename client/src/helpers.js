/** @private */
class Helpers {
  /** @private */
  constructor() {
    this.listeners = [];
    this.origin = '';

    const helperListener = function(evt) {
      if (!evt.data.msg) {
        return;
      }
      if (evt.data.msg === 'custom') {
        const message = this.convertCustomMessageInternalToUser(evt.data);
        this.listeners
          .filter(listener => listener.name === message.id)
          .map(listener => listener.eventFn(message, listener.listenerId));
      } else {
        this.listeners
          .filter(listener => listener.name === evt.data.msg)
          .map(listener => listener.eventFn(evt, listener.listenerId));
      }
    }.bind(this);

    window.addEventListener('message', helperListener);
  }

  convertCustomMessageInternalToUser(internalMessage) {
    return internalMessage.data;
  }

  convertCustomMessageUserToInternal(message) {
    return {
      msg: 'custom',
      data: message
    };
  }

  convertStorageMessageToInternal(message) {
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
  addEventListener(name, eventFn) {
    const listenerId = this.getRandomId();
    this.listeners.push({
      name,
      eventFn,
      listenerId
    });
    return listenerId;
  }

  /**
   * Removes a post message listener
   * @private
   * @param {string} id - listenerId
   */
  removeEventListener(id) {
    const listenerExists = Boolean(this.listeners.find(l => l.listenerId === id));
    if (listenerExists) {
      this.listeners = this.listeners.filter(l => l.listenerId !== id);
      return true;
    }
    return false;
  }

  /**
   * Creates a random Id
   * @private
   */
  getRandomId() {
    return window.crypto.getRandomValues(new Uint32Array(1))[0];
  }

  /**
   * Simple function check.
   * @private
   * @param {function} item
   * @returns {boolean}
   */
  isFunction(item) {
    return typeof item === 'function';
  }

  /**
   * Simple object check.
   * @private
   * @param {Object} item
   * @returns {boolean}
   */
  isObject(item) {
    return Object.prototype.toString.call(item) === '[object Object]';
  }

  getLuigiCoreDomain() {
    return this.origin;
  }

  setLuigiCoreDomain(origin) {
    // protect against "null" string set by at least Chrome browser when file protocol used
    if (origin && origin !== 'null') {
      this.origin = origin;
    }
  }

  setTargetOrigin(origin) {
    this.setLuigiCoreDomain(origin);
  }

  sendPostMessageToLuigiCore(msg) {
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
   */
  hasIntent(path) {
    return !!path && path.toLowerCase().includes('#?intent=');
  }

  deSanitizeParamsMap(paramsMap) {
    return Object.entries(paramsMap).reduce((sanitizedMap, paramPair) => {
      sanitizedMap[this.deSanitizeParam(paramPair[0])] = this.deSanitizeParam(paramPair[1]);
      return sanitizedMap;
    }, {});
  }

  deSanitizeParam(param = '') {
    return String(param)
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll('&sol;', '/');
  }
}

export const helpers = new Helpers();
