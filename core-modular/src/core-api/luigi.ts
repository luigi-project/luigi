import { writable, type Subscriber, type Updater } from 'svelte/store';
import type { LuigiEngine } from '../luigi-engine';
import { i18nService } from '../services/i18n.service';
import { serviceRegistry } from '../services/service-registry';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { StateHelpers } from '../utilities/helpers/state-helpers';
import { Navigation } from './navigation';
import { Routing } from './routing';
import { UX } from './ux';

export class Luigi {
  config: any;
  _store: any;
  configReadyCallback = function() {};

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
    this.setConfigCallback(this.getConfigReadyCallback());
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
   */
  configChanged(...scope: string[]) {
    const optimizedScope = StateHelpers.optimizeScope(scope);

    if (optimizedScope.length > 0) {
      optimizedScope.forEach((scope: string) => {
        (window as any).Luigi._store.fire(scope, { current: (window as any).Luigi._store });
      });
    } else {
      (window as any).Luigi._store.update((config: any) => config);
    }
  }

  i18n = (): i18nService => {
    return new i18nService(this);
  };

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

  private getConfigReadyCallback(): Promise<void> {
    const LuigiI18N = serviceRegistry.get(i18nService);

    return new Promise((resolve) => {
      LuigiI18N._init();
      resolve();
    });
  }

  private setConfigCallback(configReadyCallback: any): void {
    this.configReadyCallback = configReadyCallback;
  }
}
