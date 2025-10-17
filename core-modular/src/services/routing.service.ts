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
        this.closeModals();
        console.log('HashChange', location.hash);
        this.handleRouteChange(RoutingHelpers.getCurrentPath(true));
      });
      this.handleRouteChange(RoutingHelpers.getCurrentPath(true));
    } else {
      window.addEventListener('popstate', (ev) => {
        this.closeModals();
        console.log('HashChange', location.hash);
        this.handleRouteChange(RoutingHelpers.getCurrentPath());
      });
      this.handleRouteChange(RoutingHelpers.getCurrentPath());
    }
  }

  async handleRouteChange(routeInfo: { path: string; query: string }): Promise<void> {
    const path = routeInfo.path;
    const query = routeInfo.query;
    const urlSearchParams = new URLSearchParams(query);
    const paramsObj: Record<string, string> = {};

    if (this.shouldSkipRoutingForUrlPatterns()) {
      return;
    }

    await this.shouldShowModalPathInUrl();

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

  /**
   * If `showModalPathInUrl` is provided, bookmarkable modal path will be triggered.
   */
  async shouldShowModalPathInUrl(): Promise<void> {
    if (this.luigi.getConfigValue('routing.showModalPathInUrl')) {
      await this.handleBookmarkableModalPath();
    }
  }

  /**
   * Handles opening a modal based on the current bookmarkable path.
   *
   * This method checks if there is an additional modal path present in the current Luigi path.
   * If a modal path exists, it retrieves the corresponding modal parameters and node data,
   * then opens the modal using the navigation service.
   *
   * @returns {Promise<void>} A promise that resolves when the modal handling is complete.
   */
  async handleBookmarkableModalPath(): Promise<void> {
    const additionalModalPath = RoutingHelpers.getModalPathFromPath(this.luigi);
    const navService = serviceRegistry.get(NavigationService);
    if (additionalModalPath) {
      const modalParams = RoutingHelpers.getModalParamsFromPath(this.luigi);
      const { nodeObject } = await navService.extractDataFromPath(additionalModalPath);
      this.luigi.navigation().openAsModal(additionalModalPath, modalParams || nodeObject.openNodeInModal);
    }
  }

  /**
   * Append modal data to url
   * @param {string} modalPath path of the view which is displayed in the modal
   * @param {Object} modalParams query parameter
   */
  appendModalDataToUrl(modalPath: string, modalParams: object): void {
    // global setting for persistence in url .. default false
    let queryParamSeparator = RoutingHelpers.getHashQueryParamSeparator();
    const params = RoutingHelpers.getQueryParams(this.luigi);
    const modalParamName = RoutingHelpers.getModalViewParamName(this.luigi);
    const prevModalPath = params[modalParamName];
    const url = new URL(location.href);
    const hashRoutingActive = this.luigi.getConfigValue('routing.useHashRouting');
    let historyState = history.state;

    const { pathWithoutModalData, urlWithoutModalData } = RoutingHelpers.computePathAndUrlWithoutModalData(
      url,
      hashRoutingActive,
      modalParamName
    );
    historyState = RoutingHelpers.handleHistoryState(historyState, pathWithoutModalData);
    if (prevModalPath !== modalPath) {
      this.updateParamsWithModal(params, modalParamName, modalPath, modalParams);
      this.applyParamsToUrl(url, params, hashRoutingActive, queryParamSeparator);
      history.pushState(historyState, '', url.href);
    } else {
      this.handleSameModalPath(url, urlWithoutModalData, hashRoutingActive, historyState);
    }
  }

  /**
   * Adds modal-related routing information to an existing parameters object.
   *
   * Mutates the provided params object by:
   * - Setting the given modalParamName key to the modal path.
   * - Optionally adding a JSON-serialized set of modal parameters under
   *   a key composed of the modalParamName followed by "Params" (e.g. "<name>Params"),
   *   only if modalParams is provided and not empty.
   *
   * @param params An object representing (and to be mutated as) the current route/query parameters.
   * @param modalParamName The base parameter name under which the modal path (and its params) will be stored.
   * @param modalPath The route fragment or identifier of the modal to open.
   * @param modalParams Optional plain object of parameters to pass to the modal.
   *                    Ignored if null/undefined or has no own enumerable keys.
   */
  private updateParamsWithModal(
    params: Record<string, any>,
    modalParamName: string,
    modalPath: string,
    modalParams?: object
  ): void {
    params[modalParamName] = modalPath;
    if (modalParams && Object.keys(modalParams).length) {
      params[`${modalParamName}Params`] = JSON.stringify(modalParams);
    }
  }

  /**
   * Mutates the provided URL object by applying the given query parameters either
   * to the search portion (?foo=bar) or, if hash-based routing is active, to the
   * hash fragment (#/path?foo=bar style).
   *
   * When hash routing is active, existing parameters (those after the first occurrence
   * of the provided queryParamSeparator inside the current location.hash) are removed
   * before appending the newly encoded parameters to url.hash. Otherwise, the entire
   * url.search value is replaced with a freshly encoded query string.
   *
   * @param url - A mutable URL instance whose hash or search component will be updated in place.
   * @param params - A map of key/value pairs to serialize via RoutingHelpers.encodeParams.
   *                 Values are encoded; undefined or null handling depends on the encoder.
   * @param hashRoutingActive - If true, parameters are appended to (and replace any prior
   *                            parameter section of) the hash fragment instead of the search part.
   * @param queryParamSeparator - Token used to delimit the routing portion of the hash from
   *                              the parameter string (commonly '?', but may be a custom separator).
   */
  private applyParamsToUrl(
    url: URL,
    params: Record<string, any>,
    hashRoutingActive: boolean,
    queryParamSeparator: string
  ): void {
    if (hashRoutingActive) {
      const queryParamIndex = location.hash.indexOf(queryParamSeparator);
      if (queryParamIndex !== -1) {
        url.hash = url.hash.slice(0, queryParamIndex);
      }
      url.hash = `${url.hash}${queryParamSeparator}${RoutingHelpers.encodeParams(params)}`;
    } else {
      url.search = `?${RoutingHelpers.encodeParams(params)}`;
    }
  }

  /**
   * Normalizes the current URL when navigating to the same base path while (re)opening
   * a modal and adjusts the browser history so that the underlying (non‑modal) route
   * remains in the history stack.
   *
   * Behavior:
   * 1. Clones the provided URL into a mutable `cleanUrl`.
   * 2. If hash-based routing is active:
   *    - Strips any existing query segment from the hash (everything after '?').
   *    - Re-attaches sanitized query parameters (without modal data) if provided.
   * 3. If hash-based routing is not active:
   *    - Replaces the search/query string with the sanitized parameters.
   * 4. Calls `history.replaceState` to rewrite the current history entry to the
   *    cleaned (base) URL (without modal-specific parameters).
   * 5. Calls `history.pushState` to add a new entry representing the full URL
   *    (including modal data), so that a subsequent back navigation will close
   *    the modal while staying on the same base path.
   *
   *
   * @param url The full current URL (including modal-related parameters) to be preserved in the new history entry.
   * @param urlWithoutModalData A sanitized query/hash parameter string with modal data removed; used to form the base URL.
   * @param hashRoutingActive Whether the application uses hash-based routing (affects whether `hash` or `search` is manipulated).
   * @param historyState Arbitrary state object to associate with the new history entry created by `pushState`.
   * @returns void
   */
  private handleSameModalPath(
    url: URL,
    urlWithoutModalData: string,
    hashRoutingActive: boolean,
    historyState: any
  ): void {
    const cleanUrl = new URL(url.toString());

    if (hashRoutingActive) {
      const path = cleanUrl.hash.split('?')[0];
      cleanUrl.hash = path;
      if (urlWithoutModalData) {
        cleanUrl.hash += '?' + urlWithoutModalData;
      }
    } else {
      cleanUrl.search = urlWithoutModalData;
    }

    history.replaceState({}, '', cleanUrl.href);
    history.pushState(historyState, '', url.href);
  }

  /**
   * Remove modal data from url
   * @param isClosedInternal flag if the modal is closed via close button or internal back navigation instead of changing browser URL manually or browser back button
   */
  removeModalDataFromUrl(isClosedInternal: boolean): void {
    const params = RoutingHelpers.getQueryParams(this.luigi);
    const modalParamName = RoutingHelpers.getModalViewParamName(this.luigi);
    let url = new URL(location.href);
    const hashRoutingActive = this.luigi.getConfigValue('routing.useHashRouting');
    if (hashRoutingActive) {
      url = RoutingHelpers.removeModalDataFromHash(url, params, modalParamName);
    } else {
      url = RoutingHelpers.removeModalDataFromSearch(url, modalParamName);
    }
    // only if close modal [X] is pressed or closed via api
    if (history.state && history.state.modalHistoryLength >= 0 && isClosedInternal) {
      this.handleHistoryNavigationOnInternalModalClose();
    } else {
      history.pushState({}, '', url.href);
    }
  }

  /**
   * Handles browser history normalization when an "internal" modal (a modal that injected
   * intermediate history entries) is closed.
   *
   * This method attempts to return the application to the URL (path) that existed before
   * the modal workflow began, removing any modal-specific history entries without causing
   * an unintended re-opening of the modal or leaving stale modal query/hash fragments.
   *
   * How it works (high level):
   * 1. Reads the original path from history.state.pathBeforeHistory (expected to be set
   *    when the modal was opened).
   * 2. Registers a one–time popstate listener. That listener:
   *    - Normalizes the URL back to the original path (replaceState + pushState) and then
   *      triggers a back navigation to realign the history stack.
   *    - Uses a guard (isModalHistoryHigherThanHistoryLength) to choose between two
   *      cleanup strategies depending on how many entries the modal added vs. existing
   *      history length.
   * 3. Decides how far to go back using history.go():
   *    - If history.state.historygap equals history.length - history.state.modalHistoryLength,
   *      it jumps back exactly modalHistoryLength entries.
   *    - If modalHistoryLength is greater than the current history length (overflow case),
   *      it navigates back as far as possible (length - 1), sets a flag
   *      (luigi.preventLoadingModalData) to prevent reprocessing modal state, and lets the
   *      popstate handler reconstruct a clean stack.
   *    - Otherwise it simply goes back modalHistoryLength entries.
   *
   * Special state fields expected on history.state:
   * - pathBeforeHistory: string; the original URL before the modal sequence began.
   * - modalHistoryLength: number; how many history entries were created while the modal was active.
   * - historygap: number; a calculated gap used to determine a precise rewind scenario.
   *
   *
   * Returns:
   * - void (controls navigation via side effects).
   */
  private handleHistoryNavigationOnInternalModalClose(): void {
    const path = history.state.pathBeforeHistory;
    let isModalHistoryHigherThanHistoryLength = false;
    window.addEventListener(
      'popstate',
      (e) => {
        if (isModalHistoryHigherThanHistoryLength) {
          //replace the url with saved path and get rid of modal data in url
          history.replaceState({}, '', path);
          //reset history.length
          history.pushState({}, '', path);
          //apply history back is working
          history.back();
        } else {
          history.pushState({}, '', path);
          history.back();
        }
      },
      { once: true }
    );

    if (history.state.historygap === history.length - history.state.modalHistoryLength) {
      history.go(-history.state.modalHistoryLength);
    } else {
      if (history.state.modalHistoryLength > history.length) {
        const historyMaxBack = history.length - 1;
        isModalHistoryHigherThanHistoryLength = true;
        history.go(-historyMaxBack);
        //flag to prevent to run handleRouteChange when url has modalData in path
        //otherwise modal will be opened again
        this.luigi.preventLoadingModalData = true;
      } else {
        const modalHistoryLength = history.state.modalHistoryLength;
        history.go(-modalHistoryLength);
      }
    }
  }

  
  
  /**
   * Closes all currently open modals in the Luigi application.
   *
   * If the configuration flag `routing.showModalPathInUrl` is enabled, this method
   * first strips any modal-related data (such as modal path segments or parameters)
   * from the current URL without triggering a navigation update (silent removal),
   * ensuring the URL reflects that no modals are active.
   * @public
   * @returns void
   */
  closeModals(): void {
    if (this.luigi.getConfigValue('routing.showModalPathInUrl')) {
      this.removeModalDataFromUrl(false);
    }
    this.luigi.getEngine()._connector?.closeModals();
  }
}
