import {
  DefaultCompoundRenderer,
  deSanitizeParamsMap,
  registerEventListeners,
  resolveRenderer
} from '../utilities/helpers/web-component-helpers';
import { LuigiConfig } from '../core-api';
import { RoutingHelpers, GenericHelpers, NavigationHelpers } from '../utilities/helpers';

const DEFAULT_TEMPORARY_HEIGHT = '500px';
const DEFAULT_INTERSECTION_OBSERVER_ROOTMARGIN = '0px';

/** Methods for dealing with web components based micro frontend handling */
class WebComponentSvcClass {
  /**
   *  @typedef {object} WcContainerData
   *  @property {string} viewUrl
   *  @property {HTMLElement} wc_container
   *  @property {object} extendedContext
   *  @property {object} node
   *  @property {string} nodeId
   *  @property {boolean} isSpecialMf indicates whether the web component is rendered in a modal, splitView or drawer (`false` by default)
   *  @property {boolean} noTemporaryContainerHeight
   */

  /** @type {WeakMap<HTMLElement, WcContainerData>} */
  wcContainerData = new WeakMap();

  dynamicImport(viewUrl) {
    /** __luigi_dyn_import_____________() is replaced by import(\/* webpackIgnore: true *\/) after webpack is done,
     *    because webpack can't let his hands off imports ;)
     * trailing underscores are there to match the replacement char nr to avoid sourcemap mess*/
    return __luigi_dyn_import_____________(viewUrl);
  }

  /** Creates a web component with tagname wc_id and adds it to wcItemContainer,
   * if attached to wc_container
   */
  attachWC(wc_id, wcItemPlaceholder, wc_container, extendedContext, viewUrl, nodeId, isSpecialMf, isLazyLoading) {
    if (wc_container && wc_container.contains(wcItemPlaceholder)) {
      const wc = document.createElement(wc_id);

      if (nodeId) {
        wc.setAttribute('nodeId', nodeId);
      }
      wc.setAttribute('lui_web_component', true);
      this.initWC(wc, wc_id, wc_container, viewUrl, extendedContext, nodeId, isSpecialMf);

      wc_container.replaceChild(wc, wcItemPlaceholder);

      if (isLazyLoading) {
        this.removeTemporaryHeightFromCompoundItemContainer(wc_container);
        this.wcContainerData.delete(wc_container);
      }
    }
  }

  initWC(wc, wc_id, eventBusElement, viewUrl, extendedContext, nodeId, isSpecialMf) {
    const ctx = extendedContext.context;
    wc.extendedContext = extendedContext;

    // handle difference modal vs main mf
    if (wc.extendedContext.currentNode) {
      wc.extendedContext.clientPermissions = wc.extendedContext.currentNode.clientPermissions;
    }

    const clientAPI = {
      linkManager: () => {
        const lm = window.Luigi.navigation();
        return new Proxy(lm, {
          get(target, prop) {
            if (prop === target.getCurrentRoute.name) {
              return () => {
                const pm = new Promise((resolve) => {
                  resolve(target.getCurrentRoute());
                });
                pm.toString = () => {
                  return target.getCurrentRoute();
                };
                return pm;
              };
            }
            return target[prop];
          }
        });
      },
      uxManager: () => {
        const ux = window.Luigi.ux();

        return new Proxy(ux, {
          get(target, prop) {
            if (prop === target.showLoadingIndicator.name) {
              return () => {
                const wcNested = !!wc?.parentNode?.classList?.contains('iframeModalCtn');
                const pm = new Promise((resolve) => {
                  resolve(window.postMessage({ msg: 'luigi.show-loading-indicator', wcNested }));
                });

                return pm;
              };
            }

            if (prop === target.hideLoadingIndicator.name) {
              return () => {
                const wcNested = !!wc?.parentNode?.classList?.contains('iframeModalCtn');
                const pm = new Promise((resolve) => {
                  resolve(window.postMessage({ msg: 'luigi.hide-loading-indicator', wcNested }));
                });

                return pm;
              };
            }

            return target[prop];
          }
        });
      },
      getCurrentLocale: () => window.Luigi.i18n().getCurrentLocale(),
      publishEvent: (ev) => {
        if (eventBusElement.eventBus) {
          eventBusElement.eventBus.onPublishEvent(ev, nodeId, wc_id);
        }
      },
      getActiveFeatureToggleList: () => window.Luigi.featureToggles().getActiveFeatureToggleList(),
      getActiveFeatureToggles: () => window.Luigi.featureToggles().getActiveFeatureToggleList(),
      getPathParams: () => (wc.extendedContext?.pathParams ? wc.extendedContext.pathParams : {}),
      getCoreSearchParams: () => {
        const node = {
          clientPermissions: wc.extendedContext.clientPermissions
        };
        return RoutingHelpers.prepareSearchParamsForClient(node);
      },
      getClientPermissions: () => (wc.extendedContext?.clientPermissions ? wc.extendedContext.clientPermissions : {}),
      addNodeParams: (params, keepBrowserHistory) => {
        if (!isSpecialMf) {
          window.Luigi.routing().addNodeParams(params, keepBrowserHistory);
        }
      },
      getNodeParams: (shouldDesanitise) => {
        if (isSpecialMf) {
          return {};
        }
        const result = wc.extendedContext?.nodeParams ? wc.extendedContext.nodeParams : {};
        if (shouldDesanitise) {
          return deSanitizeParamsMap(result);
        }
        return wc.extendedContext.nodeParams;
      },
      setAnchor: (anchor) => {
        if (!isSpecialMf) {
          window.Luigi.routing().setAnchor(anchor);
        }
      },
      getAnchor: () => {
        return window.Luigi.routing().getAnchor();
      },
      getUserSettings: async () => {
        return await this.getUserSettingsForWc(eventBusElement._luigi_node);
      },
      setViewGroupData: (data) => {
        const vg = NavigationHelpers.findViewGroup(eventBusElement._luigi_node);
        if (vg) {
          const vgSettings = NavigationHelpers.getViewGroupSettings(vg);
          vgSettings._liveCustomData = data;
          LuigiConfig.configChanged('navigation.viewgroupdata');
        }
      }
    };

    if (wc.__postProcess) {
      const url =
        new URL(document.baseURI).origin === new URL(viewUrl, document.baseURI).origin
          ? new URL(viewUrl, document.baseURI)
          : new URL('./', viewUrl);
      wc.__postProcess(ctx, clientAPI, url.origin + url.pathname);
    } else {
      wc.context = ctx;
      wc.nodeParams = extendedContext.nodeParams;
      wc.LuigiClient = clientAPI;
    }

    const wcCreationInterceptor = LuigiConfig.getConfigValue('settings.webcomponentCreationInterceptor');
    if (GenericHelpers.isFunction(wcCreationInterceptor)) {
      wcCreationInterceptor(wc, extendedContext.currentNode, extendedContext, nodeId, isSpecialMf);
    }
  }

  /** Generates a unique web component id (tagname) based on the viewUrl
   * returns a string that can be used as part of a tagname, only alphanumeric
   * characters and no whitespaces.
   */
  generateWCId(viewUrl) {
    let charRep = '';
    let normalizedViewUrl = new URL(viewUrl, encodeURI(location.href)).href;
    for (let i = 0; i < normalizedViewUrl.length; i++) {
      charRep += normalizedViewUrl.charCodeAt(i).toString(16);
    }
    return 'luigi-wc-' + charRep;
  }

  /** Does a module import from viewUrl and defines a new web component
   * with the default export of the module or the first export extending HTMLElement if no default is
   * specified.
   * @returns a promise that gets resolved after successfull import */
  registerWCFromUrl(viewUrl, wc_id) {
    const i18nViewUrl = RoutingHelpers.getI18nViewUrl(viewUrl);
    return new Promise((resolve, reject) => {
      if (this.checkWCUrl(i18nViewUrl)) {
        this.dynamicImport(i18nViewUrl)
          .then((module) => {
            try {
              if (!window.customElements.get(wc_id)) {
                let cmpClazz = module.default;
                if (!HTMLElement.isPrototypeOf(cmpClazz)) {
                  let props = Object.keys(module);
                  for (let i = 0; i < props.length; i++) {
                    cmpClazz = module[props[i]];
                    if (HTMLElement.isPrototypeOf(cmpClazz)) {
                      break;
                    }
                  }
                }
                window.customElements.define(wc_id, cmpClazz);
              }
              resolve();
            } catch (e) {
              reject(e);
            }
          })
          .catch((err) => reject(err));
      } else {
        console.warn(`View URL '${i18nViewUrl}' not allowed to be included`);
        reject(`View URL '${i18nViewUrl}' not allowed`);
      }
    });
  }

  /**
   * Handles the import of self registered web component bundles, i.e. the web component
   * is added to the customElements registry by the bundle code rather than by luigi.
   *
   * @param {*} node the corresponding navigation node
   * @param {*} viewUrl the source of the wc bundle
   * @param {*} onload callback function executed after script attached and loaded
   */
  includeSelfRegisteredWCFromUrl(node, viewUrl, onload) {
    if (this.checkWCUrl(viewUrl)) {
      /** Append reg function to luigi object if not present */
      if (!window.Luigi._registerWebcomponent) {
        window.Luigi._registerWebcomponent = (srcString, el) => {
          const wcId = this.generateWCId(srcString);
          if (!window.customElements.get(wcId)) {
            window.customElements.define(wcId, el);
          }
        };
      }

      let scriptTag = document.createElement('script');
      scriptTag.setAttribute('src', viewUrl);
      if (node.webcomponent.type === 'module') {
        scriptTag.setAttribute('type', 'module');
      }
      scriptTag.setAttribute('defer', true);
      scriptTag.addEventListener('load', () => {
        onload();
      });
      document.body.appendChild(scriptTag);
    } else {
      console.warn(`View URL '${viewUrl}' not allowed to be included`);
    }
  }

  /**
   * Checks if a url is allowed to be included, based on 'navigation.validWebcomponentUrls' in luigi config.
   * Returns true, if allowed.
   *
   * @param {*} url the url string to check
   */
  checkWCUrl(url) {
    if (url.indexOf('://') > 0 || url.trim().indexOf('//') === 0) {
      const ur = new URL(url);
      if (ur.host === window.location.host) {
        return true; // same host is okay
      }

      const valids = LuigiConfig.getConfigValue('navigation.validWebcomponentUrls');
      if (valids && valids.length > 0) {
        for (let el of valids) {
          try {
            if (new RegExp(el).test(url)) {
              return true;
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      return false;
    }
    // relative URL is okay
    return true;
  }

  /** Adds a web component defined by viewUrl to the wc_container and sets the node context.
   * If the web component is not defined yet, it gets imported.
   */
  renderWebComponent(viewUrl, wc_container, extendedContext, node, nodeId, isSpecialMf, isLazyLoading) {
    const context = extendedContext.context;
    const i18nViewUrl = RoutingHelpers.substituteViewUrl(viewUrl, { context });
    const wc_id = node?.webcomponent?.tagName || this.generateWCId(i18nViewUrl);
    const wcItemPlaceholder = document.createElement('div');

    wc_container.appendChild(wcItemPlaceholder);
    wc_container._luigi_node = node;

    if (window.customElements.get(wc_id)) {
      this.attachWC(
        wc_id,
        wcItemPlaceholder,
        wc_container,
        extendedContext,
        i18nViewUrl,
        nodeId,
        isSpecialMf,
        isLazyLoading
      );
    } else {
      /** Custom import function, if defined */
      if (window.luigiWCFn) {
        window.luigiWCFn(i18nViewUrl, wc_id, wcItemPlaceholder, () => {
          this.attachWC(
            wc_id,
            wcItemPlaceholder,
            wc_container,
            extendedContext,
            i18nViewUrl,
            nodeId,
            isSpecialMf,
            isLazyLoading
          );
        });
      } else if (node.webcomponent && node.webcomponent.selfRegistered) {
        this.includeSelfRegisteredWCFromUrl(node, i18nViewUrl, () => {
          this.attachWC(
            wc_id,
            wcItemPlaceholder,
            wc_container,
            extendedContext,
            i18nViewUrl,
            nodeId,
            isSpecialMf,
            isLazyLoading
          );
        });
      } else {
        this.registerWCFromUrl(i18nViewUrl, wc_id).then(() => {
          this.attachWC(
            wc_id,
            wcItemPlaceholder,
            wc_container,
            extendedContext,
            i18nViewUrl,
            nodeId,
            isSpecialMf,
            isLazyLoading
          );
        });
      }
    }
  }

  /**
   * Creates a compound container according to the given renderer.
   * Returns a promise that gets resolved with the created container DOM element.
   *
   * @param {DefaultCompoundRenderer} renderer
   */
  createCompoundContainerAsync(renderer, ctx, navNode) {
    return new Promise((resolve, reject) => {
      if (renderer.viewUrl) {
        try {
          const wc_id = navNode?.webcomponent?.tagName || this.generateWCId(renderer.viewUrl);
          if (navNode?.webcomponent?.selfRegistered) {
            this.includeSelfRegisteredWCFromUrl(navNode, renderer.viewUrl, () => {
              const wc = document.createElement(wc_id);
              wc.setAttribute('lui_web_component', true);
              this.initWC(wc, wc_id, wc, renderer.viewUrl, ctx, '_root');
              resolve(wc);
            });
          } else {
            this.registerWCFromUrl(renderer.viewUrl, wc_id).then(() => {
              const wc = document.createElement(wc_id);
              wc.setAttribute('lui_web_component', true);
              this.initWC(wc, wc_id, wc, renderer.viewUrl, ctx, '_root');
              resolve(wc);
            });
          }
        } catch (e) {
          reject(e);
        }
      } else {
        resolve(renderer.createCompoundContainer());
      }
    });
  }

  /**
   * @param {IntersectionObserverEntry[]} entries
   * @param {IntersectionObserver} observer
   */
  intersectionObserverCallback(entries, observer) {
    const intersectingEntries = entries.filter((entry) => entry.isIntersecting);

    intersectingEntries.forEach((intersectingEntry) => {
      const compoundItemContainer = intersectingEntry.target;
      const wcContainerData = this.wcContainerData.get(compoundItemContainer);

      if (!!wcContainerData) {
        this.renderWebComponent(
          wcContainerData.viewUrl,
          wcContainerData.wc_container,
          wcContainerData.extendedContext,
          wcContainerData.node,
          wcContainerData.nodeId,
          wcContainerData.isSpecialMf,
          true
        );
      } else {
        console.error('Could not find WC container data', {
          for: compoundItemContainer
        });
      }
      observer.unobserve(compoundItemContainer);
    });
  }

  /**
   * When lazy loading is active, this function sets a temporary height to the given compound item container.
   * The temporary height is added because otherwise, when adding the empty containers for all compound items,
   * all containers would have a height of 0 because the web components they contain will be added
   * asynchronously later. All containers would be visible so that all web components would be added right away.
   * In other words, this would break lazy loading.
   * @param {HTMLElement} compoundItemContainer
   * @param {object} compoundSettings
   * @param {object} [compoundSettings.lazyLoadingOptions]
   * @param {string} [compoundSettings.lazyLoadingOptions.temporaryContainerHeight]
   * @param {boolean} [compoundSettings.lazyLoadingOptions.noTemporaryContainerHeight]
   * @param {object} compoundItemSettings
   * @param {object} compoundItemSettings.layoutConfig
   * @param {string} [compoundItemSettings.layoutConfig.temporaryContainerHeight]
   */
  setTemporaryHeightForCompoundItemContainer(compoundItemContainer, compoundSettings, compoundItemSettings) {
    if (compoundSettings.lazyLoadingOptions?.noTemporaryContainerHeight === true) {
      return;
    }

    const temporaryContainerHeight =
      compoundItemSettings.layoutConfig?.temporaryContainerHeight ||
      compoundSettings.lazyLoadingOptions?.temporaryContainerHeight ||
      DEFAULT_TEMPORARY_HEIGHT;

    compoundItemContainer.style.height = temporaryContainerHeight;
  }

  /**
   * When lazy loading is active, this function removes the temporary height from the given compound item
   * container after the web component is instantiated and attached to the container.
   * @param {HTMLElement} compoundItemContainer
   */
  removeTemporaryHeightFromCompoundItemContainer(compoundItemContainer) {
    const wcContainerData = this.wcContainerData.get(compoundItemContainer);

    if (wcContainerData?.noTemporaryContainerHeight !== true) {
      compoundItemContainer.style.removeProperty('height');
    }
  }

  /**
   * @param {object} navNode
   */
  getCompoundRenderer(navNode, context) {
    const isNestedWebComponent = navNode.webcomponent && !!navNode.viewUrl;
    let renderer;

    if (isNestedWebComponent) {
      // Nested web component
      renderer = new DefaultCompoundRenderer();
      renderer.viewUrl = RoutingHelpers.substituteViewUrl(navNode.viewUrl, {
        context
      });
      renderer.createCompoundItemContainer = (layoutConfig) => {
        var cnt = document.createElement('div');
        if (layoutConfig && layoutConfig.slot) {
          cnt.setAttribute('slot', layoutConfig.slot);
        }
        return cnt;
      };
    } else if (navNode.compound.renderer) {
      renderer = resolveRenderer(navNode.compound.renderer);
    } else {
      renderer = new DefaultCompoundRenderer();
    }

    return renderer;
  }

  createIntersectionObserver(navNode) {
    return new IntersectionObserver(
      (entries, observer) => {
        this.intersectionObserverCallback(entries, observer);
      },
      {
        rootMargin:
          navNode.compound.lazyLoadingOptions?.intersectionRootMargin || DEFAULT_INTERSECTION_OBSERVER_ROOTMARGIN
      }
    );
  }

  /**
   * Responsible for rendering web component compounds based on a renderer or a nesting
   * micro frontend.
   *
   * @param {*} navNode the navigation node defining the compound
   * @param {*} wc_container the web component container dom element
   * @param {*} context the luigi node context
   */
  renderWebComponentCompound(navNode, wc_container, extendedContext) {
    const useLazyLoading = navNode.compound?.lazyLoadingOptions?.enabled === true;
    const context = extendedContext.context;
    const renderer = this.getCompoundRenderer(navNode, context);
    /** @type {IntersectionObserver} */
    let intersectionObserver;

    if (useLazyLoading) {
      intersectionObserver = this.createIntersectionObserver(navNode);
    }

    wc_container._luigi_node = navNode;

    return new Promise((resolve) => {
      this.createCompoundContainerAsync(renderer, extendedContext, navNode).then((compoundContainer) => {
        const ebListeners = {};

        compoundContainer.eventBus = {
          listeners: ebListeners,
          onPublishEvent: (event, srcNodeId, wcId) => {
            const listeners = ebListeners[srcNodeId + '.' + event.type] || [];

            listeners.push(...(ebListeners['*.' + event.type] || []));
            listeners.forEach((listenerInfo) => {
              const target =
                listenerInfo.wcElement || compoundContainer.querySelector('[nodeId=' + listenerInfo.wcElementId + ']');
              if (target) {
                target.dispatchEvent(
                  new CustomEvent(listenerInfo.action, {
                    detail: listenerInfo.converter ? listenerInfo.converter(event.detail) : event.detail
                  })
                );
              } else {
                console.debug('Could not find event target', listenerInfo);
              }
            });
          }
        };

        navNode.compound.children.forEach((compoundItemSettings, index) => {
          const ctx = { ...context, ...compoundItemSettings.context };
          const compoundItemContainer = renderer.createCompoundItemContainer(compoundItemSettings.layoutConfig);
          const nodeId = compoundItemSettings.id || 'gen_' + index;

          compoundItemContainer.eventBus = compoundContainer.eventBus;

          if (useLazyLoading) {
            this.setTemporaryHeightForCompoundItemContainer(
              compoundItemContainer,
              navNode.compound,
              compoundItemSettings
            );
            renderer.attachCompoundItem(compoundContainer, compoundItemContainer);
            this.wcContainerData.set(compoundItemContainer, {
              viewUrl: compoundItemSettings.viewUrl,
              wc_container: compoundItemContainer,
              extendedContext: { context: ctx },
              node: compoundItemSettings,
              nodeId: nodeId,
              isSpecialMf: true,
              noTemporaryContainerHeight: navNode.compound.lazyLoadingOptions?.noTemporaryContainerHeight
            });
            intersectionObserver.observe(compoundItemContainer);
          } else {
            renderer.attachCompoundItem(compoundContainer, compoundItemContainer);
            this.renderWebComponent(
              compoundItemSettings.viewUrl,
              compoundItemContainer,
              { context: ctx },
              compoundItemSettings,
              nodeId,
              true,
              false
            );
          }

          registerEventListeners(ebListeners, compoundItemSettings, nodeId);
        });

        wc_container.appendChild(compoundContainer);

        // listener for nesting wc
        registerEventListeners(ebListeners, navNode.compound, '_root', compoundContainer);
        resolve(compoundContainer);
      });
    });
  }

  /**
   * Gets the stored user settings for a specific user settings group

   * @param {Object} wc node object definition
   * @returns a promise that gets resolved with the stored user settings for a specific user settings group.
   */
  getUserSettingsForWc(wc) {
    return new Promise((resolve, reject) => {
      if (wc.userSettingsGroup) {
        const userSettingsGroupName = wc.userSettingsGroup;
        LuigiConfig.readUserSettings().then((storedUserSettingsData) => {
          const hasUserSettings =
            userSettingsGroupName && typeof storedUserSettingsData === 'object' && storedUserSettingsData !== null;

          const userSettings = hasUserSettings ? storedUserSettingsData[userSettingsGroupName] : null;
          resolve(userSettings);
        });
      } else {
        reject(null);
      }
    });
  }
}

export const WebComponentService = new WebComponentSvcClass();
