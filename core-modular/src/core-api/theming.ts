import { serviceRegistry } from '../services/service-registry';
import { ViewUrlDecoratorSvc } from '../services/viewurl-decorator';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import type { Luigi } from './luigi';

declare global {
  interface Window {
    Luigi: any;
    __luigiThemeVars?: string[];
  }
}

export class Theming {
  #luigi: Luigi;
  #currentTheme: string = '';

  constructor(luigi: Luigi) {
    this.#luigi = luigi;
  }

  /**
   * Retrieves the available themes
   * @memberof Theming
   * @returns {promise} resolves an array of theming objects
   * @example
   * Luigi
   *  .theming()
   *  .getAvailableThemes()
   *  .then((themes) => {
   *     // Logic to generate theme selector
   *  });
   */
  async getAvailableThemes() {
    return await this.#luigi.getConfigValueAsync('settings.theming.themes');
  }

  /**
   * Sets the current theme id
   * @memberof Theming
   * @param {string} id of a theme object
   * @example
   * Luigi.theming().setCurrentTheme('light')
   */
  setCurrentTheme(id: string) {
    this.#currentTheme = id;
    // clear cache
    this.#luigi.__cssVars = undefined;
  }

  /**
   * Retrieves a theme object by name.
   * @memberof Theming
   * @param {string} id a theme id
   * @returns {promise} resolves a theme object
   * @example
   * Luigi
   *  .theming()
   *  .getThemeObject('light')
   *  .then((id => {
   *    // Logic
   *  }))
   */
  async getThemeObject(id: string): Promise<any> {
    const themes = (await this.getAvailableThemes()) as any[];
    return themes?.find((t) => t.id === id);
  }

  /**
   * Retrieves the current active theme. Falls back to **defaultTheme** if none explicitly specified before.
   * @memberof Theming
   * @returns {string} theme id
   * @example
   * Luigi.theming().getCurrentTheme()
   */
  getCurrentTheme() {
    if (!this.isThemingAvailable()) {
      return false;
    }
    if (this.#currentTheme) {
      return this.#currentTheme;
    }
    const theming = this.#luigi.getConfigValue('settings.theming');
    if (!theming.defaultTheme) {
      console.error(
        '[Theming] getCurrentTheme() error. No theme set and no defaultTheme found in configuration',
        theming
      );
    }
    return theming.defaultTheme;
  }
  /**
   * The general status about the Theming configuration.
   * @memberof Theming
   * @returns {boolean} `true` if **settings.theming** configuration object is defined
   * @example
   * Luigi.theming().isThemingAvailable()
   */
  isThemingAvailable() /* istanbul ignore next */ {
    return !!this.#luigi.getConfigValue('settings.theming');
  }

  /**
   * Returns CSS variables with key value from Luigi if `@luigi-project/core/luigi_theme-vars.js` is included in the `index.html` and `settings.theming.variables==='fiori'` is defined in the {@link general-settings.md settings} section.
   * It's also possible to define your own variables file which can be declared in `settings.theming.variables.file` in the {@link general-settings.md settings} section.
   * The variables should be defined in a JSON file which starts with a `root` key.
   * When you configure you own file, you can also implement exception handling by using the function `settings.theming.variables.errorHandling` which gets the error object as argument.
   * @memberof Theming
   * @returns {Object} CSS variables with their value.
   * @example Luigi.theming().getCSSVariables();
   */
  async getCSSVariables() {
    if (!window.Luigi.__cssVars) {
      const varFile = this.#luigi.getConfigValue('settings.theming.variables.file');
      if (varFile) {
        try {
          const resp = await fetch(varFile);
          window.Luigi.__cssVars = (await resp.json()).root;
          Object.keys(window.Luigi.__cssVars).forEach((key) => {
            const livePropVal = getComputedStyle(document.documentElement).getPropertyValue('--' + key);
            if (livePropVal) {
              window.Luigi.__cssVars[key] = livePropVal;
            }
          });
        } catch (error) {
          if (GenericHelpers.isFunction(this.#luigi.getConfigValue('settings.theming.variables.errorHandling'))) {
            this.#luigi.getConfigValue('settings.theming.variables.errorHandling')(error);
          } else {
            console.error('CSS variables file error: ', error);
          }
        }
      } else if (this.#luigi.getConfigValue('settings.theming.variables') === 'fiori' && window.__luigiThemeVars) {
        window.Luigi.__cssVars = {};
        window.__luigiThemeVars.forEach((key) => {
          window.Luigi.__cssVars[key] = getComputedStyle(document.documentElement).getPropertyValue('--' + key);
        });
      } else {
        window.Luigi.__cssVars = {}; // TODO: maybe allow also inline
      }
    }
    return window.Luigi.__cssVars;
  }

  /**
   * Initialize Theming Core API
   * @memberof Theming
   * @private
   */
  _init() /* istanbul ignore next */ {
    const viewUrlDecoratorService = serviceRegistry.get(ViewUrlDecoratorSvc);
    const setupViewUrlDecorator = () => {
      /**
       * Registers the viewUrl decorator
       * @memberof Theming
       * @private
       */
      const theming = this.#luigi.getConfigValue('settings.theming');
      if (theming && theming.nodeViewURLDecorator && theming.nodeViewURLDecorator.queryStringParameter) {
        viewUrlDecoratorService.add({
          type: 'queryString',
          uid: 'theming',
          key: theming.nodeViewURLDecorator.queryStringParameter.keyName,
          valueFn: () => {
            const value = this.getCurrentTheme();
            const configValueFn = theming.nodeViewURLDecorator.queryStringParameter.value;
            return configValueFn ? configValueFn(value) : value;
          }
        });
      }

      if (theming && theming.useFioriScrollbars === true) {
        document.body.classList.add('fioriScrollbars');
      }
    };
    setupViewUrlDecorator();
  }
}
