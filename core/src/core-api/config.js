import {
  AsyncHelpers,
  EventListenerHelpers,
  GenericHelpers,
  StateHelpers,
  IframeHelpers,
  RoutingHelpers
} from '../utilities/helpers';
import { LuigiAuth, LuigiElements } from '.';
import { AuthLayerSvc, LifecycleHooks } from '../services';
import { NodeDataManagementStorage } from '../services/node-data-management.js';
/**
 * @name Configuration
 */
class LuigiConfig {
  /**
   * @private
   * @memberof Configuration
   */
  constructor() {
    this.configReadyCallback = function () {};
    this.initialized = false;
    this.USER_SETTINGS_KEY = 'luigi.preferences.userSettings';
  }

  /**
   * @private
   * @memberof Configuration
   */
  setConfigCallbacks(configReadyCallback) {
    this.configReadyCallback = configReadyCallback;
  }

  /**
   * Sets the configuration for Luigi initially. Can also be called at a later point in time again to update the configuration.
   * @memberof Configuration
   * @param {Object} configInput the Luigi Core configuration object
   * @example
   * Luigi.setConfig({
   *   navigation: {
   *     nodes: () => [
   *       {
   *         pathSegment: 'home',
   *         label: 'Home',
   *         children: [
   *           {
   *             pathSegment: 'hello',
   *             label: 'Hello Luigi!',
   *             viewUrl: '/assets/basicexternal.html'
   *           }
   *         ]
   *       }
   *     ]
   *   },
   *   routing: {
   *     useHashRouting: true
   *   }
   * })
   */
  async setConfig(configInput) {
    this.config = configInput;
    window.Luigi._store.update(() => {
      return { config: configInput };
    });
    this._configModificationTimestamp = new Date();
    if (!this.initialized) {
      this.initialized = true;
      this.configReadyCallback().then(async () => {
        LifecycleHooks.luigiAfterInit();
        await this.executeConfigFnAsync('lifecycleHooks.luigiAfterInit');
      });
    }
  }

  /**
   * Returns the current active configuration
   * @returns {Object} configuration object
   * @memberof Configuration
   * @example
   * Luigi.getConfig()
   */
  getConfig() {
    return this.config;
  }

  /**
   * Tells Luigi that the configuration has been changed. Luigi will update the application or parts of it based on the specified scope.
   * @param {...string} scope one or more scope selectors specifying what parts of the configuration were changed. If no scope selector is provided, the whole configuration is considered changed.
   * <p>
   * The supported scope selectors are:
   * <p>
   * <ul>
   *   <li><code>navigation</code>: the navigation part of the configuration was changed. This includes navigation nodes, the context switcher, the product switcher and the profile menu.</li>
   *   <li><code>navigation.nodes</code>: navigation nodes were changed.</li>
   *   <li><code>navigation.contextSwitcher</code>: context switcher related data were changed.</li>
   *   <li><code>navigation.productSwitcher</code>: product switcher related data were changed.</li>
   *   <li><code>navigation.profile</code>: profile menu was changed.</li>
   *   <li><code>settings</code>: settings were changed.</li>
   *   <li><code>settings.header</code>: header settings (title, icon) were changed.</li>
   *   <li><code>settings.footer</code>: left navigation footer settings were changed.</li>
   * </ul>
   * @memberof Configuration
   */
  configChanged(...scope) {
    const optimizedScope = StateHelpers.optimizeScope(scope);
    if (optimizedScope.length > 0) {
      optimizedScope.forEach((s) => {
        window.Luigi._store.fire(s, { current: window.Luigi._store });
      });
    } else {
      window.Luigi._store.update((config) => config);
    }
  }

  /**
   * @private
   * @memberof Configuration
   */
  setErrorMessage(errorMsg) {
    var errorTextNode = document.createTextNode(errorMsg);
    var fd_ui = document.createElement('div');
    fd_ui.setAttribute('class', 'fd-ui');
    fd_ui.setAttribute('style', 'text-align: center;');

    var errorDiv = document.createElement('div');
    errorDiv.setAttribute('class', 'fd-message-strip fd-message-strip--error');
    errorDiv.setAttribute('style', 'max-width: 800px; display: inline-block; margin-top: 40px;');
    errorDiv.appendChild(errorTextNode);

    fd_ui.appendChild(errorDiv);
    LuigiElements.getLuigiContainer().appendChild(fd_ui);
  }

  /**
   * Gets value of the given property on Luigi config object. Target can be a value or a synchronous function.
   * @memberof Configuration
   * @param {string} property the object traversal path
   * @example
   * Luigi.getConfigValue('auth.use')
   * Luigi.getConfigValue('settings.sideNavFooterText')
   */
  getConfigValue(property) {
    return GenericHelpers.getConfigValueFromObject(this.getConfig(), property);
  }

  /**
   * Gets boolean value of the given property on Luigi config object.
   * Function return true if the property value is equal true or 'true'. Otherwise the function returns false.
   * @memberof Configuration
   * @param {string} property the object traversal path
   * @example
   * Luigi.getConfigBooleanValue('settings.hideNavigation')
   */
  getConfigBooleanValue(property) {
    const configuredValue = GenericHelpers.getConfigValueFromObject(this.getConfig(), property);
    if (configuredValue === true || configuredValue === 'true') {
      return true;
    }
    return false;
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
  getConfigValueAsync(property, ...parameters) {
    return AsyncHelpers.getConfigValueFromObjectAsync(this.getConfig(), property, parameters);
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
  async executeConfigFnAsync(property, throwError = false, ...parameters) {
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

    // Promise.reject(property + ' is not a function.');
    return Promise.resolve(undefined);
  }

  /**
   * Detects if authorization is enabled via configuration.
   * @memberof Configuration
   * @returns {boolean} returns true if authorization is enabled. Otherwise returns false.
   * @deprecated now located in Luigi.auth() instead of Luigi
   */
  isAuthorizationEnabled() {
    return LuigiAuth.isAuthorizationEnabled();
  }

  /**
   * Unloads the current Luigi instance, which can be initialized later again by using `Luigi.setConfig({...})`
   * @memberof Configuration
   * @since 1.2.2
   * @example
   * Luigi.unload()
   */
  unload() {
    this.initialized = false;
    window.Luigi._store.clear();
    AuthLayerSvc.unload();
    EventListenerHelpers.removeAllEventListeners();
    const container = LuigiElements.getLuigiContainer();
    while (container.firstChild) {
      container.removeChild(container.lastChild);
    }
  }

  /**
   * Reads the user settings object.
   * You can choose a custom storage to read the user settings by implementing the `userSettings.readUserSettings` function in the settings section of the Luigi configuration.
   * By default, the user settings will be read from the **localStorage**
   * @memberof Configuration
   * @returns {promise} a promise when a custom `readUserSettings` function in the settings.userSettings section of the Luigi configuration is implemented. It resolves a stored user settings object. If the promise is rejected the user settings dialog will also closed if the error object has a `closeDialog` property, e.g `reject({ closeDialog: true, message: 'some error' })`. In addition a custom error message can be logged to the browser console.
   * @example
   * Luigi.readUserSettings();
   * @since 1.7.1
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

    return localStorageValue && GenericHelpers.parseJSON(localStorageValue);
  }

  /**
   * Stores the user settings object.
   * You can choose a custom storage to write the user settings by implementing the `userSetting.storeUserSettings` function in the settings section of the Luigi configuration
   * By default, the user settings will be written from the **localStorage**
   * @memberof Configuration
   * @returns {promise} a promise when a custom `storeUserSettings` function in the settings.userSettings section of the Luigi configuration is implemented. If it is resolved the user settings dialog will be closed. If the promise is rejected the user settings dialog will also closed if the error object has a `closeDialog` property, e.g `reject({ closeDialog: true, message: 'some error' })`. In addition a custom error message can be logged to the browser console.
   * @param {Object} userSettingsObj to store in the storage.
   * @param {Object} previousUserSettingsObj the previous object from storage.
   * @example
   * Luigi.storeUserSettings(userSettingsobject, previousUserSettingsObj);
   * @since 1.7.1
   */
  async storeUserSettings(userSettingsObj, previousUserSettingsObj) {
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

  /**
   * Reset the current Luigi instance and initialize Luigi with the latest Luigi config.
   * @memberof Configuration
   * @example
   * Luigi.reset();
   * @since 1.14.0
   */
  reset() {
    const cfg = this.getConfig();
    this.unload();
    this.setConfig(cfg);
  }

  /**
   * Clear navigation node related caches.
   * @memberof Configuration
   * @example
   * Luigi.clearNavigationCache();
   * @since 1.19.0
   */
  clearNavigationCache() {
    NodeDataManagementStorage.deleteCache();

    const clearTitleResolverCache = (nodes) => {
      if (nodes && nodes.forEach) {
        nodes.forEach((node) => {
          if (node.titleResolver && node.titleResolver._cache) {
            node.titleResolver._cache = undefined;
          }
          if (node.children) {
            clearTitleResolverCache(node.children);
          }
        });
      }
    };

    clearTitleResolverCache(this.getConfig().navigation.nodes);
  }

  /**
   * Set the global context object and triggers the corresponding update.
   * @memberof Configuration
   * @param {Object} ctx The context object to set
   * @param {boolean} preventUpdate If true, no view update is triggered. Default is false.
   * @since 2.5.0
   */
  setGlobalContext(ctx, preventUpdate) {
    if (this.config && this.config.navigation) {
      this.config.navigation.globalContext = ctx;
      if (!preventUpdate) {
        this.configChanged('navigation');
      }
    }
  }

  /**
   * Get the global context object.
   * @memberof Configuration
   * @since 2.5.0
   */
  getGlobalContext() {
    return this.config?.navigation?.globalContext || {};
  }

  /**
   * Updates the context values for visible iframes and LUI web components.
   * Note: the updated context values are not persisted. The developers have to do it on their own.
   * @param {Object} ctx - The context to be updated.
   * @memberof Configuration
   * @since 2.13.0
   */
  updateContextValues(ctx) {
    const visibleIframes = IframeHelpers.getMicrofrontendIframes();
    if (visibleIframes && visibleIframes.length > 0) {
      visibleIframes.forEach((iframe) => {
        // luigi configuration data about the mf which is rendered in the iframe
        if (iframe.luigi) {
          IframeHelpers.sendMessageToIframe(iframe, {
            msg: 'luigi.navigate',
            context: JSON.stringify(Object.assign({}, GenericHelpers.parseJSON(iframe.luigi._lastUpdatedMessage.context), ctx)),
            nodeParams: iframe.luigi._lastUpdatedMessage.nodeParams,
            pathParams: JSON.stringify(Object.assign({}, iframe.luigi.pathParams)),
            searchParams: JSON.stringify(
              Object.assign({}, RoutingHelpers.prepareSearchParamsForClient(iframe.luigi.currentNode))
            ),
            internal: IframeHelpers.applyCoreStateData(GenericHelpers.parseJSON(iframe.luigi._lastUpdatedMessage.internal))
          });
        }
      });
    }
    if (document.querySelector('.wcContainer')) {
      let luiWebComponents = document.querySelectorAll('[lui_web_component=true]');
      luiWebComponents.forEach((luiWebComponent) => {
        luiWebComponent.context = Object.assign({}, luiWebComponent.context, ctx);
      });
    }
  }
}

export const config = new LuigiConfig();
