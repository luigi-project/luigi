// Standalone or partly-standalone methods that are used widely through the whole app and are asynchronous.
import { GenericHelpers } from './generic-helpers';

export const AsyncHelpers = {
  handles: {},
  keyExistencyTimeout: 20000,
  keyExistencyCheckInterval: 50,

  wrapAsPromise: (value: any): Promise<any> => {
    return new Promise((resolve) => {
      resolve(value);
    });
  },

  /**
   * Executes a function with a set of parameters
   * and returns its value as promise
   *
   * @param {function} fn a function
   * @param {array} args an array of arguments
   * @returns {promise}
   */
  applyFunctionPromisified: (fn: any, args: any): Promise<any> => {
    fn = fn.apply(this, args);

    if (GenericHelpers.isPromise(fn)) {
      return fn;
    }

    return AsyncHelpers.wrapAsPromise(fn);
  },

  /*
   * Gets value of the given property on the given object.
   * If the value is a Function it is called and the result of that call is the value.
   * If the value is not a Promise it is wrapped to a Promise so that the returned value is definitely a Promise.
   */
  getConfigValueFromObjectAsync: (
    object: Record<string, any>,
    property: string,
    ...parameters: any[]
  ): Promise<any> => {
    const value = GenericHelpers.getConfigValueFromObject(object, property);

    if (GenericHelpers.isFunction(value)) {
      return AsyncHelpers.applyFunctionPromisified(value, parameters);
    }

    return AsyncHelpers.wrapAsPromise(value);
  }
};
