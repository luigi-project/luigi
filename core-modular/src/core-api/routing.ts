import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import type { Luigi } from './luigi';

export class Routing {
  luigi: Luigi;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
  }

  /**
   * Adds or updates search parameters in the current URL.
   *
   * Depending on the routing configuration, this method will either update the hash fragment
   * or the standard search parameters of the URL. It also manages browser history based on the
   * `keepBrowserHistory` flag.
   *
   * @param params - An object containing key-value pairs to be added as search parameters.
   * @param keepBrowserHistory - If `true`, a new entry is added to the browser's history; otherwise, the current entry is replaced. Defaults to `false`.
   */
  addSearchParams(params: object, keepBrowserHistory: boolean = false): void {
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
  getSearchParams(): object {
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

  /**
   * Updates the browser's history stack with the provided URL.
   *
   * Depending on the `keepBrowserHistory` flag, this method either pushes a new entry
   * onto the browser's history stack or replaces the current entry. The URL is sanitized
   * before being used. If the sanitized URL is invalid, a warning is logged and no action is taken.
   *
   * @param keepBrowserHistory - If `true`, a new history entry is pushed; if `false`, the current entry is replaced.
   * @param url - The URL object to be used for updating the browser history.
   */
  handleBrowserHistory(keepBrowserHistory: boolean, url: URL): void {
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

  /**
   * Sanitizes a given URL by ensuring it shares the same origin as the current page.
   *
   * @param url - The URL to be sanitized.
   * @returns The original URL if it has the same origin as the current location; otherwise, returns `undefined`.
   */
  sanitizeUrl(url: string): string | undefined {
    return new URL(location.href).origin === new URL(url).origin ? url : undefined;
  }

  addNodeParams(params: Record<string, any>, keepBrowserHistory: boolean ): void {
      if (!GenericHelpers.isObject(params)) {
        console.log('Params argument must be an object');
        return;
      }
  
      const paramPrefix = RoutingHelpers.getContentViewParamPrefix(this.luigi);
      const url = new URL(location.href);
      if (this.luigi.getConfigValue('routing.useHashRouting')) {
        url.hash = RoutingHelpers.addParamsOnHashRouting(params, url.hash, paramPrefix);
      } else {
        RoutingHelpers.modifySearchParams(params, url.searchParams, paramPrefix);
      }
  
      this.handleBrowserHistory(keepBrowserHistory, url);
      // TODO
      //this.luigi.configChanged();
    }
}
