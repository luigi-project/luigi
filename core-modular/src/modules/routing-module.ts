import { NavigationHelpers } from '../utilities/helpers/navigation-helpers';
import { NavigationService, type ExternalLink, type Node, type PageErrorHandler } from '../services/navigation.service';
import type { Luigi } from '../core-api/luigi';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import { serviceRegistry } from '../services/service-registry';

export const RoutingModule = {
  init: (luigi: Luigi) => {
    const navService = serviceRegistry.get<NavigationService>('navigationService');
    const luigiConfig = luigi.getConfig();
    console.log('Init Routing...', luigiConfig.routing);
    if (luigiConfig.routing?.useHashRouting) {
      window.addEventListener('hashchange', (ev) => {
        console.log('HashChange', location.hash);
        const pathRaw = NavigationHelpers.normalizePath(location.hash);

        const [path, query] = pathRaw.split('?');
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
  }
};
