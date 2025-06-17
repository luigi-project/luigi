export const GenericHelpers = {
  
  /**
   * Creates a random Id
   * @returns random numeric value {number}
   * @private
   */
  getRandomId: /* istanbul ignore next */() => {
    return window.crypto.getRandomValues(new Uint32Array(1))[0];
  },

  /**
   * Checks if input is a promise.
   * @param promiseToCheck mixed
   * @returns {boolean}
   */
  isPromise: (promiseToCheck: any) => {
    return promiseToCheck && GenericHelpers.isFunction(promiseToCheck.then);
  },

  /**
   * Checks if input is a function.
   * @param functionToCheck mixed
   * @returns {boolean}
   */
  isFunction: (functionToCheck: any) => {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
  },

   /**
   * Checks if input is a string.
   * @param stringToCheck mixed
   * @returns {boolean}
   */
   isString: (stringToCheck: string | any) =>{
    return typeof stringToCheck === 'string' || stringToCheck instanceof String;
  },

  /**
   * Removes leading slash of a string
   * @param {str} string
   * @returns {string} string without leading slash
   */
  trimLeadingSlash: (str: string) => {
    return GenericHelpers.isString(str) ? str.replace(/^\/+/g, '') : '';
  },

  /**
   * Prepend current url to redirect_uri, if it is a relative path
   * @param {str} string from which any number of trailing slashes should be removed
   * @returns string string without any trailing slash
   */
  trimTrailingSlash: (str: string) => {
    return GenericHelpers.isString(str) ? str.replace(/\/+$/, '') : '';
  }
};
