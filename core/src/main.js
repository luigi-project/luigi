import App from './App.svelte';
import { LuigiConfig, LuigiI18N, LuigiElements } from './core-api';
import { writable, readable } from 'svelte/store';
import { AuthLayerSvc } from './services';
/* istanbul ignore file */

const createConfigStore = () => {
  const { subscribe, update, reset } = writable({});
  const scopeSubscribers = {};
  let unSubscriptions = [];
  return {
    subscribe: (fn) => {
      //subscribe fn returns unsubscription fn
      const unSubscription = subscribe(fn);
      unSubscriptions.push(unSubscription);
      return unSubscription;
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
      return () => {
        subscribers.delete(fn);
      };
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
};

export const store = createConfigStore();
export const getTranslation = readable((key, interpolations, locale) => {
  return LuigiI18N.getTranslation(key, interpolations, locale);
});

Luigi._store = store;

const configReadyCallback = () => {
  return new Promise((resolve) => {
    LuigiI18N._init();

    AuthLayerSvc.init().then(() => {
      // setTimeout needed so that luigi container is rendered when we retrieve it
      setTimeout(() => {
        let app;

        if (LuigiElements.isCustomLuigiContainer()) {
          document.getElementsByTagName('html')[0].classList.add('luigi-app-in-custom-container');
        }

        app = new App({
          target: LuigiElements.getLuigiContainer(),
          props: {
            store,
            getTranslation
          }
        });

        Luigi.showAlert = (settings) => {
          return app.showAlert(settings);
        };

        Luigi.showConfirmationModal = (settings) => {
          return app.showModal(settings);
        };

        Luigi.closeSearchField = () => {
          return app.closeSearchField();
        };
        Luigi.openSearchField = () => {
          return app.openSearchField();
        };

        Luigi.getGlobalSearchString = () => {
          return app.getGlobalSearchString();
        };

        Luigi.setGlobalSearchString = (searchString) => {
          app.setGlobalSearchString(searchString);
        };

        Luigi.showSearchResult = (arr) => {
          return app.showSearchResult(arr);
        };

        Luigi.closeSearchResult = () => {
          app.closeSearchResult();
        };

        Luigi.clearSearchField = () => {
          app.clearSearchField();
        };

        Luigi.splitView = {
          splitViewHandle: {
            close: () => app.closeSplitView(),
            collapse: () => app.collapseSplitView(),
            expand: () => app.expandSplitView(),
            isCollapsed: () => app.isSplitViewCollapsed(),
            isExpanded: () => app.isSplitViewExpanded(),
            exists: () => app.existsSplitView()
          }
        };

        Luigi.pathExists = (path) => {
          return app.pathExists(path);
        };

        Luigi.hasBack = () => {
          return app.hasBack();
        };

        Luigi.openUserSettings = () => {
          app.openUserSettings();
        };

        Luigi.closeUserSettings = () => {
          app.closeUserSettings();
        };

        Luigi.getDirtyStatus = () => {
          return app.getDirtyStatus();
        };

        //adding App.svelte to a internal Luigi variable
        Luigi._app = app.$$;
        resolve();
      });
    });
  });
};

LuigiConfig.setConfigCallbacks(configReadyCallback);
