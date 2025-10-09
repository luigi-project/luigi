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
    let pathWithoutModalData;
    let urlWithoutModalData;
    if (hashRoutingActive) {
      let [path, searchParams] = url.hash.split('?');
      pathWithoutModalData = path;
      urlWithoutModalData = RoutingHelpers.getURLWithoutModalData(searchParams, modalParamName);
      if (urlWithoutModalData) {
        pathWithoutModalData += '?' + urlWithoutModalData;
      }
    } else {
      pathWithoutModalData = url.pathname;
      urlWithoutModalData = RoutingHelpers.getURLWithoutModalData(url.search, modalParamName);
      if (urlWithoutModalData) {
        pathWithoutModalData += '?' + RoutingHelpers.getURLWithoutModalData(url.search, modalParamName);
      }
    }
    historyState = RoutingHelpers.handleHistoryState(historyState, pathWithoutModalData);
    if (prevModalPath !== modalPath) {
      params[modalParamName] = modalPath;
      if (modalParams && Object.keys(modalParams).length) {
        params[`${modalParamName}Params`] = JSON.stringify(modalParams);
      }
      if (hashRoutingActive) {
        const queryParamIndex = location.hash.indexOf(queryParamSeparator);
        if (queryParamIndex !== -1) {
          url.hash = url.hash.slice(0, queryParamIndex);
        }
        url.hash = `${url.hash}${queryParamSeparator}${RoutingHelpers.encodeParams(params)}`;
      } else {
        url.search = `?${RoutingHelpers.encodeParams(params)}`;
      }
      history.pushState(historyState, '', url.href);
    } else {
      const cleanUrl = new URL(url);
      if (hashRoutingActive) {
        let path = cleanUrl.hash.split('?')[0];
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
      let modalParamsObj: Record<string, string> = {};
      if (params[modalParamName]) {
        modalParamsObj[modalParamName] = params[modalParamName];
      }
      if (params[`${modalParamName}Params`]) {
        modalParamsObj[`${modalParamName}Params`] = params[`${modalParamName}Params`];
      }
      let prevModalPath = RoutingHelpers.encodeParams(modalParamsObj);
      if (url.hash.includes(`?${prevModalPath}`)) {
        url.hash = url.hash.replace(`?${prevModalPath}`, '');
      } else if (url.hash.includes(`&${prevModalPath}`)) {
        url.hash = url.hash.replace(`&${prevModalPath}`, '');
      }
    } else {
      let searchParams = new URLSearchParams(url.search.slice(1));
      searchParams.delete(modalParamName);
      searchParams.delete(`${modalParamName}Params`);
      let finalUrl = '';
      Array.from(searchParams.keys()).forEach((searchParamKey) => {
        finalUrl += (finalUrl === '' ? '?' : '&') + searchParamKey + '=' + searchParams.get(searchParamKey);
      });
      url.search = finalUrl;
    }
    // only if close modal [X] is pressed or closed via api
    if (history.state && history.state.modalHistoryLength >= 0 && isClosedInternal) {
      const modalHistoryLength = history.state.modalHistoryLength;
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
    } else {
      history.pushState({}, '', url.href);
    }
  }
}
