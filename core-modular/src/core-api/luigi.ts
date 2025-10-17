import { writable, type Subscriber, type Updater } from 'svelte/store';
import type { LuigiEngine } from '../luigi-engine';
import { i18nService } from '../services/i18n.service';
import { AsyncHelpers } from '../utilities/helpers/async-helpers';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { Navigation } from './navigation';
import { Routing } from './routing';
import { UX } from './ux';
import { Theming } from './theming';

export class Luigi {
  config: any;
  _store: any;
  _i18n!: i18nService;
  _theming?: Theming;
  _routing?: Routing;
  __cssVars?: any;
  configReadyCallback = function () {};

  private USER_SETTINGS_KEY = 'luigi.preferences.userSettings';

  constructor(private engine: LuigiEngine) {
    this._store = this.createConfigStore();
  }

  getEngine(): LuigiEngine {
    return this.engine;
  }

  // NOTE: using arrow style functions to have "code completion" in browser dev tools
  setConfig = (cfg: any) => {
    this.config = cfg;
    this.setConfigCallback(this.getConfigReadyCallback());
    this.engine.init();
    this.luigiAfterInit();
  };

  getConfig = (): any => {
    return this.config;
  };

  configChanged = (...scopes: string[]): void => {
    this.getEngine()._ui.update(scopes);
  };

  /**
   * Gets value of the given property on Luigi config object. Target can be a value or a synchronous function.
   * @param {string} property the object traversal path
   * @example
   * Luigi.getConfigValue('auth.use')
   * Luigi.getConfigValue('settings.sideNavFooterText')
   */
  getConfigValue(property: string): any {
    return GenericHelpers.getConfigValueFromObject(this.getConfig(), property);
  }

  /**
   * Gets value of the given property on the Luigi config object.
   * If the value is a Function it is called (with the given parameters) and the result of that call is the value.
   * If the value is not a Promise it is wrapped to a Promise so that the returned value is definitely a Promise.
   * @memberof Configuration
   * @param {string} property the object traversal path
   * @param {*} parameters optional parameters that are used if the target is a function
   * @example
   * Luigi.getConfigValueAsync('navigation.nodes')
   * Luigi.getConfigValueAsync('navigation.profile.items')
   * Luigi.getConfigValueAsync('navigation.contextSwitcher.options')
   */
  getConfigValueAsync(property: string, ...parameters: any[]): Promise<any> {
    return AsyncHelpers.getConfigValueFromObjectAsync(this.getConfig(), property, parameters);
  }

  /**
   * Reads the user settings object.
   * You can choose a custom storage to read the user settings by implementing the `userSettings.readUserSettings` function in the settings section of the Luigi configuration.
   * By default, the user settings will be read from the **localStorage**
   * @returns {Promise} a promise when a custom `readUserSettings` function in the settings.userSettings section of the Luigi configuration is implemented. It resolves a stored user settings object. If the promise is rejected the user settings dialog will also closed if the error object has a `closeDialog` property, e.g `reject({ closeDialog: true, message: 'some error' })`. In addition a custom error message can be logged to the browser console.
   * @example
   * Luigi.readUserSettings();
   */
  async readUserSettings() {
    const userSettingsConfig = await this.getConfigValueAsync('userSettings');
    const userSettings = userSettingsConfig
      ? userSettingsConfig
      : await this.getConfigValueAsync('settings.userSettings');

    if (userSettings && GenericHelpers.isFunction(userSettings.readUserSettings)) {
      return userSettings.readUserSettings();
    }

    const localStorageValue = localStorage.getItem(this.USER_SETTINGS_KEY);

    return localStorageValue && JSON.parse(localStorageValue);
  }

  /**
   * Stores the user settings object.
   * You can choose a custom storage to write the user settings by implementing the `userSetting.storeUserSettings` function in the settings section of the Luigi configuration
   * By default, the user settings will be written from the **localStorage**
   * @param {Object} userSettingsObj to store in the storage.
   * @param {Object} previousUserSettingsObj the previous object from storage.
   * @returns {Promise} a promise when a custom `storeUserSettings` function in the settings.userSettings section of the Luigi configuration is implemented. If it is resolved the user settings dialog will be closed. If the promise is rejected the user settings dialog will also closed if the error object has a `closeDialog` property, e.g `reject({ closeDialog: true, message: 'some error' })`. In addition a custom error message can be logged to the browser console.
   * @example
   * Luigi.storeUserSettings(userSettingsobject, previousUserSettingsObj);
   */
  async storeUserSettings(userSettingsObj: Record<string, any>, previousUserSettingsObj: Record<string, any>): Promise<any> {
    const userSettingsConfig = await this.getConfigValueAsync('userSettings');
    const userSettings = userSettingsConfig
      ? userSettingsConfig
      : await this.getConfigValueAsync('settings.userSettings');
    if (userSettings && GenericHelpers.isFunction(userSettings.storeUserSettings)) {
      return userSettings.storeUserSettings(userSettingsObj, previousUserSettingsObj);
    } else {
      localStorage.setItem(this.USER_SETTINGS_KEY, JSON.stringify(userSettingsObj));
    }
    this.configChanged();
  }

  i18n = (): i18nService => {
    if (!this._i18n) {
      this._i18n = new i18nService(this);
    }

    return this._i18n;
  };

  navigation = (): Navigation => {
    return new Navigation(this);
  };

  ux = (): UX => {
    return new UX(this);
  };

  routing = (): Routing => {
    if (!this._routing) {
      this._routing = new Routing(this);
    }
    return this._routing as Routing;
  };

  theming = (): Theming => {
    if (!this._theming) {
      this._theming = new Theming(this);
    }
    return this._theming as Theming;
  };

  private luigiAfterInit(): void {
    const shouldHideAppLoadingIndicator: boolean = GenericHelpers.getConfigBooleanValue(
      this.getConfig(),
      'settings.appLoadingIndicator.hideAutomatically'
    );

    if (shouldHideAppLoadingIndicator) {
      // Timeout needed, otherwise loading indicator might not be present yet and when displayed will not be hidden
      setTimeout(() => {
        this.ux().hideAppLoadingIndicator();
      }, 0);
    }
  }

  private createConfigStore(): any {
    const { subscribe, update } = writable({});
    const scopeSubscribers: Record<any, any> = {};
    let unSubscriptions: any[] = [];

    return {
      subscribe: (fn: Subscriber<{}>) => {
        // subscribe fn returns unsubscription fn
        unSubscriptions.push(subscribe(fn));
      },
      update,
      reset: (fn: Updater<{}>) => {
        update(fn);
      },
      subscribeToScope: (fn: Subscriber<{}>, scope: any) => {
        let subscribers = scopeSubscribers[scope];

        if (!subscribers) {
          subscribers = new Set();
          scopeSubscribers[scope] = subscribers;
        }

        subscribers.add(fn);
      },
      fire: (scope: any, data: any) => {
        const subscribers = scopeSubscribers[scope];

        if (subscribers) {
          [...subscribers].forEach((fn) => {
            fn(data);
          });
        }
      },
      clear: () => {
        unSubscriptions.forEach((sub) => {
          sub();
        });
        unSubscriptions = [];
      }
    };
  }

  private getConfigReadyCallback(): Promise<void> {
    return new Promise((resolve) => {
      this.i18n()._init();
      resolve();
    });
  }

  private setConfigCallback(configReadyCallback: any): void {
    this.configReadyCallback = configReadyCallback;
  }
}
