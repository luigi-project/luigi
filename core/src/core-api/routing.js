import { LuigiConfig } from '.';
import { GenericHelpers, RoutingHelpers } from '../utilities/helpers';

/**
 * Use these functions for navigation-related features.
 * @name Routing
 * @class
 */
class LuigiRouting {
  /**
   * Get search parameter from URL as an object.
   * @memberof Routing
   * @since 1.16.1
   * @returns {Object}
   * @example
   * Luigi.routing().getSearchParams();
   */
  getSearchParams() {
    const queryParams = {};
    const DENYLIST = ['__proto__', 'constructor', 'prototype'];

    const url = new URL(location.href);
    let entries;

    if (LuigiConfig.getConfigValue('routing.useHashRouting')) {
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
   * Add search parameters to the URL.
   * If [hash routing](navigation-parameters-reference.md#usehashrouting) is enabled, the search parameters will be set after the hash.
   * In order to delete a search query param you can set the value of the param to undefined.
   * @memberof Routing
   * @since 1.16.1
   * @param {Object} params
   * @param {boolean} keepBrowserHistory
   * @example
   * Luigi.routing().addSearchParams({luigi:'rocks', mario:undefined}, false);
   */
  addSearchParams(params, keepBrowserHistory) {
    if (!GenericHelpers.isObject(params)) {
      console.log('Params argument must be an object');
      return;
    }
    const url = new URL(location);
    if (LuigiConfig.getConfigValue('routing.useHashRouting')) {
      url.hash = RoutingHelpers.addParamsOnHashRouting(params, url.hash);
    } else {
      RoutingHelpers.modifySearchParams(params, url.searchParams);
    }

    this.handleBrowserHistory(keepBrowserHistory, url);
    LuigiConfig.configChanged();
  }

  addNodeParams(params, keepBrowserHistory) {
    if (!GenericHelpers.isObject(params)) {
      console.log('Params argument must be an object');
      return;
    }

    const paramPrefix = RoutingHelpers.getContentViewParamPrefix();
    const url = new URL(location);
    if (LuigiConfig.getConfigValue('routing.useHashRouting')) {
      url.hash = RoutingHelpers.addParamsOnHashRouting(params, url.hash, paramPrefix);
    } else {
      RoutingHelpers.modifySearchParams(params, url.searchParams, paramPrefix);
    }

    this.handleBrowserHistory(keepBrowserHistory, url);
    LuigiConfig.configChanged();
  }

  sanitizeUrl(url) {
    return new URL(location).origin === new URL(url).origin ? url : undefined;
  }

  handleBrowserHistory(keepBrowserHistory, url) {
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

  getAnchor() {
    const { hash } = new URL(location);
    const useHashRouting = LuigiConfig.getConfigValue('routing.useHashRouting');

    return useHashRouting && hash.split('#').length === 2 ? '' : hash.split('#').pop();
  }

  setAnchor(value) {
    if (LuigiConfig.getConfigValue('routing.useHashRouting')) {
      const { hash } = new URL(location);
      const hashArray = hash.split('#');
      const hasExistingHash = hashArray.length > 2;
      const newHashArray = hasExistingHash ? hashArray.slice(0, -1) : hashArray;

      window.location.hash = [...newHashArray, value].join('#');
    } else {
      window.location.hash = value;
    }
  }
}

export const routing = new LuigiRouting();
