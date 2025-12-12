// Helper methods for 'routing.js' file. They don't require any method from 'routing.js' but are required by them.
// They are also rarely used directly from outside of 'routing.js'
import { LuigiConfig, LuigiFeatureToggles, LuigiI18N, LuigiRouting } from '../../core-api';
import { AsyncHelpers, EscapingHelpers, EventListenerHelpers, GenericHelpers, IframeHelpers } from './';
import { Routing } from '../../services/routing';

class RoutingHelpersClass {
  constructor() {
    this.defaultContentViewParamPrefix = '~';
    this.defaultQueryParamSeparator = '?';
    this.defaultModalViewParamName = 'modal';
  }

  getLastNodeObject(pathData) {
    const lastElement = [...pathData.navigationPath].pop();
    return lastElement || {};
  }

  async getDefaultChildNode(pathData, childrenResolverFn) {
    const lastElement = pathData.navigationPath[pathData.navigationPath.length - 1];

    const children = childrenResolverFn
      ? await childrenResolverFn(lastElement, pathData.context)
      : await AsyncHelpers.getConfigValueFromObjectAsync(lastElement, 'children', pathData.context);
    const pathExists = children.find((childNode) => childNode.pathSegment === lastElement.defaultChildNode);

    if (lastElement.defaultChildNode && pathExists) {
      return lastElement.defaultChildNode;
    } else if (children && children.length) {
      const rootPath = pathData.navigationPath.length === 1;
      if (rootPath) {
        const firstNodeWithPathSegment = children.find((child) => child.pathSegment);
        return (
          (firstNodeWithPathSegment && firstNodeWithPathSegment.pathSegment) ||
          console.error('At least one navigation node in the root hierarchy must have a pathSegment.')
        );
      }
      const validChild = children.find(
        (child) =>
          child.pathSegment && (child.viewUrl || child.compound || (child.externalLink && child.externalLink.url))
      );
      if (validChild) return validChild.pathSegment;
    }

    return '';
  }

  parseParams(paramsString) {
    if (!paramsString) return {};
    const result = {};
    const viewParamString = paramsString.replace(/\+/g, ' ');
    const pairs = viewParamString ? viewParamString.split('&') : null;
    if (pairs) {
      pairs.forEach((pairString) => {
        const keyValue = pairString.split('=');
        if (keyValue && keyValue.length > 0) {
          result[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1]);
        }
      });
    }
    return result;
  }

  encodeParams(dataObj) {
    const queryArr = [];
    for (const key in dataObj) {
      queryArr.push(encodeURIComponent(key) + '=' + encodeURIComponent(dataObj[key]));
    }
    return queryArr.join('&');
  }

  getNodeParams(params) {
    const result = {};
    const paramPrefix = this.getContentViewParamPrefix();
    if (params) {
      Object.entries(params).forEach((entry) => {
        if (entry[0].startsWith(paramPrefix)) {
          const paramName = entry[0].substr(paramPrefix.length);
          result[paramName] = entry[1];
        }
      });
    }
    return this.sanitizeParamsMap(result);
  }

  applyPathParams(path, pathParams) {
    let result = path;
    if (pathParams) {
      Object.entries(pathParams).forEach(([param, value]) => {
        result = result.replace(new RegExp(':' + param, 'g'), value);
      });
    }
    return result;
  }

  getContentViewParamPrefix() {
    let prefix = LuigiConfig.getConfigValue('routing.nodeParamPrefix');
    if (prefix === false) {
      prefix = '';
    } else if (!prefix) {
      prefix = this.defaultContentViewParamPrefix;
    }
    return prefix;
  }

  getModalViewParamName() {
    let paramName = LuigiConfig.getConfigValue('routing.modalPathParam');
    if (!paramName) {
      paramName = this.defaultModalViewParamName;
    }
    return paramName;
  }

  /**
   * Get the query param separator which is used with hashRouting
   * Default: :
   * @example /home?modal=(urlencoded)/some-modal?modalParams=(urlencoded){...}&otherParam=hmhm
   * @returns the first query param separator (like ? for path routing)
   */
  getHashQueryParamSeparator() {
    return this.defaultQueryParamSeparator;
  }

  getQueryParam(paramName) {
    return this.getQueryParams()[paramName];
  }

  getQueryParams() {
    const hashRoutingActive = LuigiConfig.getConfigBooleanValue('routing.useHashRouting');
    return hashRoutingActive ? this.getLocationHashQueryParams() : this.getLocationSearchQueryParams();
  }

  getLocation() {
    return location;
  }

  getLocationHashQueryParams() {
    const queryParamIndex = RoutingHelpers.getLocation().hash.indexOf(this.defaultQueryParamSeparator);
    return queryParamIndex !== -1
      ? RoutingHelpers.parseParams(RoutingHelpers.getLocation().hash.slice(queryParamIndex + 1))
      : {};
  }

  getLocationSearchQueryParams() {
    return RoutingHelpers.getLocation().search
      ? RoutingHelpers.parseParams(RoutingHelpers.getLocation().search.slice(1))
      : {};
  }

  /**
    * Append search query parameters to the route
    @param route string  absolute path of the new route
    @returns resulting route with or without appended params, for example /someroute?query=test
  */
  composeSearchParamsToRoute(route) {
    const hashRoutingActive = LuigiConfig.getConfigBooleanValue('routing.useHashRouting');
    if (hashRoutingActive) {
      const queryParamIndex = location.hash.indexOf(this.defaultQueryParamSeparator);
      return queryParamIndex !== -1 ? route + location.hash.slice(queryParamIndex) : route;
    }
    return location.search ? route + location.search : route;
  }

  getModalPathFromPath() {
    const path = this.getQueryParam(this.getModalViewParamName());
    return path;
  }

  getModalParamsFromPath() {
    const modalParamsStr = this.getQueryParam(`${this.getModalViewParamName()}Params`);
    return modalParamsStr && JSON.parse(modalParamsStr);
  }

  addRouteChangeListener(callback) {
    const hashRoutingActive = LuigiConfig.getConfigValue('routing.useHashRouting');

    EventListenerHelpers.addEventListener('message', (e) => {
      if (e.data.msg === 'refreshRoute' && e.origin === window.origin) {
        const path = hashRoutingActive ? Routing.getHashPath() : Routing.getModifiedPathname();
        callback(path);
      }
    });

    EventListenerHelpers.addEventListener('popstate', (e) => {
      const path = hashRoutingActive ? Routing.getHashPath(location.href) : Routing.getModifiedPathname();
      callback(path, e.detail);
    });
  }

  buildRoute(node, path, params) {
    return !node.parent
      ? path + (params ? '?' + params : '')
      : this.buildRoute(node.parent, `/${node.parent.pathSegment}${path}`, params);
  }

  /**
    * Get context from node
    @param {Object} node - node information
    @param {Object} ctx - context object
    @returns {Object} context object. e.g. { someValue: 'foo' }
  */
  getContext(node, ctx) {
    if (ctx === undefined || ctx === null) {
      return this.getContext(node, node.context || {});
    }

    return node.parent ? { ...this.getContext(node.parent), ...ctx } : ctx;
  }

  getRouteLink(node, pathParams, relativePathPrefix) {
    const pp = relativePathPrefix || '';
    if (node.externalLink && node.externalLink.url) {
      const url = node.externalLink.url;
      const data = {
        context: RoutingHelpers.substituteDynamicParamsInObject(this.getContext(node), pathParams),
        pathParams,
        nodeParams: {}
      };
      return this.substituteViewUrl(url, data);
      // externalLinkUrl property is provided so there's no need to trigger routing mechanizm
    } else if (node.link) {
      const link = node.link.startsWith('/') ? node.link : Routing.buildFromRelativePath(node);
      return pp + link;
    }

    const route = RoutingHelpers.buildRoute(node, `/${node.pathSegment}`);
    return pp + GenericHelpers.replaceVars(route, pathParams, ':', false);
  }

  calculateNodeHref(node, pathParams) {
    const link = RoutingHelpers.getRouteLink(
      node,
      pathParams,
      LuigiConfig.getConfigValue('routing.useHashRouting') ? '#' : ''
    );
    return this.getI18nViewUrl(link.url) || link;
  }

  getNodeHref(node, pathParams) {
    if (LuigiConfig.getConfigBooleanValue('navigation.addNavHrefs')) {
      return this.calculateNodeHref(node, pathParams);
    }
    return undefined;
  }

  /**
   * Returns the path from the passed node and params
   * @param {*} node
   * @param {*} params
   */
  getNodePath(node, params) {
    if (!node || params) {
      return node ? this.buildRoute(node, node.pathSegment ? '/' + node.pathSegment : '', params) : '';
    } else {
      return `${node.parent ? this.getNodePath(node.parent) : ''}/${node.pathSegment}`;
    }
  }

  substituteDynamicParamsInObject(object, paramMap, paramPrefix = ':', contains = false) {
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
  }

  /**
   * Maps a path to the nodes route, replacing all dynamic pathSegments with the concrete values in path.
   * Example: path='/object/234/subobject/378/some/node', node with path '/object/:id/subobject/:subid' results in
   * '/object/234/subobject/378/'.
   * @param {*} path - a concrete node path, typically the current app route
   * @param {*} node - a node which must be an ancestor of the resolved node from path
   * @returns a string with the route or undefined, if node is not an ancestor of path-node
   */
  mapPathToNode(path, node) {
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
  }

  /**
   * Returns true or false whether the passed node is a dynamic node or not
   * @param {*} node
   */
  isDynamicNode(node) {
    return node.pathSegment && node.pathSegment.length > 0 && node.pathSegment[0] === ':';
  }

  /**
   * Returns the value from the passed node's pathSegment, e.g. :groupId -> yourGroupId
   * @param {*} node
   * @param {*} pathParams
   */
  getDynamicNodeValue(node, pathParams) {
    return this.isDynamicNode(node) ? pathParams[node.pathSegment.substring(1)] : undefined;
  }

  /**
   * Returns the viewUrl with current locale, e.g. luigi/{i18n.currentLocale}/ -> luigi/en
   * if viewUrl contains {i18n.currentLocale} term, it will be replaced by current locale
   * @param {*} viewUrl
   */
  getI18nViewUrl(viewUrl) {
    const i18n_currentLocale = '{i18n.currentLocale}';
    const locale = LuigiI18N.getCurrentLocale();
    const hasI18n = viewUrl && viewUrl.includes(i18n_currentLocale);

    return hasI18n ? viewUrl.replace(i18n_currentLocale, locale) : viewUrl;
  }

  substituteViewUrl(viewUrl, componentData) {
    const contextVarPrefix = 'context.';
    const nodeParamsVarPrefix = 'nodeParams.';
    const searchQuery = 'routing.queryParams';

    viewUrl = GenericHelpers.replaceVars(viewUrl, componentData.pathParams, ':', false);
    viewUrl = GenericHelpers.replaceVars(viewUrl, componentData.context, contextVarPrefix);
    viewUrl = GenericHelpers.replaceVars(viewUrl, componentData.nodeParams, nodeParamsVarPrefix);
    viewUrl = this.getI18nViewUrl(viewUrl);

    if (viewUrl && viewUrl.includes(searchQuery)) {
      const viewUrlSearchParam = viewUrl.split('?')[1];
      if (viewUrlSearchParam) {
        const key = viewUrlSearchParam.split('=')[0];
        if (LuigiRouting.getSearchParams()[key]) {
          viewUrl = viewUrl.replace(`{${searchQuery}.${key}}`, LuigiRouting.getSearchParams()[key]);
        } else {
          viewUrl = viewUrl.replace(`?${key}={${searchQuery}.${key}}`, '');
        }
      }
    }

    return viewUrl;
  }

  sanitizeParamsMap(paramsMap) {
    return Object.entries(paramsMap).reduce((sanitizedMap, paramPair) => {
      sanitizedMap[EscapingHelpers.sanitizeParam(paramPair[0])] = EscapingHelpers.sanitizeParam(paramPair[1]);
      return sanitizedMap;
    }, {});
  }

  setFeatureToggles(featureToggleProperty, path) {
    let featureTogglesFromUrl;
    const paramsMap = this.sanitizeParamsMap(this.parseParams(path.split('?')[1]));

    if (paramsMap[featureToggleProperty]) {
      featureTogglesFromUrl = paramsMap[featureToggleProperty];
    }
    if (!featureTogglesFromUrl) {
      return;
    }
    const featureToggleList = featureTogglesFromUrl.split(',');
    if (featureToggleList.length > 0 && featureToggleList[0] !== '') {
      featureToggleList.forEach((ft) => LuigiFeatureToggles.setFeatureToggle(ft, true));
    }
  }

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
   * @param {string} link - the intent link represents the semantic intent defined by the user, i.e.: #?intent=semanticObject-action?param=value
   */
  getIntentObject(intentLink) {
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
  }

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
   *                     semanticObject: 'Sales',
   *                     action: 'order',
   *                     pathSegment: '/projects/pr2/order'
   * }]
   *
   * ```
   * the given intentLink is matched with the configuration's same semanticObject and action,
   * resulting in pathSegment `/projects/pr2/order` being returned. The parameter is also added in
   * this case resulting in: `/projects/pr2/order?~foo=bar`
   *
   * Or for external intent links: intentLink = `#?intent=External-external`
   * and Luigi configuration:
   * ```
   * intentMapping: [{
   *                     semanticObject: 'External',
   *                     action: 'view',
   *                     externalLink: { url: 'https://www.sap.com', openInNewTab: true }
   * }]
   * ```
   * The resulting will be returned from this function:
   * ```
   *          {
   *             url: 'https://www.sap.com',
   *             openInNewTab: true,
   *             external: true
   *          }
   * ```
   * @param {string} intentLink - the intentLink represents the semantic intent defined by the user, i.e.: #?intent=semanticObject-action?param=value
   */
  getIntentPath(intentLink) {
    const mappings = LuigiConfig.getConfigValue('navigation.intentMapping');
    if (mappings && mappings.length > 0) {
      const caseInsensitiveLink = intentLink.replace(/\?intent=/i, '?intent=');
      const intentObject = this.getIntentObject(caseInsensitiveLink);
      if (intentObject) {
        let realPath = mappings.find(
          (item) => item.semanticObject === intentObject.semanticObject && item.action === intentObject.action
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
          let nodeParamPrefix = LuigiConfig.getConfigValue('routing.nodeParamPrefix');
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
  }

  /**
   * This function takes a path which contains dynamic parameters and a list parameters and replaces the dynamic parameters
   * with the given parameters if any. The input path remains unchanged if the parameters list
   * does not contain the respective dynamic parameter name.
   * e.g.:
   * Assume either of these two calls are made:
   * 1. `linkManager().navigateToIntent('Sales-settings', {project: 'pr2', user: 'john'})`
   * 2. `linkManager().navigate('/#?intent=Sales-settings?project=pr2&user=john')`
   * For both 1. and 2., the following dynamic input path: `/projects/:project/details/:user`
   * is resolved through this method to `/projects/pr2/details/john`
   *
   * @param {string} path - the path containing the potential dynamic parameter
   * @param {Object} parameters - a list of objects consisting of passed parameters
   */
  resolveDynamicIntentPath(path, parameters) {
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
  }

  prepareSearchParamsForClient(currentNode) {
    const filteredObj = {};
    if (currentNode && currentNode.clientPermissions && currentNode.clientPermissions.urlParameters) {
      Object.keys(currentNode.clientPermissions.urlParameters).forEach((key) => {
        if (key in LuigiRouting.getSearchParams() && currentNode.clientPermissions.urlParameters[key].read === true) {
          filteredObj[key] = LuigiRouting.getSearchParams()[key];
        }
      });
    }
    return filteredObj;
  }

  addSearchParamsFromClient(currentNode, searchParams, keepBrowserHistory) {
    const localSearchParams = { ...searchParams };
    if (!GenericHelpers.isObject(localSearchParams)) {
      return;
    }

    if (currentNode && currentNode.clientPermissions && currentNode.clientPermissions.urlParameters) {
      const filteredObj = {};
      Object.keys(currentNode.clientPermissions.urlParameters).forEach((key) => {
        if (key in localSearchParams && currentNode.clientPermissions.urlParameters[key].write === true) {
          filteredObj[key] = localSearchParams[key];
          delete localSearchParams[key];
        }
      });
      for (const key in localSearchParams) {
        console.warn(`No permission to add the search param "${key}" to the url`);
      }
      if (Object.keys(filteredObj).length > 0) {
        LuigiRouting.addSearchParams(filteredObj, keepBrowserHistory);
      }
    }
  }

  /**
   * Checks if given path contains intent navigation special syntax
   * @param {string} path - path to be checked
   */
  hasIntent(path) {
    return !!path && path.toLowerCase().includes('#?intent=');
  }

  /**
   * Queries the pageNotFoundHandler configuration and returns redirect path if it exists
   * If the there is no `pageNotFoundHandler` defined we return undefined.
   * @param {*} notFoundPath - the path to check
   * @returns an object optionally containing the path to redirect, the keepURL option or an empty object if handler is undefined
   */
  getPageNotFoundRedirectResult(notFoundPath, isAnyPathMatched = false) {
    const pageNotFoundHandler = LuigiConfig.getConfigValue('routing.pageNotFoundHandler');
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
  }

  /**
   * Handles pageNotFound situation depending if path exists or not.
   * If path exists simply return the given path, else fetch the pageNotFound redirect path and return it.
   * In case there was no pageNotFound handler defined it shows an alert and returns undefined.
   * @param {any} component - the component to show the alert on
   * @param {string} path - the path to check for
   * @param {boolean} pathExists - defines if path exists or not
   * @returns the path to redirect to or undefined if path doesn't exist and no redirect path is defined
   */
  async handlePageNotFoundAndRetrieveRedirectPath(component, path, pathExists) {
    if (pathExists) {
      return path;
    }
    const redirectPath = this.getPageNotFoundRedirectResult(path).path;
    if (redirectPath !== undefined) {
      return redirectPath;
    } else {
      // default behavior if `pageNotFoundHandler` did not produce a redirect path
      this.showRouteNotFoundAlert(component, path);
      console.warn(`Could not find the requested route: ${path}`);
      return undefined;
    }
  }

  /**
   * Shows an alert on the given component given the path
   * @param {*} component - the component used to call the alert function upon
   * @param {string} path - the path to show in the alert
   * @param {boolean} isAnyPathMatched - shows whether a valid path was found / which means path was only partially wrong. Otherwise it is false.
   */
  showRouteNotFoundAlert(component, path, isAnyPathMatched = false) {
    const alertSettings = {
      text: LuigiI18N.getTranslation(isAnyPathMatched ? 'luigi.notExactTargetNode' : 'luigi.requestedRouteNotFound', {
        route: path
      }),
      type: 'error',
      ttl: 1 //how many redirections the alert will 'survive'.
    };
    component.showAlert(alertSettings, false);
  }

  // Adds and remove properties from searchParams
  modifySearchParams(params, searchParams, paramPrefix) {
    for (const [key, value] of Object.entries(params)) {
      const paramKey = paramPrefix ? `${paramPrefix}${key}` : key;

      searchParams.set(paramKey, value);
      if (value === undefined) {
        searchParams.delete(paramKey);
      }
    }
  }

  addParamsOnHashRouting(params, hash, paramPrefix) {
    let localhash = hash;
    const [hashValue, givenQueryParamsString] = localhash.split('?');
    const searchParams = new URLSearchParams(givenQueryParamsString);
    this.modifySearchParams(params, searchParams, paramPrefix);
    localhash = hashValue;
    if (searchParams.toString() !== '') {
      localhash += `?${searchParams.toString()}`;
    }
    return localhash;
  }

  /**
   * Get an url without modal data. It's necessary on page refresh or loading Luigi with modal data in a new tab
   * @param {String} searchParamsString - url search parameter as string
   * @param {String} modalParamName - modalPathParam value defined in Luigi routing settings
   * @returns {String} url search parameter as string without modal data
   */
  getURLWithoutModalData(searchParamsString, modalParamName) {
    let searchParams = new URLSearchParams(searchParamsString);
    searchParams.delete(modalParamName);
    searchParams.delete(`${modalParamName}Params`);
    return searchParams.toString();
  }

  /**
   * Extending history state object for calculation how much history entries the browser have to go back when modal will be closed.
   * @param {Object} historyState - history.state object
   * @param {Number} historyState.modalHistoryLength - will be increased when modals will be openend successively like e.g. stepping through a wizard
   * @param {Number} historyState.historygap - is the history.length at the time when the modal will be opened. It's needed for calculating how much we have to go back in the browser history when the modal will be closed.
   * @param {String} historyState.pathBeforeHistory - path before modal will be opened. It's needed for calculating how much we have to go back in the browser history when the modal will be closed.
   * @param {boolean} hashRoutingActive - true if hash routing is active, false if path routing is active
   * @param {URL} url - url object to read hash value or pathname
   * @returns {Object} history state object
   */
  handleHistoryState(historyState, path) {
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
  }

  /**
   * Deals with undefined inherited property
   * @param {Object} node - the data of node
   * @param {string} property - name of affected property
   * @param {() => void} callback - optional method to be called
   * @returns {(boolean|undefined)} true if the given props are present in node, falsy otherwise
   */
  handleInheritedProperty(node, property, callback) {
    let inheritedProperty;

    if (node) {
      if (node.tabNav && node[property] === true) {
        inheritedProperty = true;
      }

      if (node[property] === false) {
        inheritedProperty = false;
      }

      if (callback && typeof callback === 'function') {
        callback();
      }
    }

    return inheritedProperty;
  }
}

export const RoutingHelpers = new RoutingHelpersClass();
