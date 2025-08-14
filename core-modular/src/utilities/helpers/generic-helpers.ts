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
  isObject(objectToCheck: object | any): boolean {
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
  prependOrigin(path: string): string {
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
  getConfigValueFromObject(object: Record<string, any>, property: string): any {
    let propIndex = 0;
    let nextValue: any = object;
    const propertyPath = property.split('.');

    while (nextValue && propIndex < propertyPath.length) {
      nextValue = nextValue[propertyPath[propIndex++]];
    }

    return nextValue;
  }
};
