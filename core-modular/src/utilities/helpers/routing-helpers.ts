import type { FeatureToggles } from '../../core-api/feature-toggles';
import type { Luigi } from '../../core-api/luigi';
import type { Node, PathData } from '../../services/navigation.service';
import { EscapingHelpers } from './escaping-helpers';
import { GenericHelpers } from './generic-helpers';
import { NavigationHelpers } from './navigation-helpers';

export const RoutingHelpers = {
  defaultContentViewParamPrefix: '~',
  defaultQueryParamSeparator: '?',
  defaultModalViewParamName: 'modal',

  /**
   * Adds or updates query parameters to a hash-based routing string.
   *
   * @param params - An object representing the parameters to add or update in the hash's query string.
   * @param hash - The hash string (e.g., "#/path?foo=bar") to which the parameters will be added or updated.
   * @param paramPrefix - (Optional) A prefix to apply to each parameter key when adding or updating.
   * @returns The updated hash string with the new or modified query parameters.
   */
  addParamsOnHashRouting(params: Record<string, any>, hash: string, paramPrefix?: string): string {
    let localhash = hash;
    const [hashValue, givenQueryParamsString] = localhash.split('?');
    const searchParams = new URLSearchParams(givenQueryParamsString);
    this.modifySearchParams(params, searchParams, paramPrefix);
    localhash = hashValue;
    if (searchParams.toString() !== '') {
      localhash += `?${searchParams.toString()}`;
    }
    return localhash;
  },

  /**
   * Modifies the given `URLSearchParams` object by setting or deleting parameters based on the provided `params` object.
   *
   * For each key-value pair in `params`, the function sets the corresponding parameter in `searchParams`.
   * If a `paramPrefix` is provided, it is prepended to each parameter key.
   * If a value in `params` is `undefined`, the corresponding parameter is deleted from `searchParams`.
   *
   * @param params - An object containing key-value pairs to set or delete in the search parameters.
   * @param searchParams - The `URLSearchParams` instance to modify.
   * @param paramPrefix - (Optional) A string to prefix to each parameter key.
   */
  modifySearchParams(params: Record<string, any>, searchParams: URLSearchParams, paramPrefix?: string): void {
    for (const [key, value] of Object.entries(params)) {
      const paramKey = paramPrefix ? `${paramPrefix}${key}` : key;

      searchParams.set(paramKey, value);
      if (value === undefined) {
        searchParams.delete(paramKey);
      }
    }
  },

  /**
   * Extracts and sanitizes node-specific parameters from the provided params object.
   *
   * This method filters the input `params` to include only those keys that start with
   * a specific prefix, determined by `getContentViewParamPrefix(luigi)`. The prefix is
   * removed from the key names in the resulting object. The resulting map is then
   * sanitized before being returned.
   *
   * @param params - An object containing key-value pairs of parameters.
   * @param luigi - The Luigi instance used to determine the parameter prefix.
   * @returns A sanitized map of node-specific parameters with the prefix removed from their keys.
   */
  filterNodeParams(params: Record<string, string>, luigi: Luigi): Record<string, string> {
    const result: Record<string, string> = {};
    const paramPrefix = this.getContentViewParamPrefix(luigi);
    if (params) {
      Object.entries(params).forEach((entry) => {
        if (entry[0].startsWith(paramPrefix)) {
          const paramName = entry[0].substr(paramPrefix.length);
          result[paramName] = entry[1];
        }
      });
    }
    return this.sanitizeParamsMap(result);
  },

  /**
   * Retrieves the content view parameter prefix from the Luigi configuration.
   *
   * This method attempts to obtain the prefix value from the Luigi configuration using the key
   * `'routing.nodeParamPrefix'`. If the configuration value is explicitly set to `false`, it returns
   * an empty string. If the value is not set or is falsy, it falls back to the default content view
   * parameter prefix defined in the class.
   *
   * @param luigi - The Luigi instance used to access configuration values.
   * @returns The content view parameter prefix as a string.
   */
  getContentViewParamPrefix(luigi: Luigi): any {
    let prefix = luigi?.getConfigValue('routing.nodeParamPrefix');
    if (prefix === false) {
      prefix = '';
    } else if (!prefix) {
      prefix = this.defaultContentViewParamPrefix;
    }
    return prefix;
  },

  /**
   * Sanitizes the keys and values of a parameter map by applying the `EscapingHelpers.sanitizeParam` function
   * to each key-value pair. Returns a new object with sanitized keys and values.
   *
   * @param paramsMap - An object containing string keys and values to be sanitized.
   * @returns A new object with both keys and values sanitized.
   */
  sanitizeParamsMap(paramsMap: Record<string, string>): Record<string, string> {
    return Object.entries(paramsMap).reduce(
      (sanitizedMap: Record<string, string>, paramPair) => {
        sanitizedMap[EscapingHelpers.sanitizeParam(paramPair[0])] = EscapingHelpers.sanitizeParam(paramPair[1]);
        return sanitizedMap;
      },
      {} as Record<string, string>
    );
  },

  /**
   * Prepares and filters the search parameters from the Luigi routing context
   * based on the current node's client permissions. Only parameters explicitly
   * allowed with `read: true` in the node's `clientPermissions.urlParameters`
   * are included in the returned object.
   *
   * @param currentNode - The current navigation node containing client permissions.
   * @param luigi - The Luigi instance providing access to routing and search parameters.
   * @returns An object containing only the permitted search parameters for the client.
   */
  prepareSearchParamsForClient(currentNode: Node, luigi: Luigi): {} {
    const filteredObj: Record<string, any> = {};
    if (currentNode && currentNode.clientPermissions && currentNode.clientPermissions.urlParameters) {
      Object.keys(currentNode.clientPermissions.urlParameters).forEach((key) => {
        if (
          key in luigi.routing().getSearchParams() &&
          currentNode.clientPermissions?.urlParameters &&
          currentNode.clientPermissions.urlParameters[key]?.read === true
        ) {
          filteredObj[key] = (luigi.routing().getSearchParams() as Record<string, any>)[key];
        }
      });
    }
    return filteredObj;
  },

  /**
   * Retrieves the current path and query string from the browser's location hash.
   *
   * @returns An object containing the normalized path and the query string.
   * @remarks
   * - The path is normalized using `NavigationHelpers.normalizePath`.
   * - The query string is extracted from the portion after the '?' in the hash.
   * - If there is no query string, `query` will be `undefined`.
   */
  getCurrentPath(hashRouting?: boolean): { path: string; query: string } {
    //TODO intentNavigation implementation
    if (hashRouting) {
      const pathRaw = NavigationHelpers.normalizePath(location.hash);
      const [path, query] = pathRaw.split('?');
      return { path, query };
    } else {
      return { path: NavigationHelpers.normalizePath(location.pathname), query: location.search };
    }
  },

  /**
   * Retrieves the modal path from the current URL's query parameters based on the provided Luigi instance.
   *
   * @param luigi - The Luigi instance used to determine the query parameter name and value.
   * @returns The modal path as a string if present in the query parameters; otherwise, `undefined`.
   */
  getModalPathFromPath(luigi: Luigi): string | undefined {
    return this.getQueryParam(this.getModalViewParamName(luigi), luigi);
  },

  /**
   * Retrieves the value of a specific query parameter from the current URL.
   *
   * @param paramName - The name of the query parameter to retrieve.
   * @param luigi - The Luigi instance used to access routing information.
   * @returns The value of the specified query parameter if present; otherwise, `undefined`.
   */
  getQueryParam(paramName: string, luigi: Luigi): string | undefined {
    return this.getQueryParams(luigi)[paramName];
  },

  /**
   * Retrieves the current query parameters from the URL as a key-value record.
   *
   * Depending on the Luigi configuration, this method will extract query parameters
   * either from the URL hash (if hash routing is enabled) or from the standard search
   * portion of the URL.
   *
   * @param luigi - The Luigi instance used to access configuration values.
   * @returns A record containing query parameter names and their corresponding values.
   */
  getQueryParams(luigi: Luigi): Record<string, string> {
    const hashRoutingActive = luigi.getConfigValue('routing.useHashRouting');
    return hashRoutingActive ? this.getLocationHashQueryParams() : this.getLocationSearchQueryParams();
  },

  /**
   * Retrieves the query parameters from the current location's search string as a key-value map.
   *
   * @returns {Record<string, string>} An object containing the query parameters as key-value pairs.
   * If there are no query parameters, returns an empty object.
   */
  getLocationSearchQueryParams(): Record<string, string> {
    return RoutingHelpers.getLocation().search
      ? RoutingHelpers.parseParams(RoutingHelpers.getLocation().search.slice(1))
      : {};
  },

  /**
   * Returns the current browser location object.
   *
   * @returns {Location} The current location object representing the URL of the document.
   */
  getLocation(): Location {
    return location;
  },

  /**
   * Extracts and parses query parameters from the current location's hash fragment.
   *
   * @returns {Record<string, string>} An object containing key-value pairs of query parameters
   * extracted from the hash, or an empty object if no query parameters are present.
   */
  getLocationHashQueryParams(): Record<string, string> {
    const queryParamIndex = RoutingHelpers.getLocation().hash.indexOf(this.defaultQueryParamSeparator);
    return queryParamIndex !== -1
      ? RoutingHelpers.parseParams(RoutingHelpers.getLocation().hash.slice(queryParamIndex + 1))
      : {};
  },

  /**
   * Retrieves the name of the URL parameter used for modal views in routing.
   *
   * This method attempts to obtain the parameter name from the Luigi configuration
   * using the key `'routing.modalPathParam'`. If the configuration value is not set,
   * it falls back to a default parameter name defined by `this.defaultModalViewParamName`.
   *
   * @param luigi - The Luigi instance used to access configuration values.
   * @returns The name of the modal view parameter to be used in routing.
   */
  getModalViewParamName(luigi: Luigi): string {
    let paramName = luigi.getConfigValue('routing.modalPathParam');
    if (!paramName) {
      paramName = this.defaultModalViewParamName;
    }
    return paramName;
  },

  /**
   * Parses a URL query parameter string into an object mapping parameter names to values.
   *
   * Replaces '+' with spaces, splits the string by '&' to get key-value pairs,
   * and decodes each component using `decodeURIComponent`.
   *
   * @param paramsString - The URL query parameter string to parse (e.g., "foo=bar&baz=qux").
   * @returns An object where each key is a parameter name and each value is the corresponding decoded value.
   */
  parseParams(paramsString: string): Record<string, string> {
    const params = new URLSearchParams(paramsString);

    const result = new Map<string, string>();

    for (const [key, value] of params.entries()) {
      result.set(key, value);
    }

    return Object.fromEntries(result);
  },

  getModalParamsFromPath(luigi: Luigi): any {
    const modalParamsStr = this.getQueryParam(`${this.getModalViewParamName(luigi)}Params`, luigi);
    return modalParamsStr && JSON.parse(modalParamsStr);
  },

  /**
   * Get the query param separator which is used with hashRouting
   * Default: :
   * @example /home?modal=(urlencoded)/some-modal?modalParams=(urlencoded){...}&otherParam=hmhm
   * @returns the first query param separator (like ? for path routing)
   */
  getHashQueryParamSeparator(): string {
    return this.defaultQueryParamSeparator;
  },

  /**
   * Get an url without modal data. It's necessary on page refresh or loading Luigi with modal data in a new tab
   * @param {String} searchParamsString url search parameter as string
   * @param {String} modalParamName  modalPathParam value defined in Luigi routing settings
   * @returns {String} url search parameter as string without modal data
   */
  getURLWithoutModalData(searchParamsString: string, modalParamName: string): string {
    const searchParams = new URLSearchParams(searchParamsString);
    searchParams.delete(modalParamName);
    searchParams.delete(`${modalParamName}Params`);
    return searchParams.toString();
  },

  /**
   * Extending history state object for calculation how much history entries the browser have to go back when modal will be closed.
   * @param {Object} historyState history.state object.
   * @param {Number} historyState.modalHistoryLength will be increased when modals will be openend successively like e.g. stepping through a wizard.
   * @param {Number} historyState.historygap is the history.length at the time when the modal will be opened. It's needed for calculating how much we have to go back in the browser history when the modal will be closed.
   * @param {String} historyState.pathBeforeHistory path before modal will be opened. It's needed for calculating how much we have to go back in the browser history when the modal will be closed.
   * @param {boolean} hashRoutingActive true if hash routing is active, false if path routing is active
   * @param {URL} url url object to read hash value or pathname
   * @returns {Object} history state object
   */
  handleHistoryState(historyState: any, path: string): any {
    if (historyState && historyState.modalHistoryLength) {
      historyState.modalHistoryLength += 1;
    } else {
      historyState = {
        modalHistoryLength: 1,
        historygap: history.length,
        pathBeforeHistory: path
      };
    }
    return historyState;
  },

  /**
   * Encodes an object of key-value pairs into a URL query string.
   *
   * Each key and value in the input object is URI-encoded and joined with '='.
   * The resulting pairs are concatenated with '&' to form a valid query string.
   *
   * @param dataObj - An object containing key-value pairs to encode.
   * @returns A URL-encoded query string representing the input object.
   */
  encodeParams(dataObj: Record<string, any>): string {
    const queryArr = [];
    for (const key in dataObj) {
      queryArr.push(encodeURIComponent(key) + '=' + encodeURIComponent(dataObj[key]));
    }
    return queryArr.join('&');
  },

  /**
   * Retrieves the last node object from the provided `PathData`'s `nodesInPath` array.
   * If `nodesInPath` is empty or undefined, returns an empty object.
   *
   * @param pathData - The `PathData` object containing the `nodesInPath` array.
   * @returns The last node object in the `nodesInPath` array, or an empty object if none exists.
   */
  getLastNodeObject(pathData: PathData): Node | {} {
    const lastElement = pathData.nodesInPath ? [...pathData.nodesInPath].pop() : {};
    return lastElement || {};
  },

  /**
   * Checks if given URL is allowed to be included, based on 'navigation.validWebcomponentUrls' in Luigi config.
   *
   * @param {string} url the URL string to be checked
   * @param {Luigi} luigi - the Luigi instance used to determine the parameter prefix
   * @returns {boolean} `true` if allowed - `false` otherwise
   */
  checkWCUrl(url: string, luigi: Luigi): boolean {
    if (url.indexOf('://') > 0 || url.trim().indexOf('//') === 0) {
      const path = new URL(url);

      if (path.host === window.location.host) {
        return true; // same host is okay
      }

      const validUrls = luigi.getConfigValue('navigation.validWebcomponentUrls');

      if (validUrls?.length > 0) {
        for (const el of validUrls) {
          try {
            if (new RegExp(el).test(url)) {
              return true;
            }
          } catch (e) {
            console.error(e);
          }
        }
      }

      return false;
    }

    // relative URL is okay
    return true;
  },

  /**
   * Set feature toggles
   * @param {string} featureToggleProperty used for identifying feature toggles
   * @param {string} path used for retrieving and appending the path parameters
   */
  /**
   * Set feature toggles
   * @param {string} featureToggleProperty used for identifying feature toggles
   * @param {string} path used for retrieving and appending the path parameters
   */
  setFeatureToggles(featureToggleProperty: string, path: string, featureToggles: FeatureToggles): void {
    const paramsMap: Record<string, string> = this.sanitizeParamsMap(this.parseParams(path.split('?')[1]));
    let featureTogglesFromUrl;

    if (paramsMap[featureToggleProperty]) {
      featureTogglesFromUrl = paramsMap[featureToggleProperty];
    }

    if (!featureTogglesFromUrl) {
      return;
    }

    const featureToggleList: string[] = featureTogglesFromUrl.split(',');

    if (featureToggleList.length > 0 && featureToggleList[0] !== '') {
      featureToggleList.forEach((ft) => featureToggles?.setFeatureToggle(ft, true));
    }
  },

  /**
   * Replaces dynamic parameter placeholders in the values of the provided object
   * using a mapping of parameter names to concrete values.
   *
   * A placeholder is defined as the concatenation of `paramPrefix` and a key from `paramMap`
   * (e.g. ":id"). Depending on the `contains` flag, the replacement logic operates in:
   * - Exact match mode (`contains = false`): a value is replaced only if it equals the full placeholder (e.g. value === ":id").
   * - Containment mode (`contains = true`): a value is scanned and any single occurrence of a placeholder substring is replaced
   *   (e.g. "/users/:id/details" becomes "/users/123/details"). Only the first matching key is replaced; subsequent occurrences
   *   or multiple different placeholders in the same value are not handled by this implementation.
   *
   * The function returns a new plain object; the original `object` argument is not mutated.
   *
   * @param object A record whose string values may contain dynamic parameter placeholders to substitute.
   * @param paramMap A mapping of parameter names (without prefix) to their substitution values.
   * @param paramPrefix The prefix that denotes a placeholder in `object` values. Defaults to ":".
   * @param contains If true, perform substring replacement; if false, only exact value matches are substituted.
   * @returns A new object with substituted values where placeholders matched the provided `paramMap`.
   *
   * @example
   * const obj = { userId: ':id', path: '/users/:id/details', untouched: 'static' };
   * const paramMap = { id: '123' };
   *
   * // Exact match mode:
   * substituteDynamicParamsInObject(obj, paramMap);
   * // => { userId: '123', path: '/users/:id/details', untouched: 'static' }
   *
   * // Containment mode:
   * substituteDynamicParamsInObject(obj, paramMap, ':', true);
   * // => { userId: '123', path: '/users/123/details', untouched: 'static' }
   *
   * @remarks
   * - Only the first matching parameter key is considered per value when `contains = true`.
   * - Values that are undefined or null are returned as-is.
   * - The return type is a generic object; if stronger typing is desired, consider overloading or
   *   constraining `paramMap` and `object` to more specific record types.
   */
  substituteDynamicParamsInObject(
    object: Record<string, string>,
    paramMap: Record<any, any>,
    paramPrefix = ':',
    contains = false
  ): {} {
    return Object.entries(object)
      .map(([key, value]) => {
        const foundKey = contains
          ? Object.keys(paramMap).find((key2) => value && value.indexOf(paramPrefix + key2) >= 0)
          : Object.keys(paramMap).find((key2) => value === paramPrefix + key2);
        return [
          key,
          foundKey ? (contains ? value.replace(paramPrefix + foundKey, paramMap[foundKey]) : paramMap[foundKey]) : value
        ];
      })
      .reduce((acc, [key, value]) => {
        return Object.assign(acc, { [key]: value });
      }, {});
  },

  /**
   * Returns true or false whether the passed node is a dynamic node or not
   * @param {*} node
   */
  isDynamicNode(node: Node): boolean {
    return typeof node.pathSegment === 'string' && node.pathSegment.length > 0 && node.pathSegment[0] === ':';
  },

  /**
   * Returns the value from the passed node's pathSegment, e.g. :groupId -> yourGroupId
   * @param {*} node
   * @param {*} pathParams
   */
  getDynamicNodeValue(node: Node, pathParams: Record<string, string>): string | undefined {
    return this.isDynamicNode(node) && node.pathSegment ? pathParams[node.pathSegment.substring(1)] : undefined;
  },

  /**
   * Builds a route string by recursively traversing up the node hierarchy and concatenating path segments.
   * @param node - The current node from which to start building the route.
   * @param path - The accumulated path string (used internally for recursion).
   * @param params - Optional query parameters to append to the final route.
   * @returns a string representing the full route from the root to the given node, including query parameters if provided.
   */
  buildRoute(node: Node, path?: string, params?: string): string {
    return !node.parent
      ? path + (params ? '?' + params : '')
      : this.buildRoute(node.parent, `/${node.parent.pathSegment}${path}`, params);
  },

  substituteViewUrl(viewUrl: string, pathData: PathData, luigi: Luigi): string {
    //TODO issue nr 4575
    //currently minimal requirement for this task
    // const contextVarPrefix = 'context.';
    // const nodeParamsVarPrefix = 'nodeParams.';
    // const searchQuery = 'routing.queryParams';

    viewUrl = GenericHelpers.replaceVars(viewUrl, pathData.pathParams, ':', false);
    // viewUrl = GenericHelpers.replaceVars(viewUrl, pathData.context, contextVarPrefix);
    // viewUrl = GenericHelpers.replaceVars(viewUrl, pathData.nodeParams, nodeParamsVarPrefix);
    //TODO
    // viewUrl = this.getI18nViewUrl(viewUrl);

    // if (viewUrl && viewUrl.includes(searchQuery)) {
    //   const viewUrlSearchParam = viewUrl.split('?')[1];
    //   if (viewUrlSearchParam) {
    //     const key = viewUrlSearchParam.split('=')[0];
    //     const searchParams = luigi.routing().getSearchParams() as Record<string, string>;
    //     if (searchParams[key]) {
    //       viewUrl = viewUrl.replace(`{${searchQuery}.${key}}`, searchParams[key]);
    //     } else {
    //       viewUrl = viewUrl.replace(`?${key}={${searchQuery}.${key}}`, '');
    //     }
    //   }
    // }

    return viewUrl;
  }
};
