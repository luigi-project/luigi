import { NavigationHelpers } from '../utilities/helpers/navigation-helpers';
import { NavigationService, type ExternalLink, type Node, type PageErrorHandler } from '../services/navigation.service';
import type { Luigi } from '../core-api/luigi';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import { serviceRegistry } from '../services/service-registry';

export const RoutingModule = {
  init: (luigi: Luigi) => {
    const navService = serviceRegistry.get(NavigationService);
    const luigiConfig = luigi.getConfig();
    console.log('Init Routing...', luigiConfig.routing);
    if (luigiConfig.routing?.useHashRouting) {
      window.addEventListener('hashchange', (ev) => {
        console.log('HashChange', location.hash);
        const { path, query } = RoutingHelpers.getCurrentPath();
        const urlSearchParams = new URLSearchParams(query);
        const paramsObj: Record<string, string> = {};
        urlSearchParams.forEach((value, key) => {
          paramsObj[key] = value;
        });
        const nodeParams = RoutingHelpers.filterNodeParams(paramsObj, luigi);
        const redirect = navService.shouldRedirect(path);
        if (redirect) {
          luigi.navigation().navigate(redirect);
          return;
        }
        const currentNode = navService.getCurrentNode(path);
        currentNode.nodeParams = nodeParams || {};
        currentNode.searchParams = RoutingHelpers.prepareSearchParamsForClient(currentNode, luigi);
        luigi.getEngine()._connector?.renderTopNav(navService.getTopNavData(path));
        luigi.getEngine()._connector?.renderLeftNav(navService.getLeftNavData(path));
        luigi.getEngine()._connector?.renderTabNav(navService.getTabNavData(path));
        luigi.getEngine()._ui.updateMainContent(currentNode, luigi);
      });
    } else {
      // TBD
    }
  },

  handlePageErrorHandler: (pageErrorHandler: PageErrorHandler, node: Node, luigi: Luigi) => {
    if (pageErrorHandler && pageErrorHandler.timeout) {
      setTimeout(() => {
        // TODO: check showLoadingIndicator also needed (loading indicator not implemented yet)
        // if (node.loadingIndicator...)
        if (pageErrorHandler.viewUrl) {
          node.viewUrl = pageErrorHandler.viewUrl;
          luigi.getEngine()._ui.updateMainContent(node, luigi);
        } else {
          if (pageErrorHandler.errorFn) {
            pageErrorHandler.errorFn(node);
          } else {
            console.warn('Something went wrong with a client! You will be redirected to another page.');
            const path = pageErrorHandler.redirectPath || '/';
            luigi.navigation().navigate(path);
          }
        }
      }, pageErrorHandler.timeout);
    }
  },

  handleExternalLinkNavigation: (externalLink: ExternalLink) => {
    if (externalLink.url) {
      const sameWindow = externalLink.sameWindow || false;
      if (sameWindow) {
        window.location.href = externalLink.url;
      } else {
        const newWindow = window.open(externalLink.url, '_blank');
        if (newWindow) {
          newWindow.focus();
        }
      }
    }
  },

  /**
   * Adds search parameters to the URL based on client permissions defined in the current navigation node.
   *
   * Only parameters explicitly allowed (with `write: true` permission) in the current node's `clientPermissions.urlParameters`
   * are added to the URL. Parameters without permission will trigger a warning in the console and will not be added.
   *
   * @param searchParams - An object containing key-value pairs of search parameters to be added to the URL.
   * @param keepBrowserHistory - If `true`, the browser history will be preserved when updating the URL.
   * @param luigi - The Luigi core instance used to interact with the routing API.
   */
  addSearchParamsFromClient(searchParams: Record<string, any>, keepBrowserHistory: boolean, luigi: Luigi): void {
    const navService = serviceRegistry.get(NavigationService);
    const pathObj = RoutingHelpers.getCurrentPath();
    const currentNode = navService.getCurrentNode(pathObj.path);
    const localSearchParams = { ...searchParams };

    if (currentNode?.clientPermissions?.urlParameters) {
      const filteredObj: Record<string, any> = {};
      Object.keys(currentNode.clientPermissions.urlParameters).forEach((key) => {
        if (key in localSearchParams && currentNode.clientPermissions.urlParameters[key].write === true) {
          filteredObj[key] = localSearchParams[key];
          delete localSearchParams[key];
        }
      });
      for (const key in localSearchParams) {
        console.warn(`No permission to add the search param "${key}" to the url`);
      }
      if (Object.keys(filteredObj).length > 0) {
        luigi.routing().addSearchParams(filteredObj, keepBrowserHistory);
      }
    }
  }
};
