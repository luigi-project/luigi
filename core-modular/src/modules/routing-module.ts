import { NavigationHelpers } from '../utilities/helpers/navigation-helpers';
import { NavigationService } from '../services/navigation.service';
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
  }
};
