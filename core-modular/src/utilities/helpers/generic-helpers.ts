export const GenericHelpers = {
  /**
   * Creates a random Id
   * @returns random numeric value {number}
   * @private
   */
  getRandomId: (): number => {
    return window.crypto.getRandomValues(new Uint32Array(1))[0];
  },

  /**
   * Checks if input is a promise.
   * @param promiseToCheck mixed
   * @returns {boolean}
   */
  isPromise: (promiseToCheck: any): boolean => {
    return promiseToCheck && GenericHelpers.isFunction(promiseToCheck.then);
  },

  /**
   * Checks if input is a function.
   * @param functionToCheck mixed
   * @returns {boolean}
   */
  isFunction: (functionToCheck: any): boolean => {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
  },

  /**
   * Checks if input is an async function.
   * @param functionToCheck mixed
   * @returns {boolean}
   */
  isAsyncFunction: (functionToCheck: any): boolean => {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object AsyncFunction]';
  },

  /**
   * Checks if input is a string.
   * @param stringToCheck mixed
   * @returns {boolean}
   */
  isString: (stringToCheck: string | any): boolean => {
    return typeof stringToCheck === 'string' || stringToCheck instanceof String;
  },

  /**
   * Checks if input is an object.
   * @param objectToCheck mixed
   * @returns {boolean}
   */
  isObject: (objectToCheck: object | any): boolean => {
    return !!(objectToCheck && typeof objectToCheck === 'object' && !Array.isArray(objectToCheck));
  },

  /**
   * Checks if a given input string begins a hash with slash
   * @param {string} path
   * @returns {boolean}
   */
  hasHash: (path: string): boolean => {
    return !!(path && path.search(/^[#\/].*$/) === 0);
  },

  /**
   * Removes leading hash of a string
   * @param {string} path
   * @returns {string}
   */
  getPathWithoutHash: (path: string): string => {
    while (GenericHelpers.hasHash(path)) {
      path = path.substring(1, path.length);
    }

    return path;
  },

  /**
   * Removes any trailing slash of a string
   * @param {string} path
   * @returns {string}
   */
  getTrimmedUrl: (path: string): string => {
    const pathUrl = path.length > 0 ? GenericHelpers.getPathWithoutHash(path) : path;

    return GenericHelpers.trimTrailingSlash(pathUrl.split('?')[0]);
  },

  /**
   * Adds a leading slash to a string if it has none
   * @param {string} str string to be checked
   * @returns {string} string with a leading slash
   */
  addLeadingSlash: (str: string): string => {
    return (!str.startsWith('/') ? '/' : '') + str;
  },

  /**
   * Removes leading slash of a string
   * @param {string} str string to be checked
   * @returns {string} string without leading slash
   */
  trimLeadingSlash: (str: string): string => {
    return GenericHelpers.isString(str) ? str.replace(/^\/+/g, '') : '';
  },

  /**
   * Prepend current url to redirect_uri, if it is a relative path
   * @param {string} str string from which any number of trailing slashes should be removed
   * @returns {string} string without any trailing slash
   */
  trimTrailingSlash: (str: string): string => {
    return GenericHelpers.isString(str) ? str.replace(/\/+$/, '') : '';
  },

  /**
   * Checks if HTML element is visible
   * @param {Element} element to be checked in DOM
   * @returns {boolean} `true` if element is visible - otherwise `false`
   */
  isElementVisible: (element: Element): boolean => {
    if (!element) {
      return false;
    }

    const cssDisplayValue: string = window.getComputedStyle(element).getPropertyValue('display');

    return cssDisplayValue !== 'none';
  },

  /**
   * Gets collection of HTML elements
   * @param {string} selector to be searched in DOM
   * @param {boolean} onlyVisible elements should be included
   * @returns {Array} collection of HTML elements
   */
  getNodeList: (selector: string, onlyVisible = false): Element[] => {
    const items: Element[] = [];

    if (!selector) {
      return items;
    }

    const elements: Element[] = Array.from(document.querySelectorAll(selector));

    elements.forEach((item: Element) => {
      if (onlyVisible) {
        if (GenericHelpers.isElementVisible(item)) {
          items.push(item);
        }
      } else {
        items.push(item);
      }
    });

    return items;
  },

  /**
   * Returns a new Object with the same object,
   * without the keys that were given.
   * References still stay.
   * Allows wildcard ending keys
   *
   * @param {Object} input - any given object
   * @param {Array} keys - allows also wildcards at the end, like: _*
   * @returns {Object} parsed object
   */
  removeProperties: (input: Record<string, any>, keys: string[]): object => {
    const res: Record<string, any> = {};

    if (!Array.isArray(keys) || !keys?.length) {
      console.error('[ERROR] removeProperties requires second parameter: array of keys to remove from object.');
      return input;
    }

    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
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
  },

  /**
   * Prepend current url to redirect_uri, if it is a relative path
   * @param {path} string full url, relative or absolute path
   * @returns {string} window location origin
   */
  prependOrigin: (path: string): string => {
    if (!path || path.startsWith('http')) {
      return path;
    }

    const hasLeadingSlash: boolean = path.startsWith('/');

    if (path.length) {
      return window.location.origin + (hasLeadingSlash ? '' : '/') + path;
    }

    return window.location.origin;
  },

  /**
   * Gets value of the given property on the given object.
   * @param object mixed
   * @param property name of the given property
   */
  getConfigValueFromObject: (object: Record<string, any>, property: string): any => {
    let propIndex = 0;
    let nextValue: any = object;
    const propertyPath = property.split('.');

    while (nextValue && propIndex < propertyPath.length) {
      nextValue = nextValue[propertyPath[propIndex++]];
    }

    return nextValue;
  },

  /**
   * Gets boolean value of specified property on the given object.
   * Function returns true if the property value is equal true or 'true'. Otherwise the function returns false.
   * @param {Object} object mixed
   * @param {string} property name of the given property
   * @returns {boolean} boolean value
   */
  getConfigBooleanValue: (object: Record<string, any>, property: string): boolean => {
    const configuredValue = GenericHelpers.getConfigValueFromObject(object, property);

    if (configuredValue === true || configuredValue === 'true') {
      return true;
    }

    return false;
  },

  getUrlParameter: (key: string) => {
    return new URLSearchParams(window.location.search).get(key);
  }
};
