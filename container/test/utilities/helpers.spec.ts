import { GenericHelperFunctions } from '../../src/utilities/helpers';

describe('GenericHelpers', () => {
  describe('isFunction function', () => {
    it('should return true for a function', () => {
      const testFunction = function () {};
      const result = GenericHelperFunctions.isFunction(testFunction);
      expect(result).toBe(true);
    });

    it('should return true for an arrow function', () => {
      const testArrowFunction = () => {};
      const result = GenericHelperFunctions.isFunction(testArrowFunction);
      expect(result).toBe(true);
    });

    it('should return false for an object', () => {
      const testObject = { key: 'value' };
      const result = GenericHelperFunctions.isFunction(testObject as any);
      expect(result).toBe(false);
    });

    it('should return false for an array', () => {
      const testArray = [1, 2, 3];
      const result = GenericHelperFunctions.isFunction(testArray as any);
      expect(result).toBe(false);
    });

    it('should return false for a string', () => {
      const testString = 'Hello, World!';
      const result = GenericHelperFunctions.isFunction(testString as any);
      expect(result).toBe(false);
    });
  });

  describe('isObject function', () => {
    it('should return true for an object', () => {
      const testObject = { key: 'value' };
      const result = GenericHelperFunctions.isObject(testObject);
      expect(result).toBe(true);
    });

    it('should return false for an array', () => {
      const testArray = [1, 2, 3];
      const result = GenericHelperFunctions.isObject(testArray);
      expect(result).toBe(false);
    });

    it('should return false for a string', () => {
      const testString = 'Hello, World!';
      const result = GenericHelperFunctions.isObject(testString as any);
      expect(result).toBe(false);
    });

    it('should return false for null', () => {
      const testNull = null;
      const result = GenericHelperFunctions.isObject(testNull);
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      const testUndefined = undefined;
      const result = GenericHelperFunctions.isObject(testUndefined);
      expect(result).toBe(false);
    });
  });

  describe('checkWebcomponentValue function', () => {
    it('should return the parsed object for a valid JSON string', () => {
      const jsonString = '{"selfRegistered": "true", "name": "MyComponent"}';
      const result = GenericHelperFunctions.checkWebcomponentValue(jsonString);
      expect(result).toEqual({ selfRegistered: 'true', name: 'MyComponent' });
    });

    it('should return the parsed object for a valid JSON string', () => {
      const jsonString = '{"selfRegistered": true, "name": "MyComponent"}';
      const result = GenericHelperFunctions.checkWebcomponentValue(jsonString);
      expect(result).toEqual({ selfRegistered: true, name: 'MyComponent' });
    });

    it('should return the boolean value as is', () => {
      const booleanValue = true;
      const result = GenericHelperFunctions.checkWebcomponentValue(booleanValue);
      expect(result).toBe(booleanValue);
    });

    it('should return the object as is', () => {
      const objValue = { name: 'MyComponent', selfRegistered: false };
      const result = GenericHelperFunctions.checkWebcomponentValue(objValue);
      expect(result).toEqual(objValue);
    });

    it('should throw invalid JSON error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const invalidJsonString = '{"selfRegistered": "true", "name": "MyComponent"';

      jest.spyOn(JSON, 'parse').mockImplementation(() => {
        console.error(new Error('Invalid JSON'));
      });

      const result = GenericHelperFunctions.checkWebcomponentValue(invalidJsonString);

      expect(result).toEqual(undefined);
      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Invalid JSON'));

      jest.restoreAllMocks();
      consoleErrorSpy.mockRestore();
    });

    it('should return undefined for unsupported input types', () => {
      const unsupportedValue = 42; // Number
      // @ts-ignore
      const result = GenericHelperFunctions.checkWebcomponentValue(unsupportedValue);
      expect(result).toStrictEqual(undefined);
    });
  });

  describe('prepareInternalDataObject', () => {
    it('should return default values when targetCnt has no properties set', () => {
      const targetCnt = {};
      const result = GenericHelperFunctions.prepareInternalDataObject(targetCnt as any);
      expect(result).toEqual({
        activeFeatureToggleList: [],
        currentLocale: undefined,
        currentTheme: undefined,
        userSettings: null,
        cssVariables: {},
        anchor: '',
        drawer: false,
        modal: false,
        viewStackSize: 0,
        isNavigateBack: false,
        clientPermissions: {},
        thirdPartyCookieCheck: { disabled: false }
      });
    });

    it('should use provided values from targetCnt', () => {
      const targetCnt = {
        activeFeatureToggleList: ['feature1', 'feature2'],
        locale: 'de-DE',
        theme: 'dark',
        userSettings: { timezone: 'UTC' },
        cssVariables: { '--color': 'red' },
        anchor: 'section1',
        drawer: true,
        modal: true,
        viewStackSize: 3,
        isNavigateBack: true,
        clientPermissions: { urlHistory: true },
        skipCookieCheck: 'true'
      };
      const result = GenericHelperFunctions.prepareInternalDataObject(targetCnt as any);
      expect(result).toEqual({
        activeFeatureToggleList: ['feature1', 'feature2'],
        currentLocale: 'de-DE',
        currentTheme: 'dark',
        userSettings: { timezone: 'UTC' },
        cssVariables: { '--color': 'red' },
        anchor: 'section1',
        drawer: true,
        modal: true,
        viewStackSize: 3,
        isNavigateBack: true,
        clientPermissions: { urlHistory: true },
        thirdPartyCookieCheck: { disabled: true }
      });
    });

    it('should set thirdPartyCookieCheck.disabled to false when skipCookieCheck is not "true"', () => {
      const targetCnt = { skipCookieCheck: 'false' };
      const result: any = GenericHelperFunctions.prepareInternalDataObject(targetCnt as any);
      expect(result.thirdPartyCookieCheck.disabled).toBe(false);
    });

    it('should set thirdPartyCookieCheck.disabled to false when skipCookieCheck is undefined', () => {
      const targetCnt = {};
      const result: any = GenericHelperFunctions.prepareInternalDataObject(targetCnt as any);
      expect(result.thirdPartyCookieCheck.disabled).toBe(false);
    });

    it('should keep userSettings as null when not provided', () => {
      const targetCnt = { userSettings: undefined };
      const result: any = GenericHelperFunctions.prepareInternalDataObject(targetCnt as any);
      expect(result.userSettings).toBeNull();
    });

    it('should use viewStackSize 0 as default when not provided', () => {
      const targetCnt = {};
      const result: any = GenericHelperFunctions.prepareInternalDataObject(targetCnt as any);
      expect(result.viewStackSize).toBe(0);
    });

    it('should pass through viewStackSize 0 explicitly set', () => {
      const targetCnt = { viewStackSize: 0 };
      const result: any = GenericHelperFunctions.prepareInternalDataObject(targetCnt as any);
      expect(result.viewStackSize).toBe(0);
    });
  });

  describe('resolveContext', () => {
    it('should parse a valid JSON string and return an object', () => {
      const stringObject = '{"key": "value"}';
      const result = GenericHelperFunctions.resolveContext(stringObject);
      expect(result).toEqual({ key: 'value' });
    });

    it('should return the input object if it is not a string', () => {
      const object = { key: 'value' };
      const result = GenericHelperFunctions.resolveContext(object);
      expect(result).toEqual(object);
    });

    it('should handle an empty string and return an empty object', () => {
      const emptyString = '';
      const result = GenericHelperFunctions.resolveContext(emptyString);
      expect(result).toEqual({});
    });

    it('should handle an undefined context and return an empty object', () => {
      const input = undefined;
      const result = GenericHelperFunctions.resolveContext(input);
      expect(result).toEqual({});
    });

    it('should log an error invalid JSON', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const invalidJsonString = '{"key": "value", "missingQuotes": "invalid}';

      jest.spyOn(JSON, 'parse').mockImplementation(() => {
        console.error(new Error('Invalid JSON'));
      });

      const result = GenericHelperFunctions.resolveContext(invalidJsonString);

      expect(result).toEqual(undefined);
      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Invalid JSON'));

      jest.restoreAllMocks();
      consoleErrorSpy.mockRestore();
    });
  });
});
