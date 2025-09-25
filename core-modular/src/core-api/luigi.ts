import { writable, type Subscriber, type Updater } from 'svelte/store';
import type { LuigiEngine } from '../luigi-engine';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { Navigation } from './navigation';
import { Routing } from './routing';
import { UX } from './ux';
import { Theming } from './theming';

export class Luigi {
  config: any;
  _store: any;
  _theming?: Theming;
  _routing?: Routing;
  __cssVars?: any;

  constructor(private engine: LuigiEngine) {
    this._store = this.createConfigStore();
  }

  getEngine(): LuigiEngine {
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

  getConfigValueAsync = (property: string) => {
    return new Promise((resolve) => {
      const value = this.getConfigValue(property);
      if (typeof value === 'function') {
        resolve(value());
      } else {
        resolve(value);
      }
    });
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
        let subscribers = scopeSubscribers[scope];

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
}
