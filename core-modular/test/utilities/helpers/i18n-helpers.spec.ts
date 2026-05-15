import { I18nHelpers } from '../../../src/utilities/helpers/i18n-helpers';

describe('I18nHelpers', () => {
  describe('hasLocaleChangePermission', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should return true when changeCurrentLocale permission is set', () => {
      const containerElement = { clientPermissions: { changeCurrentLocale: true } };
      expect(I18nHelpers.hasLocaleChangePermission(containerElement)).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return false and log error when changeCurrentLocale is false', () => {
      const containerElement = { clientPermissions: { changeCurrentLocale: false } };
      expect(I18nHelpers.hasLocaleChangePermission(containerElement)).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Current locale change declined from client, as client permission "changeCurrentLocale" is not set for this view.'
      );
    });

    it('should return false and log error when clientPermissions is missing', () => {
      const containerElement = {};
      expect(I18nHelpers.hasLocaleChangePermission(containerElement)).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return false and log error when containerElement is undefined', () => {
      expect(I18nHelpers.hasLocaleChangePermission(undefined)).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return false and log error when containerElement is null', () => {
      expect(I18nHelpers.hasLocaleChangePermission(null)).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
