import { writable } from 'svelte/store';
import type { LuigiEngine } from '../luigi-engine';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { Navigation } from './navigation';
import { Routing } from './routing';
import { UX } from './ux';

export class Luigi {
  config: any;
  _store: any;

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

  navigation = (): Navigation => {
    return new Navigation(this);
  };

  ux = (): UX => {
    return new UX(this);
  };

  routing = (): Routing => {
    return new Routing(this);
  };
  // ...

  private createConfigStore(): any {
    const { subscribe, update, reset } = writable({});
    const scopeSubscribers = {};
    let unSubscriptions = [];

    return {
      subscribe: (fn) => {
        // subscribe fn returns unsubscription fn
        unSubscriptions.push(subscribe(fn));
      },
      update,
      reset,
      subscribeToScope: (fn, scope) => {
        let subscribers = scopeSubscribers[scope];

        if (!subscribers) {
          subscribers = new Set();
          scopeSubscribers[scope] = subscribers;
        }

        subscribers.add(fn);
      },
      fire: (scope, data) => {
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
