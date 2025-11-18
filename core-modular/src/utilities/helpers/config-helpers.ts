import type { Luigi } from '../../core-api/luigi';
import { AsyncHelpers } from './async-helpers';
import { GenericHelpers } from './generic-helpers';

class ConfigHelpersClass {
  setErrorMessage(errorMsg: string) {
    this.getLuigi().getEngine()?._connector?.showFatalError(errorMsg);
  }

  getLuigi(): Luigi {
    return (window as any).Luigi;
  }

  getConfigValue(key: string): any {
    return this.getLuigi().getConfigValue(key);
  }

  getConfigValueAsync(key: string): any {
    return this.getLuigi().getConfigValueAsync(key);
  }

  /**
     * Executes the function of the given property on the Luigi config object.
     * Fails if property is not a function.
     *
     * If the value is a Function it is called (with the given parameters) and the result of that call is the value.
     * If the value is not a Promise it is wrapped to a Promise so that the returned value is definitely a Promise.
     * @private
     * @memberof Configuration
     */
    async executeConfigFnAsync(property: string, throwError = false, ...parameters: any) {
      const fn = this.getConfigValue(property);
      if (GenericHelpers.isFunction(fn)) {
        try {
          return await AsyncHelpers.applyFunctionPromisified(fn, parameters);
        } catch (error) {
          if (throwError) {
            return Promise.reject(error);
          }
        }
      }
      return Promise.resolve(undefined);
    }

}

export const ConfigHelpers = new ConfigHelpersClass();
