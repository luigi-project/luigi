class GenericHelperClass {
  constructor() {}
  /**
   * Creates a random Id
   * @returns random numeric value {number}
   * @private
   */
  getRandomId /* istanbul ignore next */() {
    return window.crypto.getRandomValues(new Uint32Array(1))[0];
  }

  /**
   * Checks if input is a promise.
   * @param promiseToCheck mixed
   * @returns {boolean}
   */
  isPromise(promiseToCheck: any) {
    return promiseToCheck && this.isFunction(promiseToCheck.then);
  }

  /**
   * Checks if input is a function.
   * @param functionToCheck mixed
   * @returns {boolean}
   */
  isFunction(functionToCheck: any) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
  }
}
export const GenericHelpers = new GenericHelperClass();
