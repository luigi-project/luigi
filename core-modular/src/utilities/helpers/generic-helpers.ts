import { replace, get } from 'lodash';

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
   * Removes leading slash of a string
   * @param {str} string
   * @returns {string} string without leading slash
   */
  trimLeadingSlash: (str: string): string => {
    return GenericHelpers.isString(str) ? str.replace(/^\/+/g, '') : '';
  },

  /**
   * Prepend current url to redirect_uri, if it is a relative path
   * @param {str} string from which any number of trailing slashes should be removed
   * @returns {string} string without any trailing slash
   */
  trimTrailingSlash: (str: string): string => {
    return GenericHelpers.isString(str) ? str.replace(/\/+$/, '') : '';
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

  /**
   * Gets boolean or string value based on given URL.
   * @param {string} url given URL to be parsed
   * @returns {boolean | string} boolean or string value
   */
  getUrlWithoutHash: (url: string): boolean | string => {
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
  },

  /**
   * Gets boolean value based on visibility of specified HTML element.
   * @param element HTML element to be checked
   * @returns {boolean} boolean value
   */
  isElementVisible: (element: Element): boolean => {
    const cssDisplayValue: string = window.getComputedStyle(element, null).getPropertyValue('display');

    return cssDisplayValue !== 'none';
  },

  /**
   * Compares two semver versions and returns 1, 0 or -1
   * Can be used as sort function.
   * Limited to full number comparisons, ignores dev, rc, next versions.
   * @param {string} a source
   * @param {string} b target
   * @returns {number} numeric value
   * @example
   * semverCompare('1.0.0', '0.7.7')
   * ['1.3', '1.2', '1.4', '1.1'].sort(semverCompare)
   */
  semverCompare: (a: string, b: string): number => {
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
  },

  /**
   * Gets string value based on given input.
   * @param {string} input string to be parsed
   * @returns {string} stringified output
   */
  escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  /**
   * Gets string value based on given arguments.
   * @param {string} inputString string to be parsed
   * @param {Object} params additional params
   * @param {string} prefix additional prefix
   * @param {boolean} parenthesis true by default
   * @returns {string} stringified output
   */
  replaceVars: (inputString: string, params: Record<string, any>, prefix: string, parenthesis = true): string => {
    let processedString = inputString;

    if (params) {
      if (parenthesis) {
        processedString = replace(processedString, /{([\s\S]+?)}/g, val => {
          let repl = val.slice(1, -1).trim();

          if (repl.indexOf(prefix) === 0) {
            repl = repl.substring(prefix.length);
          }

          return get(params, repl, val);
        });
      } else {
        Object.entries(params).forEach(entry => {
          processedString = processedString.replace(
            new RegExp(GenericHelpers.escapeRegExp(prefix + entry[0]), 'g'),
            encodeURIComponent(entry[1] as any)
          );
        });
      }
    }

    if (parenthesis) {
      processedString = processedString.replace(new RegExp('\\{' + GenericHelpers.escapeRegExp(prefix) + '[^\\}]+\\}', 'g'), '');
    }

    return processedString;
  }
};
