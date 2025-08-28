import type { Luigi } from "../core-api/luigi";
import { RoutingHelpers } from "../utilities/helpers/routing-helpers";
import { NavigationService } from "./navigation.service";
import { serviceRegistry } from "./service-registry";

export class RoutingService {

    constructor(private luigi: Luigi) { }

    handleRouteChange() {
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
                this.shouldShowModalPathInUrl();
                currentNode.searchParams = RoutingHelpers.prepareSearchParamsForClient(currentNode, this.luigi);
                this.luigi.getEngine()._connector?.renderTopNav(navService.getTopNavData(path));
                this.luigi.getEngine()._connector?.renderLeftNav(navService.getLeftNavData(path));
                this.luigi.getEngine()._connector?.renderTabNav(navService.getTabNavData(path));
                this.luigi.getEngine()._ui.updateMainContent(currentNode, this.luigi);
            });
            this.shouldShowModalPathInUrl();
        } else {
            // TBD
        }
    }

    /**
   * If `showModalPathInUrl` is provided, bookmarkable modal path will be triggered.
   */
    async shouldShowModalPathInUrl() {
        if (this.luigi.getConfigValue('routing.showModalPathInUrl')) {
            await this.handleBookmarkableModalPath();
        }
    }

    async handleBookmarkableModalPath() {
        const additionalModalPath = RoutingHelpers.getModalPathFromPath(this.luigi);
        const navService = serviceRegistry.get(NavigationService);
        if (additionalModalPath) {
            const modalParams = RoutingHelpers.getModalParamsFromPath(this.luigi);
            console.log('modalParams', modalParams);
            const { nodeObject } = await navService.extractDataFromPath(additionalModalPath);
            this.luigi.navigation().openAsModal(additionalModalPath, modalParams || nodeObject.openNodeInModal);
        }
    }

    /**
       * Append modal data to url
       * @param {string} modalPath path of the view which is displayed in the modal
       * @param {Object} modalParams query parameter
       */
    appendModalDataToUrl(modalPath: string, modalParams: object) {
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
    removeModalDataFromUrl(isClosedInternal: boolean) {
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
