import type { Luigi } from '../core-api/luigi';
import { defaultLuigiTranslationTable } from '../utilities/defaultLuigiTranslationTable';
import { EscapingHelpers } from './../utilities/helpers/escaping-helpers';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';

/**
 * Localization-related functions
 */
export class i18nService {
  currentLocaleStorageKey: string;
  defaultLocale: string;
  listeners: Record<number, (locale: string) => void>;
  translationImpl: any;
  translationTable: Record<string, any>;

  constructor(private luigi: Luigi) {
    this.currentLocaleStorageKey = 'luigi.currentLocale';
    this.defaultLocale = 'en';
    this.listeners = {};
    this.translationTable = defaultLuigiTranslationTable;
  }

  _init() {
    this._initCustomImplementation();
  }

  /**
   * Gets the current locale.
   * @returns {string} current locale
   */
  getCurrentLocale(): string {
    return sessionStorage.getItem(this.currentLocaleStorageKey) || this.defaultLocale;
  }

  /**
   * Sets current locale to the specified one.
   * @param {string} locale locale to be set as the current locale
   */
  setCurrentLocale(locale: string): void {
    if (locale) {
      sessionStorage.setItem(this.currentLocaleStorageKey, locale);
      this._notifyLocaleChange(locale);
    }

    this.luigi.getEngine()._connector?.setCurrentLocale(locale);
  }

  /**
   * Registers a listener for locale changes.
   * @param {Function} listener function called on every locale change with the new locale as argument
   * @returns {number | null} listener ID associated with the given listener; use it when removing the listener
   */
  addCurrentLocaleChangeListener(listener: (locale: string) => void): number | null {
    let listenerId = null;

    if (GenericHelpers.isFunction(listener)) {
      listenerId = GenericHelpers.getRandomId();
      this.listeners[listenerId] = listener;
    } else {
      console.error('Provided locale change listener is not a function.');
    }

    return listenerId;
  }

  /**
   * Unregisters a listener for locale changes.
   * @param {number} listenerId listener ID associated with the listener to be removed, returned by addCurrentLocaleChangeListener
   */
  removeCurrentLocaleChangeListener(listenerId: number): void {
    if (listenerId && this.listeners[listenerId]) {
      delete this.listeners[listenerId];
    } else {
      console.error('Unable to remove locale change listener - no listener registered for given ID.');
    }
  }

  /**
   * Gets translated text for the specified key in the current locale or in the specified one.
   * Property values for token replacement in the localization key will be taken from the specified interpolations object.
   *
   * <!-- add-attribute:class:success -->
   * > **TIP**: Be aware that this function is not asynchronous and therefore the translation table must be existing already at initialization. Take a look at our [i18n](i18n.md) section for an implementation suggestion.
   *
   * @param {string} key key to be translated
   * @param {Object} interpolations object with properties that will be used for token replacements in the localization key
   * @param {string} locale optional locale to get the translation for; default is the current locale
   * @returns {string} translated text for the specified key
   */
  getTranslation(key: string, interpolations = undefined, locale = undefined): string {
    if (!key) return '';

    if (this.translationImpl) {
      const result = this.translationImpl.getTranslation(key, interpolations, locale);

      if (result !== key) {
        return result;
      }
    }

    const findTranslation = this.findTranslation(key, this.translationTable, interpolations);

    return findTranslation ? findTranslation : key;
  }

  /**
   * @private
   */
  private _notifyLocaleChange(locale: string): void {
    Object.getOwnPropertyNames(this.listeners).forEach((listenerId: string) => {
      this.listeners[Number(listenerId)](locale);
    });

    this.luigi.configChanged();
  }

  /**
   * @private
   */
  private _initCustomImplementation(): void {
    this.translationImpl = this.luigi.getConfigValue('settings.customTranslationImplementation');

    if (GenericHelpers.isFunction(this.translationImpl)) {
      this.translationImpl = this.translationImpl();
    }
  }

  /**
   * @private
   * Finds the translated value based on given key.
   * @param {string} key key to be translated
   * @param {*} obj translation table
   * @param {Object | undefined} interpolations object with properties that will be used for token replacements in the localization key
   * @returns {string | undefined} current locale
   */
  private findTranslation(key: string, obj: any, interpolations: Record<any, string> | undefined): string | undefined {
    const splitted: string[] = key.split('.');

    for (let i = 0; i < splitted.length; i++) {
      const key = splitted[i];

      if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === 'object') {
        obj = obj[key];
      } else {
        if (interpolations) {
          return this.findInterpolations(obj[key], interpolations);
        }

        return obj[key];
      }
    }
  }

  /**
   * @private
   * Replaces values that are defiend in translation strings
   * @param {string} value string to be translated
   * @param {Object} interpolations translation table
   * @returns {string} current locale
   * @example
   * findInterpolations('Environment {num}', {num: 1})
   */
  private findInterpolations(value: string, interpolations: Record<any, string>): string {
    if (typeof value !== 'string' || !value.trim()) {
      return value;
    }

    Object.keys(interpolations).forEach((item: string) => {
      value = value.replace(
        new RegExp('{' + EscapingHelpers.escapeKeyForRegexp(item) + '}', 'gi'),
        interpolations[item]
      );
    });

    return value;
  }
}
