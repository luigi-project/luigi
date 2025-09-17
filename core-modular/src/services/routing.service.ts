import type { Luigi } from '../core-api/luigi';
import { UIModule } from '../modules/ui-module';
import { NavigationHelpers } from '../utilities/helpers/navigation-helpers';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import type { Node } from './navigation.service';

export interface Route {
  raw: string;
  node?: Node;
  path: string;
  nodeParams?: Record<string, string>;
}

export class RoutingService {
  previousNode: Node | undefined;
  currentRoute?: Route;

  constructor(private luigi: Luigi) {}

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
        this.handleRouteChange(location.hash);
      });
      this.handleRouteChange(location.hash);
    } else {
      window.addEventListener('popstate', (ev) => {
        console.log('HashChange', location.hash);
        this.handleRouteChange(location.pathname);
      });
      this.handleRouteChange(location.pathname);
    }
  }

  handleRouteChange(routeInfo: string): void {
    const pathRaw = NavigationHelpers.normalizePath(routeInfo);
    const [path, query] = pathRaw.split('?');
    const urlSearchParams = new URLSearchParams(query);
    const paramsObj: Record<string, string> = {};
    urlSearchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });
    const nodeParams = RoutingHelpers.filterNodeParams(paramsObj, UIModule.luigi);
    const redirect = UIModule.navService.shouldRedirect(path);
    if (redirect) {
      UIModule.luigi.navigation().navigate(redirect);
      return;
    }

    this.currentRoute = {
      raw: pathRaw,
      path,
      nodeParams
    }

    UIModule.luigi.getEngine()._connector?.renderTopNav(UIModule.navService.getTopNavData(path));
    UIModule.luigi.getEngine()._connector?.renderLeftNav(UIModule.navService.getLeftNavData(path));
    UIModule.luigi.getEngine()._connector?.renderTabNav(UIModule.navService.getTabNavData(path));

    const currentNode = UIModule.navService.getCurrentNode(path);
    if (currentNode) {
      this.currentRoute.node = currentNode;
      currentNode.nodeParams = nodeParams || {};
      currentNode.searchParams = RoutingHelpers.prepareSearchParamsForClient(currentNode, this.luigi);

      UIModule.navService.onNodeChange(this.previousNode, currentNode);
      this.previousNode = currentNode;
      UIModule.updateMainContent(currentNode, UIModule.luigi);
    }
  }

  getCurrentRoute(): Route | undefined {
    return this.currentRoute;
  }
}
