import { GenericHelpers } from '../../src/utilities/helpers/generic-helpers';
import { i18nService } from '../../src/services/i18n.service';

describe('I18N Service', function () {
  jest.retryTimes(2);

  let config: any;
  let luigi: any = {};
  let sessionStorageSpy: any;
  let LuigiI18N: i18nService;

  beforeEach(() => {
    const storageMock = {
      getItem: jest.fn(),
      setItem: jest.fn()
    };
    luigi = {
      config: {},
      engine: {},
      getConfig: () => ({ routing: { contentViewParamPrefix: '~' } }),
      getEngine: () => ({}),
      setConfig: () => {},
      configChanged: () => {},
      navigation: () => ({ navigate: () => {} }),
      routing: () => ({ getSearchParams: () => ({}) }),
      uxManager: () => ({}),
      linkManager: () => ({}),
      getConfigValue: () => null,
      getActiveFeatureToggles: () => []
    };
    config = luigi.getConfig();
    LuigiI18N = new i18nService(luigi);
    sessionStorageSpy = jest.spyOn(global, 'sessionStorage', 'get');
    sessionStorageSpy.mockImplementation(() => {
      return storageMock;
    });
    jest.spyOn(LuigiI18N.luigi, 'configChanged').mockClear().mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    sessionStorageSpy.mockRestore();
  });

  describe('current locale', () => {
    it('should return default locale', () => {
      const locale = LuigiI18N.getCurrentLocale();
      expect(locale).toEqual('en');
    });

    it('should return previously set locale', () => {
      global.sessionStorage.getItem.mockReturnValue('mock-locale');
      const locale = LuigiI18N.getCurrentLocale();
      expect(locale).toEqual('mock-locale');
    });

    it('should set locale if client permission is set to true', () => {
      const notifyLocaleChangeSpy = jest.spyOn(LuigiI18N, '_notifyLocaleChange');
      LuigiI18N.setCurrentLocale('de', { clientPermissions: { changeCurrentLocale: true } } as any);
      expect(global.sessionStorage.setItem).toHaveBeenCalledWith('luigi.currentLocale', 'de');
      expect(notifyLocaleChangeSpy).toHaveBeenCalledWith('de');
    });

    it('should not set locale if client permission is set to false', () => {
      const notifyLocaleChangeSpy = jest.spyOn(LuigiI18N, '_notifyLocaleChange');
      LuigiI18N.setCurrentLocale('de', { clientPermissions: { changeCurrentLocale: false } } as any);
      expect(global.sessionStorage.setItem).not.toHaveBeenCalled();
      expect(notifyLocaleChangeSpy).not.toHaveBeenCalled();
    });

    it('should not set locale if client permission is missing', () => {
      const notifyLocaleChangeSpy = jest.spyOn(LuigiI18N, '_notifyLocaleChange');
      LuigiI18N.setCurrentLocale('de');
      expect(global.sessionStorage.setItem).not.toHaveBeenCalled();
      expect(notifyLocaleChangeSpy).not.toHaveBeenCalled();
    });

    it('should not set empty locale', () => {
      const notifyLocaleChangeSpy = jest.spyOn(LuigiI18N, '_notifyLocaleChange');
      LuigiI18N.setCurrentLocale('');
      expect(global.sessionStorage.setItem).not.toHaveBeenCalled();
      expect(notifyLocaleChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('current locale listeners', () => {
    it('does not add listener when it is not a function', () => {
      jest.spyOn(GenericHelpers, 'isFunction').mockClear().mockReturnValue(false);
      const listenerId = LuigiI18N.addCurrentLocaleChangeListener('mock-listener');
      expect(GenericHelpers.isFunction).toHaveBeenCalledWith('mock-listener');
      expect(Object.getOwnPropertyNames(LuigiI18N.listeners).length).toEqual(0);
      expect(listenerId).toEqual(null);
    });

    it('add listener when it is a function', () => {
      jest.spyOn(GenericHelpers, 'isFunction').mockClear().mockReturnValue(true);
      jest.spyOn(GenericHelpers, 'getRandomId').mockClear().mockReturnValue(123);
      const mockListener = () => 'mock-method';
      const listenerId = LuigiI18N.addCurrentLocaleChangeListener(mockListener);
      expect(GenericHelpers.isFunction).toHaveBeenCalledWith(mockListener);
      expect(GenericHelpers.getRandomId).toHaveBeenCalled();
      expect(LuigiI18N.listeners[123]).toEqual(mockListener);
      expect(listenerId).toEqual(123);
    });

    it('remove a listener', () => {
      LuigiI18N.listeners[123] = () => {};
      LuigiI18N.removeCurrentLocaleChangeListener(123);
      expect(LuigiI18N.listeners[123]).toEqual(undefined);
    });

    it('does not remove a listener when called with a wrong id', () => {
      const listener = () => {};
      LuigiI18N.listeners[123] = listener;
      LuigiI18N.removeCurrentLocaleChangeListener(456);
      expect(LuigiI18N.listeners[123]).toEqual(listener);
    });

    it('should be notified by locale change', () => {
      LuigiI18N.listeners = {
        1: jest.fn(),
        2: jest.fn(),
        3: jest.fn()
      };
      LuigiI18N._notifyLocaleChange('pl');
      expect(LuigiI18N.listeners['1']).toHaveBeenCalledWith('pl');
      expect(LuigiI18N.listeners['2']).toHaveBeenCalledWith('pl');
      expect(LuigiI18N.listeners['3']).toHaveBeenCalledWith('pl');
      expect(LuigiI18N.luigi.configChanged).toHaveBeenCalled();
    });
  });

  describe('custom translation', () => {
    let mockConfig: any;
    // custom config
    const luigi = {
      en: {
        tets: 'tests'
      },
      de: {
        project: 'luigi'
      },
      luigi: {
        it: {
          da: 'Toni'
        }
      }
    };
    const getMockConfig = () => ({
      getTranslation: (key, interpolations, locale) => {
        if (luigi[locale]) {
          return luigi[locale][key];
        }
      }
    });

    beforeEach(() => {
      mockConfig = getMockConfig();
    });

    it('_initCustomImplementation: get custom translation from config', () => {
      jest.spyOn(LuigiI18N.luigi, 'getConfigValue').mockClear().mockReturnValue(mockConfig);
      LuigiI18N._initCustomImplementation();
      expect(LuigiI18N.translationImpl).toEqual(mockConfig);
    });

    it('findTranslation test', () => {
      jest.spyOn(Object, 'hasOwnProperty').mockClear().mockReturnValue(true);
      const translationTable = {
        luigi: {
          luigiModal: {
            header: 'Luigi status modal',
            body: {
              error: 'Luigi is sad!',
              success: 'Luigi is happy!'
            }
          },
          button: {
            dismiss: 'no',
            confirm: 'yes'
          }
        }
      };
      LuigiI18N.translationTable = translationTable;
      expect(LuigiI18N.findTranslation('luigi.luigiModal.body.success', LuigiI18N.translationTable)).toEqual(
        'Luigi is happy!'
      );
      expect(LuigiI18N.findTranslation('luigi.button.confirm', LuigiI18N.translationTable)).toEqual('yes');
    });

    it('custom translation test', () => {
      LuigiI18N.translationImpl = mockConfig;
      expect(LuigiI18N.getTranslation('tets', null, 'en')).toEqual('tests');
      expect(LuigiI18N.getTranslation('project', null, 'de')).toEqual('luigi');

      LuigiI18N.translationImpl = null;
      LuigiI18N.translationTable = luigi;
      expect(LuigiI18N.getTranslation('tets')).toEqual('tets');
      expect(LuigiI18N.getTranslation('luigi.it.da')).toEqual('Toni');
      // not matching key
      expect(LuigiI18N.getTranslation('luigi.de.project')).toEqual('luigi.de.project');
    });
  });
});
