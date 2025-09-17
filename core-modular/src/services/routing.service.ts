import type { Luigi } from '../core-api/luigi';
import { UIModule } from '../modules/ui-module';

export class RoutingService {
  previousNode: Node | undefined;
  constructor(private luigi: Luigi) {}

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
  enableRouting(): void {
    const luigiConfig = this.luigi.getConfig();
    console.log('Init Routing...', luigiConfig.routing);
    if (luigiConfig.routing?.useHashRouting) {
      window.addEventListener('hashchange', (ev) => {
        console.log('HashChange', location.hash);
        UIModule.update();
      });
    } else {
      //tbs: handle path routing
    }
  }
}
