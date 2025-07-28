import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import type { Luigi } from './luigi';

export class Routing {
    luigi: Luigi;

    constructor(luigi: Luigi) {
        this.luigi = luigi;
    }

    addSearchParams(params: object, keepBrowserHistory: boolean = false) {
        if (!GenericHelpers.isObject(params)) {
            console.log('Params argument must be an object');
            return;
        }
        const url = new URL(location.href);
        if (this.luigi.getConfigValue('routing.useHashRouting')) {
            url.hash = RoutingHelpers.addParamsOnHashRouting(params, url.hash);
        } else {
            RoutingHelpers.modifySearchParams(params, url.searchParams);
        }

        this.handleBrowserHistory(keepBrowserHistory, url);
        // TODO: LuigiConfig.configChanged();
    }

    /**
   * Get search parameter from URL as an object.
   * @memberof Routing
   * @returns {Object}
   * @example
   * Luigi.routing().getSearchParams();
   */
    getSearchParams() {
        const queryParams: Record<string, string> = {};
        const DENYLIST = ['__proto__', 'constructor', 'prototype'];

        const url = new URL(location.href);
        let entries;

        if (this.luigi.getConfigValue('routing.useHashRouting')) {
            const hashQuery = url.hash.split('?')[1];
            entries = hashQuery ? new URLSearchParams(hashQuery).entries() : [];
        } else {
            entries = url.searchParams.entries();
        }

        for (const [key, value] of entries) {
            if (DENYLIST.some((denied) => key === denied)) {
                console.warn(`Blocked because of potentially dangerous query param: ${key}`);
                continue;
            }
            queryParams[key] = value;
        }
        return queryParams;
    }

    handleBrowserHistory(keepBrowserHistory: boolean, url: URL) {
        const href = this.sanitizeUrl(url.href);

        if (!href) {
            console.warn('invalid url: ' + href);
            return;
        }

        if (keepBrowserHistory) {
            window.history.pushState({}, '', href);
        } else {
            window.history.replaceState({}, '', href);
        }
    }

    sanitizeUrl(url: string) {
        return new URL(location.href).origin === new URL(url).origin ? url : undefined;
    }
}