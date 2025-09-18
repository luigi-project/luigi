import type { Luigi } from '../core-api/luigi';
import { UIModule } from '../modules/ui-module';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import type { Node } from './navigation.service';
import { NavigationService } from './navigation.service';
import { serviceRegistry } from './service-registry';

export interface Route {
  raw: string;
  node?: Node;
  path: string;
  nodeParams?: Record<string, string>;
}

export class RoutingService {
  navigationService?: NavigationService;
  previousNode: Node | undefined;
  currentRoute?: Route;

  constructor(private luigi: Luigi) {}

  private getNavigationService(): NavigationService {
    if (!this.navigationService) {
      this.navigationService = serviceRegistry.get(NavigationService);
    }
    return this.navigationService;
  }
  /**
   * Initializes the route change handler for the application.
   *
   * Depending on the Luigi configuration, this method sets up a listener for hash-based or path-based routing changes.
   * When the URL changes, it:
   * - Parses the current path and query parameters.
   * - Filters node-specific parameters.
   * - Checks if a redirect is necessary and navigates if so.
   * - Retrieves and updates the current navigation node.
   * - Notifies the navigation service of the node change.
   * - Updates the top, left, and tab navigation UIs.
   * - Updates the main content area based on the current node.
   *
   */
  enableRouting(): void {
    const luigiConfig = this.luigi.getConfig();
    console.log('Init Routing...', luigiConfig.routing);
    if (luigiConfig.routing?.useHashRouting) {
      window.addEventListener('hashchange', (ev) => {
        console.log('HashChange', location.hash);
        this.handleRouteChange(RoutingHelpers.getCurrentPath(true));
      });
      this.handleRouteChange(RoutingHelpers.getCurrentPath(true));
    } else {
      window.addEventListener('popstate', (ev) => {
        console.log('HashChange', location.hash);
        this.handleRouteChange(RoutingHelpers.getCurrentPath());
      });
      this.handleRouteChange(RoutingHelpers.getCurrentPath());
    }
  }

  handleRouteChange(routeInfo: { path: string; query: string }): void {
    const path = routeInfo.path;
    const query = routeInfo.query;
    const urlSearchParams = new URLSearchParams(query);
    const paramsObj: Record<string, string> = {};
    urlSearchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });
    const nodeParams = RoutingHelpers.filterNodeParams(paramsObj, this.luigi);
    const redirect = this.getNavigationService().shouldRedirect(path);
    if (redirect) {
      this.luigi.navigation().navigate(redirect);
      return;
    }

    this.currentRoute = {
      raw: window.location.href,
      path,
      nodeParams
    };

    this.luigi.getEngine()._connector?.renderTopNav(this.getNavigationService().getTopNavData(path));
    this.luigi.getEngine()._connector?.renderLeftNav(this.getNavigationService().getLeftNavData(path));
    this.luigi.getEngine()._connector?.renderTabNav(this.getNavigationService().getTabNavData(path));

    const currentNode = this.getNavigationService().getCurrentNode(path);
    if (currentNode) {
      this.currentRoute.node = currentNode;
      currentNode.nodeParams = nodeParams || {};
      currentNode.searchParams = RoutingHelpers.prepareSearchParamsForClient(currentNode, this.luigi);

      this.getNavigationService().onNodeChange(this.previousNode, currentNode);
      this.previousNode = currentNode;
      UIModule.updateMainContent(currentNode, this.luigi);
    }
  }

  getCurrentRoute(): Route | undefined {
    return this.currentRoute;
  }
}
