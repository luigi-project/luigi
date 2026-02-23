import type { Luigi } from '../core-api/luigi';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import { NavigationService } from '../services/navigation.service';
import { serviceRegistry } from '../services/service-registry';
import { RoutingService } from '../services/routing.service';
import type { ExternalLink, Node, PageErrorHandler } from '../types/navigation';

export const RoutingModule = {
  init: (luigi: Luigi) => {
    const routingService = serviceRegistry.get(RoutingService);
    routingService.enableRouting();
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
        const newWindow = window.open(externalLink.url, '_blank', 'noopener noreferrer');
        if (newWindow) {
          newWindow.opener = null;
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
  async addSearchParamsFromClient(
    searchParams: Record<string, any>,
    keepBrowserHistory: boolean,
    luigi: Luigi
  ): Promise<void> {
    const navService = serviceRegistry.get(NavigationService);
    const pathObj = RoutingHelpers.getCurrentPath();
    const currentNode = await navService.getCurrentNode(pathObj.path);
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
