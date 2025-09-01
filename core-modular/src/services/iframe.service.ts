import type { Luigi } from '../core-api/luigi';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { IframeHelpers } from '../utilities/helpers/iframe-helpers';
import { NavigationHelpers } from '../utilities/helpers/navigation-helpers';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';

export class IframeService {
  protected iframeNavFallbackTimeout: number;
  protected timeoutHandle!: NodeJS.Timeout;

  constructor(private luigi: Luigi) {
    this.iframeNavFallbackTimeout = 2000;
  }

  getActiveIframe(node: any): any {
    const children = [...node.children];

    return children.filter((child) => child.tagName === 'IFRAME').find((el) => GenericHelpers.isElementVisible(el));
  }

  setActiveIframeToPrevious(node: any): void {
    const iframesInDom = IframeHelpers.getMainIframes();
    const preservedViews = this.getPreservedViewsInDom(iframesInDom);

    if (preservedViews.length === 0) {
      return;
    }

    const activeIframe = this.getActiveIframe(node);

    IframeHelpers.hideElementChildren(node);

    if (activeIframe) {
      node.removeChild(activeIframe);
    }

    // unmark next preserved view as pv
    preservedViews[0].pv = undefined;
    preservedViews[0].style.display = 'block';
  }

  removeInactiveIframes(node: any): void {
    const children = [...node.children];

    children.forEach((child) => {
      if (!GenericHelpers.isElementVisible(child) && !child.vg && child.tagName === 'IFRAME') {
        node.removeChild(child);
      }
    });
  }

  hasIsolatedView(isolateView: boolean, isSameViewGroup: boolean, isolateAllViews: boolean): boolean {
    return isolateView || (isolateAllViews && !(isolateView === false) && !isSameViewGroup);
  }

  getPreservedViewsInDom(iframes: any[]): any[] {
    return iframes.filter((iframe) => iframe.pv);
  }

  canCache(viewGroup: any): boolean {
    const vgSettings = NavigationHelpers.getViewGroupSettings(viewGroup, this.luigi);

    return vgSettings && vgSettings.preloadUrl;
  }

  notifyInactiveIframes(): void {
    const message = {
      msg: 'luigi-client.inactive-microfrontend',
      context: JSON.stringify({}),
      nodeParams: JSON.stringify({}),
      pathParams: JSON.stringify({}),
      internal: JSON.stringify({}) // TODO
    };

    IframeHelpers.sendMessageToVisibleIframes(message);
  }

  switchActiveIframe(container: any, newActiveIframe: any, removeCurrentActive: boolean): any {
    const currentActiveIframe = this.getActiveIframe(container);

    if (currentActiveIframe !== newActiveIframe) {
      let newActiveFound = false;
      const children = Array.from(container.children);

      children.forEach((child: any) => {
        if (child === currentActiveIframe) {
          if (removeCurrentActive) {
            container.removeChild(child);
          } else {
            const vgSettings = NavigationHelpers.getViewGroupSettings(child.vg, this.luigi);

            if (vgSettings) {
              this.notifyInactiveIframes();
            }

            // set non only after inactive message, else it will not get detected.
            child.style.display = 'none';

            if (vgSettings.preloadUrl) {
              const message = {
                msg: 'luigi.navigate',
                viewUrl: vgSettings.preloadUrl,
                context: JSON.stringify({}),
                nodeParams: JSON.stringify({}),
                pathParams: JSON.stringify({}),
                internal: JSON.stringify({}) // TODO
              };

              IframeHelpers.sendMessageToIframe(child, message);
            }
          }
        }

        if (child === newActiveIframe) {
          newActiveFound = true;
        }
      });

      if (newActiveIframe) {
        newActiveIframe.style.display = 'block';

        if (!newActiveFound) {
          container.insertBefore(newActiveIframe, container.firstChild);
        }
      }
    }

    return newActiveIframe;
  }

  setOkResponseHandler(config: any, component: any, node: any): void {
    const noClientCheck = NavigationHelpers.getViewGroupSettings(config.iframe?.vg, this.luigi)?.noClientCheck;

    /**
     * check for `noClientCheck` attribute
     * when set to `true`, it prevents a navigation check when reactivating the iframe
     */
    if (noClientCheck) {
      return;
    }

    /**
     * check if luigi responded
     * if not, callback again to replace the iframe
     */
    this.timeoutHandle = setTimeout(async () => {
      if (config.navigateOk) {
        config.navigateOk = undefined;
      } else {
        IframeHelpers.removeIframe(config.iframe, node);
        config.iframe = undefined;
        config.isFallbackFrame = true;
        console.info('navigate: luigi-client did not respond, using fallback by replacing iframe');
        await this.navigateIframe(config, component, node);
      }
    }, this.iframeNavFallbackTimeout);
  }

  checkIframe(errorHandlerNode: any, componentNode: any, viewUrlPath: string, config: any, node: any): void {
    this.timeoutHandle = setTimeout(() => {
      if (componentNode.showLoadingIndicator?.enabled) {
        if (errorHandlerNode.viewUrl) {
          viewUrlPath = errorHandlerNode.viewUrl;
          // TODO componentNode.set({ viewUrl: viewUrlPath });
          this.iframeNavFallbackTimeout = 0;
          this.setOkResponseHandler(config, componentNode, node);
        } else {
          NavigationHelpers.handleUnresponsiveClient(errorHandlerNode);
        }
      }
    }, errorHandlerNode.timeout);
  }

  /**
   * Checks if Client has set the initOk if the clientVersion is younger than 1.2.2
   * or if it failed to receive the initial get-context request.
   * @since: 1.2.2
   */
  initHandshakeFailed(config: any): boolean {
    if (!(config && config.iframe && config.iframe.luigi)) {
      return true;
    }

    const clientVersion = config.iframe.luigi.clientVersion;
    const noClientCheck = NavigationHelpers.getViewGroupSettings(config.iframe.vg, this.luigi)?.noClientCheck;

    /**
     * check for `noClientCheck` attribute
     * when set to `true`, it prevents a navigation check when reactivating the iframe
     */
    if (noClientCheck) {
      return false;
    }

    if (config.iframe.luigi.initOk === undefined) {
      // initial get-context request was not received
      return true;
    } else if (
      // valid minimum handshake version: 1.2.2
      !clientVersion ||
      GenericHelpers.semverCompare('1.1.1', clientVersion) !== -1
    ) {
      return false;
    }

    return !config.iframe.luigi.initOk;
  }

  async navigateIframe(config: any, component: any, node: any): Promise<void> {
    clearTimeout(this.timeoutHandle);

    const componentData = { ...component };
    let viewUrl = componentData.viewUrl;

    if (viewUrl) {
      viewUrl = RoutingHelpers.substituteViewUrl(viewUrl, componentData);
    }

    const isSameViewGroup = IframeHelpers.isSameViewGroup(config, component);
    const previousViewIsolated = this.hasIsolatedView(
      componentData.previousNodeValues.isolateView,
      isSameViewGroup,
      config.isolateAllViews
    );
    const nextViewIsolated = this.hasIsolatedView(componentData.isolateView, isSameViewGroup, config.isolateAllViews);
    const canReuseIframe = IframeHelpers.canReuseIframe(config, component);
    let activeIframe = this.getActiveIframe(node);
    const iframes = IframeHelpers.getMainIframes();
    const goBackStack = this.getPreservedViewsInDom(iframes);
    let firstInGoBackStack = undefined;
    let pvSituation = false;

    if (goBackStack.length > 0) {
      firstInGoBackStack = goBackStack.shift();

      if (firstInGoBackStack === activeIframe) {
        pvSituation = true;
        activeIframe = undefined;
        config.iframe = undefined;
      }
    }

    if (!pvSituation && !component.isNavigateBack) {
      // if previous view must be isolated
      if (activeIframe && previousViewIsolated) {
        activeIframe = this.switchActiveIframe(node, undefined, true);
      }

      // if next view must be isolated
      if (activeIframe && nextViewIsolated) {
        activeIframe = this.switchActiveIframe(node, undefined, !activeIframe.vg);
      }

      // if next view is not isolated we can pick a iframe with matching viewGroup from the pool
      let targetIframe;

      if (!nextViewIsolated && componentData.viewGroup) {
        const iframes = IframeHelpers.getMainIframes();
        const sameViewGroupIframes = iframes.filter((iframe: any) => {
          return iframe.vg === componentData.viewGroup;
        });

        if (sameViewGroupIframes.length > 0) {
          targetIframe = sameViewGroupIframes[0];

          // make the targetIframe the new active iframe
          activeIframe = this.switchActiveIframe(node, targetIframe, activeIframe && !activeIframe.vg);
        }
      }

      if (activeIframe && !targetIframe) {
        if (activeIframe.vg) {
          activeIframe = this.switchActiveIframe(node, undefined, false);
        } else if (!canReuseIframe) {
          activeIframe = this.switchActiveIframe(node, undefined, true);
        }
      }

      config.iframe = activeIframe;
    }

    // if iframe does not exist, or handshake was interrupted, create a new one
    if (!config.iframe || this.initHandshakeFailed(config)) {
      if (config.iframe) {
        node.removeChild(config.iframe);
      }

      // preserveView, hide other frames, else remove
      if (pvSituation) {
        this.notifyInactiveIframes();
        IframeHelpers.hideElementChildren(node);
      } else {
        IframeHelpers.removeElementChildren(node);
      }

      if (componentData.viewUrl) {
        if (GenericHelpers.getConfigValueFromObject(componentData, 'currentNode.loadingIndicator.enabled') !== false) {
          this.luigi.ux().showLoadingIndicator();
        } else {
          this.luigi.ux().hideLoadingIndicator();
        }

        config.navigateOk = undefined;

        const canCache = componentData.viewGroup && !nextViewIsolated && this.canCache(componentData.viewGroup);

        config.iframe = IframeHelpers.createIframe(
          viewUrl,
          canCache ? componentData.viewGroup : undefined,
          component.currentNode,
          'main',
          componentData,
          this.luigi
        );
        node.insertBefore(config.iframe, node.firstChild);

        if (config.builderCompatibilityMode) {
          config.iframe.addEventListener('load', () => {
            config.iframe._ready = true;

            const message = ['init', JSON.stringify(componentData.context)];

            IframeHelpers.sendMessageToIframe(config.iframe, message);
          });
        } else {
          const iframe = config.iframe;

          iframe.addEventListener('load', () => {
            iframe._ready = true;
          });
        }

        // In case something goes wrong with client and showLoadingIndicator is still active
        const pageErrorHandler = componentData.currentNode.pageErrorHandler;

        if (pageErrorHandler) {
          this.checkIframe(pageErrorHandler, component.currentNode, viewUrl, config, node);
        } else if (config.defaultPageErrorHandler) {
          this.checkIframe(config.defaultPageErrorHandler, component.currentNode, viewUrl, config, node);
        }
      }
    } else {
      this.luigi.ux().hideLoadingIndicator();

      const goBackContext = component.goBackContext;

      config.iframe.style.display = 'block';
      config.iframe.luigi.nextViewUrl = viewUrl;
      config.iframe.luigi.nextClientPermissions = component.currentNode.clientPermissions;
      config.iframe['vg'] = this.canCache(componentData.viewGroup) ? componentData.viewGroup : undefined;
      config.iframe.luigi.currentNode = componentData.currentNode;

      // const internalData = await component.prepareInternalData(config);
      const message = {
        msg: 'luigi.navigate',
        viewUrl: viewUrl,
        context: JSON.stringify(Object.assign({}, componentData.context, { goBackContext })),
        nodeParams: JSON.stringify(Object.assign({}, componentData.nodeParams)),
        pathParams: JSON.stringify(Object.assign({}, componentData.pathParams)),
        searchParams: JSON.stringify({}), // TODO
        internal: JSON.stringify({}) // TODO
      };
      const withSync = componentData.isNavigationSyncEnabled;

      if (withSync) {
        /* TODO
        IframeHelpers.getVisibleIframes().forEach((iframe) => {
          if (iframe !== config.iframe) {
            if (iframe.userSettingsGroup) {
              this.luigi.readUserSettings().then((storedUserSettings) => {
                IframeHelpers.sendMessageToIframe(iframe, {
                  msg: 'luigi.navigate',
                  context: {
                    userSettingsData: storedUserSettings[iframe.userSettingsGroup]
                  },
                  internal: IframeHelpers.applyCoreStateData(iframe.luigi._lastUpdatedMessage.internal)
                });
              });
            } else {
              IframeHelpers.sendMessageToIframe(iframe, {
                msg: 'luigi.navigate',
                context: iframe.luigi._lastUpdatedMessage.context,
                nodeParams: iframe.luigi._lastUpdatedMessage.nodeParams,
                pathParams: JSON.stringify(Object.assign({}, iframe.luigi.pathParams)),
                searchParams: JSON.stringify(
                  Object.assign({}, RoutingHelpers.prepareSearchParamsForClient(config.iframe.luigi.currentNode))
                ),
                internal: IframeHelpers.applyCoreStateData(iframe.luigi._lastUpdatedMessage.internal)
              });
            }
          }
        });
        */
        IframeHelpers.sendMessageToIframe(config.iframe, message);
        this.setOkResponseHandler(config, component, node);
      } else {
        // `withoutSync()` used - client navigation was skipped, reset after one-time use
        // TODO component.set({ isNavigationSyncEnabled: true });
      }

      // clear goBackContext and reset navigateBack after sending it to the client
      // TODO component.set({ goBackContext: undefined, isNavigateBack: false });
    }
  }
}
