import type { Luigi } from '../../core-api/luigi';
import type { Node } from '../../services/navigation.service';
import { EscapingHelpers } from './escaping-helpers';
import { GenericHelpers } from './generic-helpers';
import { NavigationHelpers } from './navigation-helpers';

export const RoutingHelpers = {
  defaultContentViewParamPrefix: '~',

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
   * Parses given view URL using additional component data - returns parsed view URL.
   *
   * @param viewUrl - A view URL to be parsed.
   * @param componentData - Additional component data.
   * @returns A parsed view URL.
   */
  substituteViewUrl(viewUrl: string, componentData: any) {
    const contextVarPrefix = 'context.';
    const nodeParamsVarPrefix = 'nodeParams.';
    const searchQuery = 'routing.queryParams';

    viewUrl = GenericHelpers.replaceVars(viewUrl, componentData.pathParams, ':', false);
    viewUrl = GenericHelpers.replaceVars(viewUrl, componentData.context, contextVarPrefix);
    viewUrl = GenericHelpers.replaceVars(viewUrl, componentData.nodeParams, nodeParamsVarPrefix);
    //TODO viewUrl = RoutingHelpers.getI18nViewUrl(viewUrl);

    if (viewUrl && viewUrl.includes(searchQuery)) {
      const viewUrlSearchParam = viewUrl.split('?')[1];

      if (viewUrlSearchParam) {
        const key = viewUrlSearchParam.split('=')[0];

        /* TODO
        if (LuigiRouting.getSearchParams()[key]) {
          viewUrl = viewUrl.replace(`{${searchQuery}.${key}}`, LuigiRouting.getSearchParams()[key]);
        } else {
          viewUrl = viewUrl.replace(`?${key}={${searchQuery}.${key}}`, '');
        }
        */
        viewUrl = viewUrl.replace(`?${key}={${searchQuery}.${key}}`, '');
      }
    }

    return viewUrl;
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
  getCurrentPath(): { path: string; query: string } {
    //TODO intentNavigation implementation
    const pathRaw = NavigationHelpers.normalizePath(location.hash);
    const [path, query] = pathRaw.split('?');
    return { path, query };
  }
};
