import type { LuigiCompoundContainer, LuigiContainer } from '@luigi-project/container';
import type { FeatureToggles } from '../core-api/feature-toggles';
import type { Luigi } from '../core-api/luigi';
import { UIModule } from '../modules/ui-module';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import type { ModalSettings, Node, PathData } from './navigation.service';
import { NavigationService } from './navigation.service';
import { NodeDataManagementService } from './node-data-management.service';
import { serviceRegistry } from './service-registry';
import { ModalService } from './modal.service';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';

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
  modalSettings?: ModalSettings;
  previousPathData?: PathData;

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
        const preventContextUpdate = !!(ev as any)?.detail?.preventContextUpdate;
        const withoutSync = !!(ev as any)?.detail?.withoutSync;

        this.handleRouteChange(RoutingHelpers.getCurrentPath(true), withoutSync, preventContextUpdate);
      });
      this.handleRouteChange(RoutingHelpers.getCurrentPath(true));
    } else {
      window.addEventListener('popstate', (ev) => {
        const preventContextUpdate = !!(ev as any)?.detail?.preventContextUpdate;
        const withoutSync = !!(ev as any)?.detail?.withoutSync;

        this.handleRouteChange(RoutingHelpers.getCurrentPath(), withoutSync, preventContextUpdate);
      });
      this.handleRouteChange(RoutingHelpers.getCurrentPath());
    }
  }

  /**
   * Deal with route changing scenario.
   * @param {Object} routeInfo - the information about path and query
   * @param {boolean} withoutSync - disables the navigation handling for a single navigation request
   * @param {boolean} preventContextUpdate - make no context update being triggered
   * @returns {Promise<void>} A promise that resolves when route change is complete.
   */
  async handleRouteChange(
    routeInfo: { path: string; query: string },
    withoutSync = false,
    preventContextUpdate = false
  ): Promise<void> {
    const path = routeInfo.path;
    const query = routeInfo.query;
    const fullPath = path + (query ? '?' + query : '');
    const urlSearchParams = new URLSearchParams(query);
    const paramsObj: Record<string, string> = {};

    if (this.shouldSkipRoutingForUrlPatterns()) {
      return;
    }

    this.setFeatureToggle(fullPath);
    await this.shouldShowModalPathInUrl(routeInfo);

    urlSearchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });
    this.checkInvalidateCache(this.previousPathData, path);

    const pathData = await this.getNavigationService().getPathData(path);

    this.previousPathData = pathData;

    const nodeParams = RoutingHelpers.filterNodeParams(paramsObj, this.luigi);
    const redirect = await this.getNavigationService().shouldRedirect(path, pathData);
    const pathUrlRaw = GenericHelpers.getPathWithoutHash(path);

    if (redirect) {
      this.luigi.navigation().navigate(redirect);
      return;
    }

    this.currentRoute = {
      raw: window.location.href,
      path,
      nodeParams
    };

    const currentNode = pathData?.selectedNode ?? (await this.getNavigationService().getCurrentNode(path));
    const viewUrl = currentNode?.viewUrl || '';

    if (await this.handlePageNotFound(currentNode, viewUrl, pathData, path, pathUrlRaw)) {
      return;
    }

    this.luigi.getEngine()._connector?.renderTopNav(await this.getNavigationService().getTopNavData(path, pathData));
    this.luigi.getEngine()._connector?.renderLeftNav(await this.getNavigationService().getLeftNavData(path, pathData));
    this.luigi.getEngine()._connector?.renderTabNav(await this.getNavigationService().getTabNavData(path, pathData));

    if (currentNode) {
      this.currentRoute.node = currentNode;
      currentNode.nodeParams = nodeParams || {};
      currentNode.pathParams = pathData?.pathParams || {};
      currentNode.searchParams = RoutingHelpers.prepareSearchParamsForClient(currentNode, this.luigi);

      this.getNavigationService().onNodeChange(this.previousNode, currentNode);
      this.previousNode = currentNode;

      UIModule.updateMainContent(currentNode, this.luigi, withoutSync, preventContextUpdate);
    }
  }

  getCurrentRoute(): Route | undefined {
    return this.currentRoute;
  }

  /**
   * If `showModalPathInUrl` is provided, bookmarkable modal path will be triggered.
   */
  async shouldShowModalPathInUrl(routeInfo: { path: string; query: string }): Promise<void> {
    if (this.luigi.getConfigValue('routing.showModalPathInUrl')) {
      await this.handleBookmarkableModalPath(routeInfo);
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
  async handleBookmarkableModalPath(routeInfo: { path: string; query: string }): Promise<void> {
    const navService = serviceRegistry.get(NavigationService);
    const modalService = serviceRegistry.get(ModalService);
    const urlSearchParams = new URLSearchParams(routeInfo?.query || '');
    const modalViewParamName = RoutingHelpers.getModalViewParamName(this.luigi);
    const modalPath = urlSearchParams.get(modalViewParamName);

    if (!modalPath) {
      modalService.closeModals();
      return;
    } else {
      const modalSettings = urlSearchParams.get(`${modalViewParamName}Params`);
      try {
        const modalSettingsObj = JSON.parse(modalSettings || '{}');
        const { nodeObject } = await navService.extractDataFromPath(modalPath);
        const modalContainer: LuigiContainer | LuigiCompoundContainer | null =
          document.querySelector('.lui-modal luigi-container');
        if (modalContainer) {
          this.luigi.getEngine()._connector?.updateModalSettings(modalSettingsObj);
        } else {
          this.luigi.navigation().openAsModal(modalPath, modalSettingsObj || nodeObject.openNodeInModal);
        }
      } catch (e) {
        console.error('Error parsing modal settings from URL parameters', e);
      }
    }
  }

  /**
   * Append modal data to url
   * @param {string} modalPath path of the view which is displayed in the modal
   * @param {Object} modalParams query parameter
   */
  appendModalDataToUrl(modalPath: string, modalParams: ModalSettings): void {
    // global setting for persistence in url .. default false
    const queryParamSeparator = RoutingHelpers.getHashQueryParamSeparator();
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
      let modalParamsObj: any = {};
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
          window.Luigi.preventLoadingModalData = true;
        } else {
          const modalHistoryLength = history.state.modalHistoryLength;
          history.go(-modalHistoryLength);
        }
      }
    } else {
      history.pushState({}, '', url.href);
    }
  }

  /**
   * Set feature toggles if `queryStringParam` is provided at config file
   * @param {string} path used for retrieving and appending the path parameters
   */
  setFeatureToggle(path: string): void {
    const featureToggleProperty = this.luigi.getConfigValue('settings.featureToggles.queryStringParam');
    const featureToggles: FeatureToggles = this.luigi.featureToggles();

    if (featureToggleProperty && typeof path === 'string') {
      RoutingHelpers.setFeatureToggles(featureToggleProperty, path, featureToggles);
    }
  }

  /**
   * Updates the current browser URL with modal-related routing information.
   *
   * Depending on the routing configuration (hash vs. standard), this method
   * injects or updates two query parameters:
   * - <modalParamName>: the modal's path identifier (modalPath)
   * - <modalParamName>Params: a JSON-stringified object of additional modal parameters (modalParams)
   *
   * Behavior:
   * - Determines the parameter base name via RoutingHelpers.getModalViewParamName.
   * - Merges existing query parameters obtained through RoutingHelpers.getQueryParams, overwriting any previous modal values.
   * - If hash routing is enabled (routing.useHashRouting = true):
   *   - Strips any existing query segment after the hash before appending the new encoded parameters.
   *   - Rebuilds the hash in the form: #<hashBase><separator><encodedParams>.
   * - If hash routing is disabled:
   *   - Replaces the entire search string (?...) with the newly encoded parameters.
   * - Serializes modalParams only when it is a non-empty object; otherwise omits the "*Params" companion parameter.
   * - Uses history.pushState when addHistoryEntry is true, otherwise history.replaceState to avoid adding a new history entry.
   *
   * @param modalPath A string identifying the modal view or route segment to encode into the URL.
   * @param modalParams A record of additional parameters for the modal; only included if non-empty. Serialized via JSON.stringify.
   * @param addHistoryEntry If true, a new history entry is pushed (allowing back navigation); if false, the current entry is replaced.

   */
  updateModalDataInUrl(modalPath: string, modalParams: ModalSettings, addHistoryEntry: boolean): void {
    let queryParamSeparator = RoutingHelpers.getHashQueryParamSeparator();
    const params = RoutingHelpers.getQueryParams(this.luigi);
    const modalParamName = RoutingHelpers.getModalViewParamName(this.luigi);

    params[modalParamName] = modalPath;
    if (modalParams && Object.keys(modalParams).length) {
      params[`${modalParamName}Params`] = JSON.stringify(modalParams);
    }
    const url = new URL(location.href);
    const hashRoutingActive = this.luigi.getConfigValue('routing.useHashRouting');
    if (hashRoutingActive) {
      const queryParamIndex = location.hash.indexOf(queryParamSeparator);
      if (queryParamIndex !== -1) {
        url.hash = url.hash.slice(0, queryParamIndex);
      }
      url.hash = `${url.hash}${queryParamSeparator}${RoutingHelpers.encodeParams(params)}`;
    } else {
      url.search = `?${RoutingHelpers.encodeParams(params)}`;
    }

    if (!addHistoryEntry) {
      history.replaceState((window as any).state, '', url.href);
    } else {
      history.pushState((window as any).state, '', url.href);
    }
  }

  checkInvalidateCache(previousPathData: PathData | undefined, newPath: string): void {
    if (!previousPathData) return;
    const nodeDataManagementService = serviceRegistry.get(NodeDataManagementService);
    let newPathArray = newPath.split('/');
    if (previousPathData.nodesInPath && previousPathData.nodesInPath.length > 0) {
      let previousNavPathWithoutRoot = previousPathData.nodesInPath.slice(1);

      let isSamePath = true;
      for (let i = 0; i < previousNavPathWithoutRoot.length; i++) {
        let newPathSegment = newPathArray.length > i ? newPathArray[i] : undefined;
        let previousPathNode = previousNavPathWithoutRoot[i];

        if (newPathSegment !== previousPathNode.pathSegment || !isSamePath) {
          if (RoutingHelpers.isDynamicNode(previousPathNode)) {
            if (
              !isSamePath ||
              newPathSegment !== RoutingHelpers.getDynamicNodeValue(previousPathNode, previousPathData.pathParams)
            ) {
              nodeDataManagementService.deleteNodesRecursively(previousPathNode);
              break;
            }
          } else {
            isSamePath = false;
          }
        }
      }
    } else {
      // If previous component data can't be determined, clear cache to avoid conflicts with dynamic nodes
      nodeDataManagementService.deleteCache();
    }
  }

  /**
   * Deal with page not found scenario.
   * @param {Object} nodeObject - the data of node
   * @param {string} viewUrl - the url of the current mf view
   * @param {Object} pathData - the information of current path
   * @param {string} path - the path of the view to open
   * @param {string} pathUrlRaw - path url without hash
   * @returns {Promise<boolean>} A promise that resolves when page not found handling is complete.
   */
  async handlePageNotFound(
    nodeObject: any,
    viewUrl: string,
    pathData: PathData,
    path: string,
    pathUrlRaw: string
  ): Promise<boolean> {
    if ((!viewUrl && !nodeObject?.compound) || nodeObject?.tabNav?.showAsTabHeader) {
      const defaultChildNode = await RoutingHelpers.getDefaultChildNode(pathData, async (node, ctx) => {
        return await this.getNavigationService().getChildren(node, ctx);
      });

      if (pathData?.isExistingRoute) {
        // normal navigation can be performed
        const trimmedPathUrl = GenericHelpers.getTrimmedUrl(path);

        this.getNavigationService().handleNavigationRequest({
          path: `${trimmedPathUrl ? `/${trimmedPathUrl}` : ''}/${defaultChildNode}`,
          preserveView: undefined,
          modalSettings: undefined,
          newTab: false,
          withoutSync: false,
          preventContextUpdate: false,
          preventHistoryEntry: true
        });

        return false;
      } else {
        if (defaultChildNode && pathData?.nodesInPath && pathData.nodesInPath.length > 1) {
          // last path segment was invalid but a default node could be in its place
          this.showPageNotFoundError(
            GenericHelpers.trimTrailingSlash(pathData.matchedPath || '') + '/' + defaultChildNode,
            pathUrlRaw,
            true
          );

          return true;
        }

        // ERROR 404
        // the path is unrecognized at all and cannot be fitted to any known one
        const rootPath = await RoutingHelpers.getDefaultChildNode(pathData);

        this.showPageNotFoundError(rootPath, pathUrlRaw, false);
      }

      return true;
    }

    if (!pathData?.isExistingRoute) {
      this.showPageNotFoundError(pathData.matchedPath || '', pathUrlRaw, true);

      return true;
    }

    return false;
  }

  async showPageNotFoundError(pathToRedirect: string, notFoundPath: string, isAnyPathMatched = false): Promise<void> {
    const redirectResult: any = RoutingHelpers.getPageNotFoundRedirectResult(
      notFoundPath,
      isAnyPathMatched,
      this.luigi
    );

    if (redirectResult.ignoreLuigiErrorHandling) {
      return;
    }

    const redirectPathFromNotFoundHandler = redirectResult.path;

    if (redirectPathFromNotFoundHandler) {
      if (redirectResult.keepURL) {
        const hashRouting = this.luigi.getConfig().routing?.useHashRouting;
        const currentPath = RoutingHelpers.getCurrentPath(hashRouting);

        currentPath.path = redirectPathFromNotFoundHandler;

        this.handleRouteChange(currentPath);
      } else {
        this.getNavigationService().handleNavigationRequest({ path: redirectPathFromNotFoundHandler });
      }

      return;
    }

    // TODO RoutingHelpers.showRouteNotFoundAlert(notFoundPath, isAnyPathMatched);
    this.getNavigationService().handleNavigationRequest({ path: GenericHelpers.addLeadingSlash(pathToRedirect) });
  }
}
