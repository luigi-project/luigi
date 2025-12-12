/* eslint no-prototype-builtins: 0 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DefaultCompoundRenderer,
  resolveRenderer,
  registerEventListeners,
  deSanitizeParamsMap
} from './web-component-helpers';
import { ContainerService } from './container.service';
import { Events } from '../constants/communication';
import type {
  ContainerElement,
  LayoutConfig,
  WebComponentNode,
  WebComponentRenderer
} from '../constants/container.model';

/** Methods for dealing with web components based micro frontend handling */
export class WebComponentService {
  containerService: ContainerService;
  thisComponent!: ContainerElement;
  modalResolver!: { resolve: (value?: void | PromiseLike<void>) => void; reject: (reason?: Error) => void } | undefined;
  alertResolvers: Record<string, ((value: unknown) => void) | undefined> = {};
  alertIndex = 0;

  constructor() {
    this.containerService = new ContainerService();
  }

  dynamicImport(viewUrl: string): Readonly<Promise<any>> {
    // Object.freeze() used as potential marker for bundlers other than webpack
    return Object.freeze(import(/* webpackIgnore: true */ viewUrl));
  }

  processViewUrl(viewUrl: string, data?: object): string {
    return viewUrl;
  }

  /**
   * Attaches a web component with tagname wc_id and adds it to wcItemContainer,
   * if attached to wc_container
   *
   * @param wc_id a tagname that is used when creating the web component element
   * @param wcItemPlaceholder placeholder for web component container
   * @param wc_container web component container element
   * @param ctx context to be passed to the web component
   * @param viewUrl url to render content from
   * @param nodeId refers to an attribute of the web component to be identified from the rest
   * @param isCompoundChild defines if rendered mf is a compound child or not
   */
  attachWC(
    wc_id: string,
    wcItemPlaceholder: HTMLDivElement,
    wc_container: ContainerElement,
    ctx: object,
    viewUrl: string,
    nodeId: string,
    isCompoundChild?: boolean
  ): void {
    if (wc_container && wc_container.contains(wcItemPlaceholder)) {
      const wc = document.createElement(wc_id);

      if (nodeId) {
        wc.setAttribute('nodeId', nodeId);
      }

      wc.setAttribute('lui_web_component', 'true');

      this.initWC(wc, wc_id, wc_container, viewUrl, ctx, nodeId, isCompoundChild);
      wc_container.replaceChild(wc, wcItemPlaceholder);

      if (wc_container._luigi_node) {
        wc_container._luigi_mfe_webcomponent = wc;
      }

      wc_container.dispatchEvent(new Event('wc_ready'));
    }
  }

  /**
   * Function that uses the current instance of the containerService to dispatch a Luigi event to the current instance of the container
   * that is 'thisComponent'
   * @param msg the message to be delivered
   * @param data the data to be sent
   * @param callback the callback function to be called
   */
  dispatchLuigiEvent(msg: string, data: object | string, callback?: (arg?: any) => void): void {
    this.containerService.dispatch(msg, this.thisComponent, data, callback);
  }

  /**
   * This function is used to create the Luigi Client API for the web-component-based micro frontend.
   * As the function expands with more functionality, it might be moved to a separate class.
   *
   * The client API here should be a reflection of the Core WC Client api from core/src/services/web-components.js
   *
   * @param eventBusElement the event bus to be used for cross web component communication, i.e.: for compound micro frontends container scenario
   * @param nodeId refers to an attribute of the web component to be identified from the rest
   * @param wc_id a tagname that is used when creating the web component element
   * @param component
   * @param isCompoundChild defines if rendered mf is a compound child or not
   * @returns an object with the Luigi Client API
   */
  createClientAPI(
    eventBusElement: ContainerElement,
    nodeId: string,
    wc_id: string,
    component: HTMLElement,
    isCompoundChild?: boolean
  ) {
    return {
      linkManager: () => {
        let fromContext: string | null = null;
        let fromClosestContext = false;
        let fromVirtualTreeRoot = false;
        let fromParent = false;
        let nodeParams = {};

        const linkManagerInstance = {
          navigate: (route: string, settings = {}) => {
            const options = {
              fromContext,
              fromClosestContext,
              fromVirtualTreeRoot,
              fromParent,
              nodeParams,
              ...settings
            };
            this.dispatchLuigiEvent(Events.NAVIGATION_REQUEST, {
              link: route,
              ...options
            });
          },
          navigateToIntent: (semanticSlug: string, params = {}): void => {
            let newPath = '#?intent=';

            newPath += semanticSlug;

            if (params && Object.keys(params)?.length) {
              const paramList = Object.entries(params);

              // append parameters to the path if any
              if (paramList.length > 0) {
                newPath += '?';

                for (const [key, value] of paramList) {
                  newPath += key + '=' + value + '&';
                }

                // trim potential excessive ampersand & at the end
                newPath = newPath.slice(0, -1);
              }
            }

            linkManagerInstance.navigate(newPath);
          },
          fromClosestContext: () => {
            fromClosestContext = true;
            return linkManagerInstance;
          },
          fromContext: (navigationContext: string) => {
            fromContext = navigationContext;
            return linkManagerInstance;
          },
          fromVirtualTreeRoot: () => {
            fromVirtualTreeRoot = true;
            return linkManagerInstance;
          },
          fromParent: () => {
            fromParent = true;
            return linkManagerInstance;
          },
          getCurrentRoute: () => {
            const options = {
              fromContext,
              fromClosestContext,
              fromVirtualTreeRoot,
              fromParent,
              nodeParams
            };
            return new Promise((resolve, reject) => {
              this.containerService.dispatch(
                Events.GET_CURRENT_ROUTE_REQUEST,
                this.thisComponent,
                { ...options },
                (route) => {
                  if (route) {
                    resolve(route);
                  } else {
                    reject('No current route received.');
                  }
                }
              );
            });
          },
          withParams: (params: object) => {
            nodeParams = params;
            return linkManagerInstance;
          },
          updateModalPathInternalNavigation: (path: string, modalSettings = {}, addHistoryEntry = false): void => {
            if (!path) {
              console.warn('Updating path of the modal upon internal navigation prevented. No path specified.');
              return;
            }

            const options = {
              fromClosestContext,
              fromContext,
              fromParent,
              fromVirtualTreeRoot,
              nodeParams
            };

            this.dispatchLuigiEvent(
              Events.UPDATE_MODAL_PATH_DATA_REQUEST,
              Object.assign(options, {
                history: addHistoryEntry,
                link: path,
                modal: modalSettings
              })
            );
          },
          updateTopNavigation: (): void => {
            this.dispatchLuigiEvent(Events.UPDATE_TOP_NAVIGATION_REQUEST, {});
          },
          pathExists: (link: string) => {
            const options = {
              fromContext,
              fromClosestContext,
              fromVirtualTreeRoot,
              fromParent,
              nodeParams
            };
            return new Promise((resolve, reject) => {
              this.containerService.dispatch(
                Events.CHECK_PATH_EXISTS_REQUEST,
                this.thisComponent,
                { ...options, link },
                (exists) => {
                  if (exists) {
                    resolve(true);
                  } else {
                    reject(false);
                  }
                }
              );
              // For BW compatibility
              this.containerService.dispatch(
                Events.PATH_EXISTS_REQUEST,
                this.thisComponent,
                { ...options, link },
                (exists) => {
                  if (exists) {
                    resolve(true);
                  } else {
                    reject(false);
                  }
                }
              );
            });
          },
          openAsDrawer: (route: string, drawerSettings = {}) => {
            linkManagerInstance.navigate(route, { drawer: drawerSettings });
          },
          openAsModal: (route: string, modalSettings = {}) => {
            linkManagerInstance.navigate(route, { modal: modalSettings });
          },
          openAsSplitView: (route: string, splitViewSettings = {}) => {
            linkManagerInstance.navigate(route, {
              splitView: splitViewSettings
            });
          },
          goBack: (goBackContext: object) => {
            this.dispatchLuigiEvent(Events.GO_BACK_REQUEST, goBackContext);
          },
          hasBack: () => {
            return false;
          },
          updateModalSettings: (modalSettings = {}, addHistoryEntry = false) => {
            this.dispatchLuigiEvent(Events.UPDATE_MODAL_SETTINGS_REQUEST, {
              updatedModalSettings: modalSettings,
              addHistoryEntry
            });
          }
        };

        return linkManagerInstance;
      },
      uxManager: () => {
        return {
          showAlert: (alertSettings: Record<string, any>) => {
            alertSettings.id = this.alertIndex++;

            return new Promise((resolve) => {
              this.alertResolvers[alertSettings.id] = resolve;
              this.dispatchLuigiEvent(Events.ALERT_REQUEST, alertSettings, (dismissKey?: boolean | string) => {
                this.resolveAlert(alertSettings.id, dismissKey);
              });
            });
          },
          showConfirmationModal: (settings: object) => {
            return new Promise<void>((resolve, reject) => {
              this.modalResolver = { resolve, reject };
              this.containerService.dispatch(
                Events.SHOW_CONFIRMATION_MODAL_REQUEST,
                this.thisComponent,
                settings,
                (confirmed) => {
                  if (confirmed) {
                    resolve();
                  } else {
                    reject();
                  }
                }
              );
            });
          },
          getCurrentTheme: (): string | undefined => {
            return this.thisComponent.theme;
          },
          closeUserSettings: () => {
            this.dispatchLuigiEvent(Events.CLOSE_USER_SETTINGS_REQUEST, this.thisComponent.userSettings);
          },
          openUserSettings: () => {
            this.dispatchLuigiEvent(Events.OPEN_USER_SETTINGS_REQUEST, this.thisComponent.userSettings);
          },
          collapseLeftSideNav: () => {
            this.dispatchLuigiEvent(Events.COLLAPSE_LEFT_NAV_REQUEST, {});
          },
          getDirtyStatus: () => {
            return this.thisComponent.dirtyStatus || false;
          },
          getDocumentTitle: () => {
            return this.thisComponent.documentTitle;
          },
          setDocumentTitle: (title: string) => {
            this.dispatchLuigiEvent(Events.SET_DOCUMENT_TITLE_REQUEST, title);
          },
          setDirtyStatus: (isDirty: boolean) => {
            this.dispatchLuigiEvent(Events.SET_DIRTY_STATUS_REQUEST, { dirty: isDirty });
          },
          setCurrentLocale: (locale: string) => {
            if (locale) {
              this.dispatchLuigiEvent(Events.SET_CURRENT_LOCALE_REQUEST, { currentLocale: locale });
            }
          },
          removeBackdrop: () => {
            this.dispatchLuigiEvent(Events.REMOVE_BACKDROP_REQUEST, {});
          },
          addBackdrop: () => {
            this.dispatchLuigiEvent(Events.ADD_BACKDROP_REQUEST, {});
          },
          showLoadingIndicator: () => {
            this.dispatchLuigiEvent(Events.SHOW_LOADING_INDICATOR_REQUEST, {});
          },
          hideLoadingIndicator: () => {
            this.dispatchLuigiEvent(Events.HIDE_LOADING_INDICATOR_REQUEST, {});
          },
          hideAppLoadingIndicator: () => {
            this.dispatchLuigiEvent(Events.HIDE_LOADING_INDICATOR_REQUEST, {});
          },
          closeCurrentModal: () => {
            this.dispatchLuigiEvent(Events.CLOSE_CURRENT_MODAL_REQUEST, {});
          }
        };
      },
      getCurrentLocale: (): string | undefined => {
        return this.thisComponent.locale;
      },
      getActiveFeatureToggles: (): string[] => {
        return this.thisComponent.activeFeatureToggleList || [];
      },
      publishEvent: (ev: any) => {
        if (eventBusElement && eventBusElement.eventBus) {
          // compound component use case only
          eventBusElement.eventBus.onPublishEvent(ev, nodeId, wc_id);
        }

        const payload = {
          id: ev.type,
          _metaData: {
            nodeId,
            wc_id,
            src: component
          },
          data: ev.detail
        };

        this.dispatchLuigiEvent(Events.CUSTOM_MESSAGE, payload);
      },
      luigiClientInit: () => {
        this.dispatchLuigiEvent(Events.INITIALIZED, {});
      },
      addNodeParams: (params: object, keepBrowserHistory: boolean) => {
        if (isCompoundChild) {
          return;
        }

        this.dispatchLuigiEvent(Events.ADD_NODE_PARAMS_REQUEST, {
          params,
          data: params,
          keepBrowserHistory
        });
      },
      getNodeParams: (shouldDesanitise: boolean): object => {
        if (isCompoundChild) {
          return {};
        }

        if (shouldDesanitise) {
          return deSanitizeParamsMap(this.thisComponent.nodeParams);
        }

        return this.thisComponent.nodeParams || {};
      },
      setAnchor: (anchor: string) => {
        if (isCompoundChild) {
          return;
        }

        this.dispatchLuigiEvent(Events.SET_ANCHOR_LINK_REQUEST, anchor);
      },
      getAnchor: (): string => {
        return this.thisComponent.anchor || '';
      },
      getCoreSearchParams: (): object => {
        return this.thisComponent.searchParams || {};
      },
      getPathParams: (): object => {
        return this.thisComponent.pathParams || {};
      },
      getClientPermissions: (): object => {
        return this.thisComponent.clientPermissions || {};
      },
      addCoreSearchParams: (searchParams = {}, keepBrowserHistory = true) => {
        this.dispatchLuigiEvent(Events.ADD_SEARCH_PARAMS_REQUEST, { data: searchParams, keepBrowserHistory });
      },
      getUserSettings: (): object => {
        return this.thisComponent.userSettings || {};
      },
      setViewGroupData: (data: object) => {
        this.dispatchLuigiEvent(Events.SET_VIEW_GROUP_DATA_REQUEST, data);
      }
    };
  }

  /**
   * Attaches Client Api to web component
   * if __postProcess defined allow for custom setting of clientApi when developers want to decide how to add it to their mf
   * otherwise just attach it to the wc webcomponent alongside the context directly.
   *
   * @param wc web component to attach to
   * @param wc_id a tagname that is used when creating the web component element
   * @param eventBusElement the event bus to be used for cross web component communication, i.e.: for compound micro frontends container scenario
   * @param viewUrl url to render content from
   * @param ctx context to be passed to the web component
   * @param nodeId refers to an attribute of the web component to be identified from the rest
   * @param isCompoundChild defines if rendered mf is a compound child or not
   */
  initWC(
    wc: HTMLElement | any,
    wc_id: string,
    eventBusElement: ContainerElement,
    viewUrl: string,
    ctx: object,
    nodeId: string,
    isCompoundChild?: boolean
  ): void {
    const clientAPI = this.createClientAPI(eventBusElement, nodeId, wc_id, wc, isCompoundChild);

    if (wc.__postProcess) {
      const url =
        new URL(document.baseURI).origin === new URL(viewUrl, document.baseURI).origin
          ? new URL('./', new URL(viewUrl, document.baseURI))
          : new URL('./', viewUrl);

      wc.__postProcess(ctx, clientAPI, url.origin + url.pathname);
    } else {
      wc.context = ctx;
      wc.LuigiClient = clientAPI;
    }
  }

  /**
   * Generates a unique web component id (tagname) based on the viewUrl
   * returns a string that can be used as part of a tagname, only alphanumeric
   * characters and no whitespaces.
   */
  generateWCId(viewUrl: string): string {
    let charRep = '';
    const normalizedViewUrl = new URL(viewUrl, encodeURI(location.href)).href;

    for (let i = 0; i < normalizedViewUrl.length; i++) {
      charRep += normalizedViewUrl.charCodeAt(i).toString(16);
    }

    return 'luigi-wc-' + charRep;
  }

  /**
   * Does a module import from viewUrl and defines a new web component
   * with the default export of the module or the first export extending HTMLElement if no default is
   * specified.
   * @param viewUrl url to render content from
   * @param wc_id a tagname that is used when creating the web component element
   * @returns a promise that gets resolved after successfull import
   */
  registerWCFromUrl(viewUrl: string, wc_id: string): Promise<unknown> {
    const i18nViewUrl = this.processViewUrl(viewUrl);

    return new Promise((resolve, reject) => {
      if (this.checkWCUrl(i18nViewUrl)) {
        this.dynamicImport(i18nViewUrl)
          .then((module) => {
            try {
              if (!window.customElements.get(wc_id)) {
                let cmpClazz = module.default;

                if (!HTMLElement.isPrototypeOf(cmpClazz)) {
                  const props = Object.keys(module);

                  for (let i = 0; i < props.length; i++) {
                    cmpClazz = module[props[i]];

                    if (HTMLElement.isPrototypeOf(cmpClazz)) {
                      break;
                    }
                  }
                }

                window.customElements.define(wc_id, cmpClazz);
              }
              resolve(1);
            } catch (err) {
              reject(err);
            }
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        const message = `Error: View URL '${i18nViewUrl}' not allowed to be included`;
        reject(message);
      }
    });
  }

  /**
   * Handles the import of self registered web component bundles, i.e. the web component
   * is added to the customElements registry by the bundle code rather than by luigi.
   *
   * @param {*} node - the corresponding navigation node
   * @param {*} viewUrl - the source of the wc bundle
   * @param {*} onload - callback function executed after script attached and loaded
   */
  includeSelfRegisteredWCFromUrl(node: WebComponentNode, viewUrl: string, onload: () => void): void {
    if (this.checkWCUrl(viewUrl)) {
      /** Append reg function to luigi object if not present */
      if (!this.containerService.getContainerManager()._registerWebcomponent) {
        this.containerService.getContainerManager()._registerWebcomponent = (
          srcString: string,
          el: CustomElementConstructor
        ) => {
          window.customElements.define(this.generateWCId(srcString), el);
        };
      }

      // @ts-ignore
      if (!(window as any)['Luigi']) {
        // @ts-ignore
        window.Luigi = {};
        // @ts-ignore
        if (!(window as any)['Luigi']['_registerWebcomponent']) {
          // @ts-ignore
          window.Luigi._registerWebcomponent = (src, element) => {
            this.containerService.getContainerManager()._registerWebcomponent(src, element);
          };
        }
      }

      const scriptTag = document.createElement('script');

      scriptTag.setAttribute('src', viewUrl);

      if (node?.webcomponent?.type === 'module') {
        scriptTag.setAttribute('type', 'module');
      }

      scriptTag.setAttribute('defer', 'true');
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
   * @param {*} url - the url string to check
   */
  checkWCUrl(url: string): boolean {
    // if (url.indexOf('://') > 0 || url.trim().indexOf('//') === 0) {
    //   const ur = new URL(url);
    //   if (ur.host === window.location.host) {
    //     return true; // same host is okay
    //   }

    //   const valids = LuigiConfig.getConfigValue('navigation.validWebcomponentUrls');
    //   if (valids && valids.length > 0) {
    //     for (let el of valids) {
    //       try {
    //         if (new RegExp(el).test(url)) {
    //           return true;
    //         }
    //       } catch (e) {
    //         console.error(e);
    //       }
    //     }
    //   }
    //   return false;
    // }
    // relative URL is okay
    // if (url === 'test.js') {
    //   return false;
    // }

    return true;
  }

  /**
   * Adds a web component defined by viewUrl to the wc_container and sets the node context.
   * If the web component is not defined yet, it gets imported.
   *
   * @param viewUrl url to render content from
   * @param wc_container web component container element
   * @param context luigi context
   * @param node node to operate on
   * @param nodeId id identifying the node
   * @param isCompoundChild defines if rendered mf is a compound child or not
   */
  renderWebComponent(
    viewUrl: string,
    wc_container: HTMLElement | any,
    context: object,
    node: WebComponentNode,
    nodeId?: string,
    isCompoundChild?: boolean
  ): void {
    const i18nViewUrl = this.processViewUrl(viewUrl, { context });
    const wc_id = node?.webcomponent?.tagName || this.generateWCId(i18nViewUrl);
    const wcItemPlaceholder = document.createElement('div');

    wc_container.appendChild(wcItemPlaceholder);
    wc_container._luigi_node = node;

    if (window.customElements.get(wc_id)) {
      this.attachWC(wc_id, wcItemPlaceholder, wc_container, context, i18nViewUrl, nodeId || '', isCompoundChild);
    } else {
      /** Custom import function, if defined */
      if ((window as any).luigiWCFn) {
        (window as any).luigiWCFn(i18nViewUrl, wc_id, wcItemPlaceholder, () => {
          this.attachWC(wc_id, wcItemPlaceholder, wc_container, context, i18nViewUrl, nodeId || '', isCompoundChild);
        });
      } else if (node?.webcomponent?.selfRegistered) {
        this.includeSelfRegisteredWCFromUrl(node, i18nViewUrl, () => {
          this.attachWC(wc_id, wcItemPlaceholder, wc_container, context, i18nViewUrl, nodeId || '', isCompoundChild);
        });
      } else {
        this.registerWCFromUrl(i18nViewUrl, wc_id)
          .then(() => {
            this.attachWC(wc_id, wcItemPlaceholder, wc_container, context, i18nViewUrl, nodeId || '', isCompoundChild);
          })
          .catch((error) => {
            console.warn('ERROR =>', error);
            // dispatch an error event to be handled core side
            this.containerService.dispatch(Events.RUNTIME_ERROR_HANDLING_REQUEST, this.thisComponent, error);
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
  createCompoundContainerAsync(
    renderer: WebComponentRenderer,
    ctx: object,
    navNode: WebComponentNode
  ): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
      if (renderer.viewUrl) {
        try {
          const wc_id = navNode?.webcomponent?.tagName || this.generateWCId(renderer.viewUrl);
          if (navNode?.webcomponent?.selfRegistered) {
            this.includeSelfRegisteredWCFromUrl(navNode, renderer.viewUrl, () => {
              const wc = document.createElement(wc_id);

              wc.setAttribute('lui_web_component', 'true');
              this.initWC(wc, wc_id, wc, renderer.viewUrl || '', ctx, '_root');
              resolve(wc);
            });
          } else {
            this.registerWCFromUrl(renderer.viewUrl, wc_id)
              .then(() => {
                const wc = document.createElement(wc_id);

                wc.setAttribute('lui_web_component', 'true');
                this.initWC(wc, wc_id, wc, renderer.viewUrl || '', ctx, '_root');
                resolve(wc);
              })
              .catch((error) => {
                console.warn('Error: ', error);
                // dispatch an error event to be handled core side
                this.containerService.dispatch(Events.RUNTIME_ERROR_HANDLING_REQUEST, this.thisComponent, error);
              });
          }
        } catch (error) {
          reject(error);
        }
      } else {
        // @ts-ignore
        resolve(renderer.createCompoundContainer());
      }
    });
  }

  /**
   * Responsible for rendering web component compounds based on a renderer or a nesting
   * micro frontend.
   *
   * @param {*} navNode - the navigation node defining the compound
   * @param {ContainerElement} wc_container - the web component container dom element
   * @param {*} context - the luigi node context
   */
  renderWebComponentCompound(
    navNode: WebComponentNode,
    wc_container: ContainerElement,
    context: object
  ): Promise<ContainerElement> {
    let renderer;

    if (navNode.webcomponent && navNode.viewUrl) {
      renderer = new DefaultCompoundRenderer();
      (renderer as any).viewUrl = this.processViewUrl(navNode.viewUrl, { context });
      renderer.createCompoundItemContainer = (layoutConfig: LayoutConfig) => {
        const cnt = document.createElement('div');

        if (layoutConfig?.slot) {
          cnt.setAttribute('slot', layoutConfig.slot);
        }

        return cnt;
      };
    } else if (navNode.compound?.renderer) {
      renderer = resolveRenderer(navNode.compound.renderer);
    }

    renderer = renderer || new DefaultCompoundRenderer();

    return new Promise((resolve) => {
      this.createCompoundContainerAsync(renderer, context, navNode)
        .then((compoundCnt: ContainerElement) => {
          wc_container._luigi_mfe_webcomponent = compoundCnt;
          wc_container._luigi_node = navNode;

          const ebListeners = {};

          /* eslint-disable */
          compoundCnt.eventBus = {
            listeners: ebListeners,
            onPublishEvent: (event: any, srcNodeId: any, wcId: any) => {
              const listeners = (ebListeners as any)[srcNodeId + '.' + event.type] || [];

              listeners.push(...((ebListeners as any)['*.' + event.type] || []));

              listeners.forEach((listenerInfo: any) => {
                const target =
                  listenerInfo.wcElement || compoundCnt.querySelector('[nodeId=' + listenerInfo.wcElementId + ']');

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

          navNode.compound?.children?.forEach((wc: any, index: number) => {
            const ctx = { ...context, ...wc.context };
            const compoundItemCnt = renderer.createCompoundItemContainer(wc.layoutConfig);

            (compoundItemCnt as any).eventBus = compoundCnt.eventBus;
            renderer.attachCompoundItem(compoundCnt, compoundItemCnt);

            const nodeId = wc.id || 'gen_' + index;

            this.renderWebComponent(wc.viewUrl, compoundItemCnt, ctx, wc, nodeId, true);
            registerEventListeners(ebListeners, wc, nodeId);
          });
          /* eslint-enable */

          wc_container.appendChild(compoundCnt);
          // listener for nesting wc
          registerEventListeners(ebListeners, navNode.compound, '_root', compoundCnt);
          resolve(compoundCnt);
        })
        .catch((error) => {
          // dispatch an error event to be handled core sid
          console.warn('Error: ', error);
          this.containerService.dispatch(Events.RUNTIME_ERROR_HANDLING_REQUEST, this.thisComponent, error);
        });
    });
  }

  /**
   * Resolves an alert by invoking the corresponding resolver function for the given alert ID.
   * This method attempts to resolve an alert associated with the specified `id` by calling its resolver function,
   * if one exists in the `alertResolvers` object. If the resolver exists, it is invoked with `dismissKey` as its argument,
   * and then the resolver is removed from the `alertResolvers` object to avoid future invocations. If no resolver is found
   * for the provided `id`, a message is logged to the console indicating that no matching promise is in the list.
   * @param {string} id - the unique identifier for the alert to resolve
   * @param {boolean|string} dismissKey - an optional key or value passed to the resolver; defaults to `true` if not provided
   *
   * @returns {void}
   *
   */
  resolveAlert(id: string, dismissKey?: boolean | string): void {
    if (this.alertResolvers[id]) {
      this.alertResolvers[id](dismissKey === undefined ? true : dismissKey);
      this.alertResolvers[id] = undefined;
    } else {
      console.log('Promise is not in the list.');
    }
  }

  /**
   * Resolves a confirmation modal by invoking the corresponding resolver function.
   *
   * @param {boolean} confirmed - the result of the modal being closed
   *
   */
  notifyConfirmationModalClosed(confirmed: boolean): void {
    if (this.modalResolver) {
      if (confirmed) {
        this.modalResolver.resolve();
      } else {
        this.modalResolver.reject();
      }

      this.modalResolver = undefined;
    } else {
      console.log('Modal promise is not listed.');
    }
  }
}
