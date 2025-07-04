import { NavigationHelpers } from '../utilities/helpers/navigation-helpers';
import { NavigationService, type Node, type PageErrorHandler } from '../services/navigation.service';
import type { Luigi } from '../core-api/luigi';

export const RoutingModule = {
  init: (luigi: Luigi) => {
    const navService = new NavigationService(luigi);
    const luigiConfig = luigi.getConfig();
    console.log('Init Routing...', luigiConfig.routing);
    if (luigiConfig.routing?.useHashRouting) {
      window.addEventListener('hashchange', (ev) => {
        console.log('HashChange', location.hash);
        const path = NavigationHelpers.normalizePath(location.hash);
        const redirect = navService.shouldRedirect(path);
        if (redirect) {
          luigi.navigation().navigate(redirect);
          return;
        }
        const currentNode = navService.getCurrentNode(path);
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
        // if (node.node.loadingIndicator...)
        if (pageErrorHandler.viewUrl) {
          node.viewUrl = pageErrorHandler.viewUrl;
          luigi.getEngine()._ui.updateMainContent(node, luigi);
          console.log("globalThis", luigi);
        }
        else {
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
  }
};
