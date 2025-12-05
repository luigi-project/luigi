// Standalone or partly-standalone methods that are used widely through the whole app and are asynchronous.
import { GenericHelpers } from './';

class AsyncHelpersClass {
  constructor() {
    this.handles = {};
    this.keyExistencyTimeout = 20000;
    this.keyExistencyCheckInterval = 50;
  }

  wrapAsPromise(value) {
    return new Promise(resolve => {
      resolve(value);
    });
  }

  /**
   * Executes a function with a set of parameters
   * and returns its value as promise
   *
   * @param {function} value - a function
   * @param {array} args - an array of arguments
   * @returns {promise}
   */
  applyFunctionPromisified(fn, args) {
    fn = fn.apply(this, args);
    if (GenericHelpers.isPromise(fn)) {
      return fn;
    }
    return this.wrapAsPromise(fn);
  }

  /*
   * Gets value of the given property on the given object.
   * If the value is a Function it is called and the result of that call is the value.
   * If the value is not a Promise it is wrapped to a Promise so that the returned value is definitely a Promise.
   */
  getConfigValueFromObjectAsync(object, property, ...parameters) {
    let value = GenericHelpers.getConfigValueFromObject(object, property);
    if (GenericHelpers.isFunction(value)) {
      return this.applyFunctionPromisified(value, parameters);
    }
    return this.wrapAsPromise(value);
  }
}

export const AsyncHelpers = new AsyncHelpersClass();
