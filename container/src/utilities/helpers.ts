export class GenericHelpersClass {
  /**
   * DUPLICATE: Duplicate of 'core/src/utilities/helpers/generic-helpers.js > isFunction'
   * Keep one in the end
   *
   * Checks if input is a function.
   * @param {Function} functionToCheck - function to be checked
   * @returns {boolean}
   */
  isFunction(functionToCheck: (arg) => void): boolean {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
  }

  /**
   * Checks if input is an object.
   * @param {Object} objectToCheck - mixed
   * @returns {boolean}
   */
  isObject(objectToCheck: object): boolean {
    return !!(objectToCheck && typeof objectToCheck === 'object' && !Array.isArray(objectToCheck));
  }

  /**
   * Checks whether web component is an attribute or property. In case of attribute, it returns the parsed value.
   * @param {Object | boolean | string} webcomponent - value can either be an object, boolean or a stringified object, e.g webcomponent='{"selfregistered":"true"}'
   * @returns {Object | boolean} webcomponent returns the parsed webcomponent value
   */
  checkWebcomponentValue(webcomponent: object | boolean | string): object | boolean {
    if (typeof webcomponent === 'string') {
      return JSON.parse(webcomponent);
    } else if (typeof webcomponent === 'boolean' || typeof webcomponent === 'object') {
      return webcomponent;
    } else {
      console.warn('Webcomponent value has a wrong type.');
    }
  }

  /**
   * Resolves the context to an object. If the context is a string, it attempts to parse
   * it as JSON. If parsing fails JSON parse error will be thrown.
   * @param {Object | string} context - he context to be resolved
   * @returns {Object} the resolved context as an object
   */
  resolveContext(context: object | string): object {
    return context ? (typeof context === 'string' ? JSON.parse(context) : context) : {};
  }
}

export const GenericHelperFunctions = new GenericHelpersClass();
