import type { Luigi } from '../core-api/luigi';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import { NavigationService, type Node } from './navigation.service';
import { serviceRegistry } from './service-registry';

export class RoutingService {
  previousNode: Node | undefined;

  constructor(private luigi: Luigi) {}

  /**
   * If the current route matches any of the defined patterns, it will be skipped.
   * @returns {boolean} true if the current route matches any of the patterns, false otherwise
   */
  shouldSkipRoutingForUrlPatterns(): boolean {
    const defaultPattern: RegExp[] = [/access_token=/, /id_token=/];
    const patterns: any[] = this.luigi.getConfigValue('routing.skipRoutingForUrlPatterns') || defaultPattern;

    return patterns.filter((pattern) => location.href.match(pattern)).length !== 0;
  }

  /**
   * Initializes the route change handler for the application.
   *
   * Depending on the Luigi configuration, this method sets up a listener for hash-based routing changes.
   * When the URL hash changes, it:
   * - Parses the current path and query parameters.
   * - Filters node-specific parameters.
   * - Checks if a redirect is necessary and navigates if so.
   * - Retrieves and updates the current navigation node.
   * - Notifies the navigation service of the node change.
   * - Updates the top, left, and tab navigation UIs.
   * - Updates the main content area based on the current node.
   *
   * If hash routing is not enabled, this method provides a placeholder for handling path-based routing.
   */
  handleRouteChange(): void {
    const navService = serviceRegistry.get(NavigationService);
    const luigiConfig = this.luigi.getConfig();
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
        const nodeParams = RoutingHelpers.filterNodeParams(paramsObj, this.luigi);
        const redirect = navService.shouldRedirect(path);
        if (redirect) {
          this.luigi.navigation().navigate(redirect);
          return;
        }

        const currentNode = navService.getCurrentNode(path);
        currentNode.nodeParams = nodeParams || {};
        currentNode.searchParams = RoutingHelpers.prepareSearchParamsForClient(currentNode, this.luigi);

        navService.onNodeChange(this.previousNode, currentNode);
        this.previousNode = currentNode;

        this.luigi.getEngine()._connector?.renderTopNav(navService.getTopNavData(path));
        this.luigi.getEngine()._connector?.renderLeftNav(navService.getLeftNavData(path));
        this.luigi.getEngine()._connector?.renderTabNav(navService.getTabNavData(path));
        this.luigi.getEngine()._ui.updateMainContent(currentNode, this.luigi);
      });
    } else {
      //tbs: handle path routing
    }
  }
}
