import type { FeatureToggles } from '../../core-api/feature-toggles';
import type { Luigi } from '../../core-api/luigi';
import type { AlertSettings } from '../../modules/ux-module';
import type { Node, PathData } from '../../types/navigation';
import { AsyncHelpers } from './async-helpers';
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
    const result: Record<string, string> = Object.create(null);
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
   * Maps a path to the nodes route, replacing all dynamic pathSegments with the concrete values in path.
   * Example: path='/object/234/subobject/378/some/node', node with path '/object/:id/subobject/:subid' results in
   * '/object/234/subobject/378/'.
   * @param {String} path - a concrete node path, typically the current app route
   * @param {Node} node - a node which must be an ancestor of the resolved node from path
   * @returns a string with the route or undefined, if node is not an ancestor of path-node
   */
  mapPathToNode(path: string, node: Node): string | undefined {
    if (!path || !node) {
      return;
    }

    const pathSegments = GenericHelpers.trimLeadingSlash(path).split('/');
    const nodeRoute = RoutingHelpers.buildRoute(node, `/${node.pathSegment}`);
    const nodeRouteSegments = GenericHelpers.trimLeadingSlash(nodeRoute).split('/');

    if (pathSegments.length < nodeRouteSegments.length) {
      return;
    }

    let resultingRoute = '';

    for (let i = 0; i < nodeRouteSegments.length; i++) {
      if (pathSegments[i] !== nodeRouteSegments[i] && nodeRouteSegments[i].indexOf(':') !== 0) {
        return;
      }

      resultingRoute += '/' + pathSegments[i];
    }

    return resultingRoute;
  },

  async getNodeLabel(node: Node, luigi: Luigi): Promise<string> {
    if (node.label && !node._virtualTree) {
      return luigi.i18n().getTranslation(node.label) || node.label;
    }

    if (node.pathSegment && node.pathSegment.indexOf(':') === 0) {
      const hash = luigi.getConfig().routing?.useHashRouting;
      const route = RoutingHelpers.mapPathToNode(RoutingHelpers.getCurrentPath(luigi, hash)?.path, node) || '';
      const data = await luigi.navigation().navService.extractDataFromPath(route);

      return RoutingHelpers.getDynamicNodeValue(node, data.pathData.pathParams) || '';
    }

    if (node.pathSegment) {
      return node.pathSegment;
    }

    return '';
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
   * Checks if given path contains intent navigation special syntax
   * @param {string} path - path to be checked
   */
  hasIntent(path: string): boolean {
    return !!path && path.toLowerCase().includes('#?intent=');
  },

  /**
   * This function takes an intentLink and parses it conforming certain limitations in characters usage.
   * Limitations include:
   *  - `semanticObject` allows only alphanumeric characters
   *  - `action` allows alphanumeric characters and the '_' sign
   *
   * Example of resulting output:
   * ```
   *  {
   *    semanticObject: "Sales",
   *    action: "order",
   *    params: {param1: "value1",param2: "value2"}
   *  };
   * ```
   * @param {string} intentLink - the intent link represents the semantic intent defined by the user, i.e.: #?intent=semanticObject-action?param=value
   */
  getIntentObject(intentLink: string): Record<string, any> | undefined {
    const intentParams = intentLink.split('?intent=')[1];

    if (intentParams) {
      const intentObj = intentParams.split('?');
      const semanticObjectAndAction = intentObj[0].split('-');
      const params = Object.fromEntries(new URLSearchParams(intentObj[1]).entries());

      return {
        semanticObject: semanticObjectAndAction[0],
        action: semanticObjectAndAction[1],
        params
      };
    }
  },

  /**
   * This function compares the intentLink parameter with the configuration intentMapping
   * and returns the path segment that is matched together with the parameters, if any
   *
   * Example:
   *
   * For intentLink = `#?intent=Sales-order?foo=bar`
   * and Luigi configuration:
   * ```
   * intentMapping: [{
   *   semanticObject: 'Sales',
   *   action: 'order',
   *   pathSegment: '/projects/pr2/order'
   * }]
   *
   * ```
   * the given intentLink is matched with the configuration's same semanticObject and action,
   * resulting in pathSegment `/projects/pr2/order` being returned. The parameter is also added in
   * this case resulting in: `/projects/pr2/order?~foo=bar`
   *
   * Or for external intent links: intentLink = `#?intent=External-view`
   * and Luigi configuration:
   * ```
   * intentMapping: [{
   *   semanticObject: 'External',
   *   action: 'view',
   *   externalLink: { url: 'https://www.sap.com', openInNewTab: true }
   * }]
   * ```
   * The resulting will be returned from this function:
   * ```
   * {
   *   url: 'https://www.sap.com',
   *   openInNewTab: true,
   *   external: true
   * }
   * ```
   * @param {string} intentLink - the intentLink represents the semantic intent defined by the user, i.e.: #?intent=semanticObject-action?param=value
   * @param luigi - Luigi instance used to access configuration values
   */
  getIntentPath(intentLink: string, luigi: Luigi): boolean | string | Record<string, any> {
    const mappings = luigi.getConfigValue('navigation.intentMapping');

    if (mappings && mappings.length > 0) {
      const caseInsensitiveLink = intentLink.replace(/\?intent=/i, '?intent=');
      const intentObject = this.getIntentObject(caseInsensitiveLink);

      if (intentObject) {
        let realPath = mappings.find(
          (item: any) => item.semanticObject === intentObject.semanticObject && item.action === intentObject.action
        );

        if (!realPath) {
          return false;
        }

        // set 'external' boolean to make it easier to identify new tab links
        if (realPath.externalLink) {
          return {
            ...realPath.externalLink,
            external: true
          };
        }

        realPath = realPath.pathSegment;

        const params = Object.entries(intentObject.params);

        if (params && params.length > 0) {
          // resolve dynamic parameters in the path if any
          realPath = this.resolveDynamicIntentPath(realPath, intentObject.params);

          // get custom node param prefixes if any or default to ~
          let nodeParamPrefix = luigi.getConfigValue('routing.nodeParamPrefix');

          nodeParamPrefix = nodeParamPrefix || '~';
          realPath = realPath.concat(`?${nodeParamPrefix}`);
          params.forEach(([key, value], index) => {
            realPath += `${index > 0 ? '&' + nodeParamPrefix : ''}${key}=${value}`;
          });
        }

        return realPath;
      } else {
        console.warn('Could not parse given intent link.');
      }
    } else {
      console.warn('No intent mappings are defined in Luigi configuration.');
    }

    return false;
  },

  /**
   * This function takes a path which contains dynamic parameters and a list parameters and replaces the dynamic parameters
   * with the given parameters if any. The input path remains unchanged if the parameters list
   * does not contain the respective dynamic parameter name.
   * e.g.:
   * Assume either of these two calls are made:
   * 1. `LuigiClient.linkManager().navigateToIntent('Sales-settings', {project: 'pr2', user: 'john'})`
   * 2. `LuigiClient.linkManager().navigate('/#?intent=Sales-settings?project=pr2&user=john')`
   * For both 1. and 2., the following dynamic input path: `/projects/:project/details/:user`
   * is resolved through this method to `/projects/pr2/details/john`
   *
   * @param {string} path - the path containing the potential dynamic parameter
   * @param {Object} parameters - a list of objects consisting of passed parameters
   */
  resolveDynamicIntentPath(path: string, parameters: object): string {
    if (!parameters) {
      return path;
    }

    let newPath = path;

    for (const [key, value] of Object.entries(parameters)) {
      // regular expression to detect dynamic parameter patterns:
      // /some/path/:param1/example/:param2/sample
      // /some/path/example/:param1
      const regex = new RegExp('/:' + key + '(/|$)', 'g');

      newPath = newPath.replace(regex, `/${value}/`);
    }

    // strip trailing slash
    newPath = newPath.replace(/\/$/, '');

    return newPath;
  },

  /**
   * Retrieves the current path and query string from the browser's location hash.
   *
   * @param hashRouting - true if hash routing is active, false if path routing is active
   * @param luigi - Luigi instance used to access configuration values
   * @returns An object containing the normalized path and the query string.
   * @remarks
   * - The path is normalized using `NavigationHelpers.normalizePath`.
   * - The query string is extracted from the portion after the '?' in the hash.
   * - If there is no query string, `query` will be `undefined`.
   */
  getCurrentPath(luigi: Luigi, hashRouting?: boolean, checkIntent?: boolean): { path: string; query: string } {
    if (checkIntent && /\?intent=/i.test(location.hash)) {
      const hash = location.hash.replace('#/#', '').replace('#', '');
      const intentPath = RoutingHelpers.getIntentPath(hash, luigi);

      // if intent faulty or illegal then skip
      if (intentPath) {
        if (typeof intentPath === 'string') {
          const isReplaceRouteActivated = luigi?.getConfigValue('routing.replaceIntentRoute');

          if (isReplaceRouteActivated) {
            history.replaceState((window as any).state, '', intentPath);
          }

          return { path: intentPath, query: location.search };
        } else {
          if ((intentPath as any).external && (intentPath as any).url) {
            const target = (intentPath as any).openInNewTab ? '_blank' : '_self';

            window.open((intentPath as any).url, target, 'noopener,noreferrer')?.focus();
          }
        }
      }
    }

    if (hashRouting) {
      const pathRaw = NavigationHelpers.normalizePath(location.hash);
      const [path, query] = pathRaw.split('?');

      return { path: path.replace('#', ''), query };
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
   * Default:
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
   * Checks if given path is an existing route or not
   * @param {string} activePath - path to be checked
   * @param {PathData} pathData - related path data
   * @returns {boolean} the result of path checking as boolean value
   */
  isExistingRoute(activePath: string, pathData: PathData): boolean {
    const pathSegments: string[] = activePath?.split('/') || [];
    const nodesInPath: Node[] = pathData?.nodesInPath || [];
    const findChildNode = (node: null | Node, segment: string): null | Node => {
      let output = null;

      if (node?.children?.length) {
        const nodes: Node[] = node.children.filter((node: Node) => node.pathSegment === segment);

        if (nodes?.length) {
          output = nodes[0];
        }
      }

      return output;
    };
    let navPathSegments: string[] = [];

    if (pathSegments.length > 1 && nodesInPath.length === 1) {
      let currentNode: null | Node;

      pathSegments.forEach((segment, index) => {
        const parentNode = index === 0 ? nodesInPath[0] : currentNode;

        currentNode = findChildNode(parentNode, segment);
        if (currentNode?.pathSegment) {
          navPathSegments.push(currentNode.pathSegment);
        }
      });
    } else {
      navPathSegments = nodesInPath
        .filter((node: Node) => node.pathSegment)
        .map((node: Node) => node.pathSegment || '');
    }

    return !activePath || pathSegments.length === navPathSegments.length;
  },

  /**
   * Handles case if path exists or not.
   * @param {string} path - the path to be checked
   * @param {Luigi} luigi - the Luigi instance used to access configuration values
   * @returns {Promise<boolean>} the result of path checking as async boolean value
   */
  async pathExists(path: string, luigi: Luigi): Promise<boolean> {
    const activePath: string = GenericHelpers.getTrimmedUrl(path);
    const pathData: PathData = await luigi.navigation().navService.getPathData(path);
    const isExistingRoute: boolean = RoutingHelpers.isExistingRoute(activePath, pathData);

    return pathData ? isExistingRoute : false;
  },

  /*
   * Shows an error alert on the given path
   * @param {string} path - the path to show in the alert
   * @param {boolean} isAnyPathMatched - shows whether a valid path was found / which means path was only partially wrong; otherwise it is false
   * @param {Luigi} luigi - the Luigi instance used to access i18n and ux methods
   */
  showRouteNotFoundAlert(path: string, isAnyPathMatched = false, luigi: Luigi): void {
    const alertSettings: AlertSettings = {
      text: luigi
        .i18n()
        .getTranslation(isAnyPathMatched ? 'luigi.notExactTargetNode' : 'luigi.requestedRouteNotFound', {
          route: path
        } as any),
      type: 'error',
      ttl: 1 // how many redirections the alert will 'survive'
    };

    luigi.ux().showAlert(alertSettings);
  },

  /**
   * Queries the pageNotFoundHandler configuration and returns redirect path if it exists
   * If the there is no `pageNotFoundHandler` defined we return undefined.
   * @param {string} notFoundPath - the path to be checked
   * @param {boolean} isAnyPathMatched - is any path matched or not
   * @param {Luigi} luigi - the Luigi instance used to access config value
   * @returns {Object} an object optionally containing the path to redirect, the keepURL option or an empty object if handler is undefined
   */
  getPageNotFoundRedirectResult(notFoundPath: string, isAnyPathMatched = false, luigi: Luigi): object {
    const pageNotFoundHandler = luigi.getConfigValue('routing.pageNotFoundHandler');

    if (typeof pageNotFoundHandler === 'function') {
      // custom 404 handler is provided, use it
      const result = pageNotFoundHandler(notFoundPath, isAnyPathMatched);

      if (result && (result.redirectTo || result.ignoreLuigiErrorHandling)) {
        return {
          path: result.redirectTo,
          keepURL: result.keepURL,
          ignoreLuigiErrorHandling: result.ignoreLuigiErrorHandling
        };
      }
    }

    return {};
  },

  /**
   * Handles pageNotFound situation depending if path exists or not.
   * If path exists simply return the given path, else fetch the pageNotFound redirect path and return it.
   * In case there was no pageNotFound handler defined it shows an alert and returns undefined.
   * @param {string} path - the path to check for
   * @param {boolean} pathExists - defines if path exists or not
   * @param {Luigi} luigi - the Luigi instance used to access configuration values
   * @returns {} the path to redirect to or undefined if path doesn't exist and no redirect path is defined
   */
  async handlePageNotFoundAndRetrieveRedirectPath(
    path: string,
    pathExists: boolean,
    luigi: Luigi
  ): Promise<string | undefined> {
    if (pathExists) {
      return path;
    }

    const pageNotFoundHandler = luigi.getConfigValue('routing.pageNotFoundHandler');
    const redirectPath = (this.getPageNotFoundRedirectResult(path, pageNotFoundHandler, luigi) as any)?.path;

    if (redirectPath !== undefined) {
      return redirectPath;
    } else {
      // default behavior if `pageNotFoundHandler` did not produce a redirect path
      this.showRouteNotFoundAlert(path, false, luigi);
      console.warn(`Could not find the requested route: ${path}`);
      return undefined;
    }
  },

  async getDefaultChildNode(
    pathData: PathData,
    childrenResolverFn?: (lastElement: object, pathContext: object) => any
  ): Promise<string> {
    if (!pathData) {
      return '';
    }

    const lastElement: any = pathData.nodesInPath && pathData.nodesInPath[pathData.nodesInPath.length - 1];
    const pathContext: any = pathData.context;
    const children = childrenResolverFn
      ? await childrenResolverFn(lastElement, pathContext)
      : await AsyncHelpers.getConfigValueFromObjectAsync(lastElement, 'children', pathContext);
    const pathExists = children.find((childNode: Node) => childNode.pathSegment === lastElement.defaultChildNode);

    if (lastElement.defaultChildNode && pathExists) {
      return lastElement.defaultChildNode;
    } else if (children && children.length) {
      const rootPath = pathData?.nodesInPath?.length === 1;

      if (rootPath) {
        const firstNodeWithPathSegment = children.find((child: Node) => child.pathSegment);

        return (
          (firstNodeWithPathSegment && firstNodeWithPathSegment.pathSegment) ||
          console.error('At least one navigation node in the root hierarchy must have a pathSegment.')
        );
      }

      const validChild = children.find(
        (child: any) =>
          child.pathSegment && (child.viewUrl || child.compound || (child.externalLink && child.externalLink.url))
      );

      if (validChild) return validChild.pathSegment;
    }

    return '';
  },

  /**
   *  Recursively constructs the full path for a given node by concatenating its path segment with those of its ancestors.
   *  If `params` are provided, they are appended as query parameters to the final path.
   * @param node - The node for which to construct the path. It is expected to have a `pathSegment` property and optionally a `parent` property pointing to its parent node.
   * @param params - Optional query parameters to append to the path. If provided, it should be a string in the format of URL query parameters (e.g., "key=value&anotherKey=anotherValue").
   * @returns The constructed path as a string, including any query parameters if provided.
   */
  getNodePath(node: Node, params?: string): string {
    if (!node || params) {
      return node ? this.buildRoute(node, node.pathSegment ? '/' + node.pathSegment : '', params) : '';
    } else {
      return `${node.parent ? this.getNodePath(node.parent) : ''}/${node.pathSegment}`;
    }
  },

  /**
   * Builds a route string by recursively traversing up the node hierarchy and concatenating path segments.
   * @param node - The current node from which to start building the route.
   * @param path - The accumulated path string (used internally for recursion).
   * @param params - Optional query parameters to append to the final route.
   * @returns a string representing the full route from the root to the given node, including query parameters if provided.
   */
  buildRoute(node: Node, path: string, params?: string): string {
    return !node.parent
      ? path + (params ? '?' + params : '')
      : this.buildRoute(node.parent, `/${node.parent.pathSegment}${path}`, params);
  },

  substituteViewUrl(node: Node, pathParams: Record<string, string>, luigi: Luigi): string {
    if (!node.viewUrl) {
      return '';
    }

    let viewUrl = node.viewUrl;
    //TODO issue nr 4575
    //currently minimal requirement for this task
    // const contextVarPrefix = 'context.';
    // const nodeParamsVarPrefix = 'nodeParams.';
    // const searchQuery = 'routing.queryParams';

    if (node.virtualTree) {
      viewUrl = viewUrl.replace('{virtualTreePath}', '');
    }
    viewUrl = GenericHelpers.replaceVars(viewUrl, pathParams, ':', false);
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
  },

  /**
   *  Generates a sub-path for a given node by replacing dynamic parameters in the node's path with actual values from pathParams.
   * @param node - The node for which to generate the sub-path. It is expected to have a `pathSegment` property and optionally a `parent` property pointing to its parent node.
   * @param nodePathParams - An object containing the values for dynamic parameters in the node's path. The keys should match the parameter names in the path segments.
   * @returns A string representing the sub-path with dynamic parameters replaced by their corresponding values from pathParams.
   */
  getSubPath(node: any, nodePathParams: any): string {
    return GenericHelpers.replaceVars(RoutingHelpers.getNodePath(node), nodePathParams, ':', false);
  },

  /**
   * Concatenates a base path and a relative path
   *
   * The function performs the following steps:
   * 1. Removes any trailing '/' from the base path.
   * 2. If the relative path does not start with '/', it adds a '/' between the base and relative paths.
   * 3. Concatenates the base path and the relative path.
   * @param basePath The base path to which the relative path will be appended. It may or may not end with a '/' character.
   * @param relativePath The relative path to append to the base path. It may or may not start with a '/' character.
   * @returns A string representing the concatenated path, with exactly one '/' character between the base and relative paths.
   */
  concatenatePath(basePath: any, relativePath?: any): string {
    let path = GenericHelpers.getPathWithoutHashOrSlash(basePath);
    if (!path) {
      return relativePath;
    }
    if (!relativePath) {
      return path;
    }
    if (path.endsWith('/')) {
      path = path.substring(0, path.length - 1);
    }
    if (!relativePath.startsWith('/')) {
      path += '/';
    }
    path += relativePath;
    return path;
  }
};
