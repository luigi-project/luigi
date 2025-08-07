import type { LuigiEngine } from '../luigi-engine';
import { Navigation } from './navigation';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { Routing } from './routing';
import { UX } from './ux';

export class Luigi {
  config: any;

  constructor(private engine: LuigiEngine) {}

  getEngine() {
    return this.engine;
  }

  // NOTE: using arrow style functions to have "code completion" in browser dev tools
  setConfig = (cfg: any) => {
    this.config = cfg;
    this.engine.init();
  };

  getConfig = (): any => {
    return this.config;
  };

  /**
   * Gets value of the given property on Luigi config object. Target can be a value or a synchronous function.
   * @param {string} property the object traversal path
   * @example
   * Luigi.getConfigValue('auth.use')
   * Luigi.getConfigValue('settings.sideNavFooterText')
   */
  getConfigValue(property: string) {
    return GenericHelpers.getConfigValueFromObject(this.getConfig(), property);
  };

  navigation = (): Navigation => {
    return new Navigation(this);
  };

  ux = (): any => {
    return new UX(this);
  };

  routing = (): any => {
    return new Routing(this);
  };
  // ...
}
