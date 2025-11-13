// Standalone or partly-standalone methods that are used widely through the whole app and are synchronous.
import { LuigiElements, LuigiConfig } from '../../core-api';
import { replace, get } from 'lodash';
import { IframeHelpers } from './iframe-helpers';

class GenericHelpersClass {
  /**
   * Creates a random Id
   * @returns random numeric value {number}
   * @private
   */
  getRandomId /* istanbul ignore next */() {
    return window.crypto.getRandomValues(new Uint32Array(1))[0];
  }

  /**
   * Checks if input is a function.
   * @param functionToCheck mixed
   * @returns {boolean}
   */
  isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
  }

  /**
   * Checks if input is an async function.
   * @param functionToCheck mixed
   * @returns {boolean}
   */
  isAsyncFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object AsyncFunction]';
  }

  /**
   * Checks if input is a promise.
   * @param promiseToCheck mixed
   * @returns {boolean}
   */
  isPromise(promiseToCheck) {
    return promiseToCheck && this.isFunction(promiseToCheck.then);
  }

  /**
   * Checks if input is a string.
   * @param stringToCheck mixed
   * @returns {boolean}
   */
  isString(stringToCheck) {
    return typeof stringToCheck === 'string' || stringToCheck instanceof String;
  }

  isIE /* istanbul ignore next */() {
    const ua = navigator.userAgent;
    /* MSIE used to detect old browsers and Trident used to newer ones */
    return Boolean(ua.includes('MSIE ') || ua.includes('Trident/'));
  }

  /**
   * Checks if input is an object.
   * @param objectToCheck mixed
   * @returns {boolean}
   */
  isObject(objectToCheck) {
    return !!(objectToCheck && typeof objectToCheck === 'object' && !Array.isArray(objectToCheck));
  }

  /**
   * Check if object is empty
   * @param item object to check
   * @returns {boolean}
   */
  isEmptyObject(item) {
    return this.isObject(item) && Object.keys(item).length === 0;
  }

  /**
   * Deep merge two objects.
   * @param target
   * @param ...sources
   */
  deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  }

  getUrlWithoutHash(url) {
    if (!url) {
      return false;
    }
    const urlWithoutHash = url.split('#')[0];

    // We assume that any URL not starting with
    // http is on the current page's domain
    if (!urlWithoutHash.startsWith('http')) {
      return window.location.origin + (urlWithoutHash.startsWith('/') ? '' : '/') + urlWithoutHash;
    }
    return urlWithoutHash;
  }

  /**
   * Checks if a given input string begins a hash with slash
   * @param {path} string
   */
  hasHash(path) {
    return path && path.search(/^[#\/].*$/) === 0;
  }

  getPathWithoutHash(path) {
    while (this.hasHash(path)) {
      path = path.substr(1);
    }
    return path;
  }

  /**
   * Returns the value of a given url parameter name
   * @param {string} name
   */
  getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const result = regex.exec(window.location.search);
    return (result && decodeURIComponent(result[1].replace(/\+/g, ' '))) || '';
  }

  /**
   * Prepend current url to redirect_uri, if it is a relative path
   * @param {path} string full url, relative or absolute path
   */
  prependOrigin(path) {
    if (!path || path.startsWith('http')) {
      return path;
    }
    const hasLeadingSlash = path.startsWith('/');
    if (path.length) {
      return window.location.origin + (hasLeadingSlash ? '' : '/') + path;
    }
    return window.location.origin;
  }

  /**
   * Adds a leading slash to a string if it has none
   * @param {str} string
   * @returns {string} string with a leading slash
   */
  addLeadingSlash(str) {
    return (!str.startsWith('/') ? '/' : '') + str;
  }

  /**
   * Adds a trailing slash to a string if it has none
   * @param {str} string
   * @returns {string} string with a trailing slash
   */
  addTrailingSlash(str) {
    if (typeof str !== 'string') {
      return str;
    }
    return str.replace(/\/?$/, '/');
  }

  /**
   * Removes leading slash of a string
   * @param {str} string
   * @returns {string} string without leading slash
   */
  trimLeadingSlash(str) {
    return this.isString(str) ? str.replace(/^\/+/g, '') : '';
  }

  /**
   * Prepend current url to redirect_uri, if it is a relative path
   * @param {str} string from which any number of trailing slashes should be removed
   * @returns string string without any trailing slash
   */
  trimTrailingSlash(str) {
    return this.isString(str) ? str.replace(/\/+$/, '') : '';
  }

  getTrimmedUrl(path) {
    const pathUrl = path.length > 0 ? this.getPathWithoutHash(path) : path;
    return this.trimTrailingSlash(pathUrl.split('?')[0]);
  }

  /**
   * Returns a path that starts and end with one (and only one) slash,
   * regardless of the slashes being already present in the path given as input
   * @param {str} string path to normalize
   * @returns string path that starts and ends with a slash
   */

  normalizePath(str) {
    if (typeof str !== 'string') {
      return str;
    }
    return this.addLeadingSlash(this.addTrailingSlash(str));
  }

  /*
   * Gets value of the given property on the given object.
   */
  getConfigValueFromObject(object, property) {
    let propIndex = 0;
    let nextValue = object;
    const propertyPath = property.split('.');
    while (nextValue && propIndex < propertyPath.length) {
      nextValue = nextValue[propertyPath[propIndex++]];
    }
    return nextValue;
  }

  canComponentHandleModal(component) {
    return component && typeof component.get === 'function';
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  replaceVars(inputString, params, prefix, parenthesis = true) {
    let processedString = inputString;
    if (params) {
      if (parenthesis) {
        processedString = replace(processedString, /{([\s\S]+?)}/g, (val) => {
          let repl = val.slice(1, -1).trim();
          if (repl.indexOf(prefix) === 0) {
            repl = repl.substring(prefix.length);
          }
          return get(params, repl, val);
        });
      } else {
        Object.entries(params).forEach((entry) => {
          processedString = processedString.replace(
            new RegExp(this.escapeRegExp(prefix + entry[0]), 'g'),
            encodeURIComponent(entry[1])
          );
        });
      }
    }
    if (parenthesis) {
      processedString = processedString.replace(new RegExp('\\{' + this.escapeRegExp(prefix) + '[^\\}]+\\}', 'g'), '');
    }
    return processedString;
  }

  getInnerHeight /* istanbul ignore next */() {
    return IframeHelpers.getIframeContainer().clientHeight;
  }

  getContentAreaHeight /* istanbul ignore next */() {
    const contentAreaHeight = this.getInnerHeight() - IframeHelpers.getIframeContainer().getBoundingClientRect().top;
    return contentAreaHeight;
  }

  /**
   * Returns the height of the shellbar component.
   * This is important for calculating the height of available area
   * for displaying content. If the shellbar component is not present, returns 0.
   * @returns {number} height of the shellbar component
   */
  getShellbarHeight() {
    const shellBar = LuigiElements.getShellbar() || {};
    const shellBarHeight = shellBar.clientHeight || 0;
    return shellBarHeight;
  }

  computePxFromPercent(fullPixels, requestedPercent) {
    /* istanbul ignore next */
    return (fullPixels / 100) * requestedPercent;
  }

  computePercentFromPx(fullPixels, partialPixels) {
    /* istanbul ignore next */
    return Math.floor((100 * partialPixels) / fullPixels);
  }

  isElementVisible(element) {
    /* istanbul ignore next */
    const cssDisplayValue = window.getComputedStyle(element, null).getPropertyValue('display');
    return cssDisplayValue !== 'none';
  }

  removeInternalProperties(input) {
    return (
      (input &&
        Object.keys(input)
          .filter((key) => !key.startsWith('_'))
          .reduce((obj, key) => {
            obj[key] = input[key];
            return obj;
          }, {})) ||
      input
    );
  }

  /**
   * Returns a new Object with the same object,
   * without the keys that were given.
   * References still stay.
   * Allows wildcard ending keys
   *
   * @param {Object} input any given object
   * @param {Array} of keys, allows also wildcards at the end, like: _*
   */
  removeProperties(input, keys) {
    const res = {};
    if ((!keys) instanceof Array || !keys.length) {
      console.error('[ERROR] removeProperties requires second parameter: array of keys to remove from object.');
      return input;
    }
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        const noFullMatch = keys.filter((k) => key.includes(k)).length === 0;
        const noPartialMatch =
          keys
            .filter((k) => k.endsWith('*'))
            .map((k) => k.slice(0, -1))
            .filter((k) => key.startsWith(k)).length === 0;
        if (noFullMatch && noPartialMatch) {
          res[key] = input[key];
        }
      }
    }
    return res;
  }

  /**
   * Compares two semver versions and returns 1, 0 or -1
   * Can be used as sort function.
   * Limited to full number comparisons, ignores dev, rc, next versions.
   * @param {string} a source
   * @param {string} b target
   * @example
   * semverCompare('1.0.0', '0.7.7')
   * ['1.3', '1.2', '1.4', '1.1'].sort(semverCompare)
   */
  semverCompare(a, b) {
    const pa = a.split('-')[0].split('.');
    const pb = b.split('-')[0].split('.');
    for (let i = 0; i < 3; i++) {
      const na = Number(pa[i]);
      const nb = Number(pb[i]);
      if (na > nb) return 1;
      if (nb > na) return -1;
      if (!isNaN(na) && isNaN(nb)) return 1;
      if (isNaN(na) && !isNaN(nb)) return -1;
    }
    return 0;
  }

  /**
   * Checks, if an experimental feature is enabled under settings.experminental
   *
   * @param {*} expFeatureName the feature name to check for
   * @param {*} showWarn if true, prints a warning on js console that feature is not enabled
   *
   * @returns true, if feature enabled, false otherwise.
   */
  requestExperimentalFeature(expFeatureName, showWarn) {
    const val = Boolean(LuigiConfig.getConfigValue('settings.experimental.' + expFeatureName));
    if (showWarn && !val) {
      console.warn('Experimental feature not enabled: ', expFeatureName);
    }
    return val;
  }

  /**
   * Creates a remote promise.
   * @returns {Promise} which returns true or a value when the promise will be resolved and returns false if the promise will be rejected.
   */
  createRemotePromise() {
    let res, rej;
    const prom = new Promise((resolve) => {
      res = (value) => {
        resolve(value || true);
      };
      rej = () => {
        resolve(false);
      };
    });

    let luiRP = LuigiConfig._remotePromises;
    if (!luiRP) {
      luiRP = {
        counter: 0,
        promises: []
      };
      LuigiConfig._remotePromises = luiRP;
    }
    prom.id = luiRP.counter++;
    luiRP.promises[prom.id] = prom;

    prom.doResolve = (value) => {
      delete luiRP.promises[prom.id];
      res(value);
    };
    prom.doReject = () => {
      delete luiRP.promises[prom.id];
      rej();
    };

    return prom;
  }

  getRemotePromise(id) {
    return LuigiConfig._remotePromises ? LuigiConfig._remotePromises.promises[id] : undefined;
  }

  isString(value) {
    return typeof value === 'string' || value instanceof String;
  }

  parseJSON(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(error);
    }
    return undefined;
  }

  calcMFELocation(element) {
    if (!element || !element.tagName) {
      return undefined;
    }

    if (element.closest('.drawer')) {
      return 'drawer';
    } else if (element.closest('.iframeModalCtn')) {
      return 'modal';
    } else if (element.closest('.iframeSplitViewCnt')) {
      return 'splitView';
    } else if (
      element.hasAttribute('lui_web_component') &&
      !element?.parentElement?.classList?.contains('wcContainer')
    ) {
      return undefined;
    }

    return 'main';
  }
}

export const GenericHelpers = new GenericHelpersClass();
