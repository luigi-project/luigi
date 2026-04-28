import { get } from 'lodash';
import type { FeatureToggles } from '../../core-api/feature-toggles';
import type { Luigi } from '../../core-api/luigi';
import type { AppSwitcher, Node, PathData, TitleResolver } from '../../types/navigation';
import { AuthHelpers } from './auth-helpers';
import { GenericHelpers } from './generic-helpers';
import { RoutingHelpers } from './routing-helpers';

export const NavigationHelpers = {
  normalizePath: (raw: string) => {
    if (!raw || raw.length <= 0) {
      return raw;
    }
    let value = raw;
    if (value.startsWith('#')) {
      value = value.substring(1);
    }
    if (value.startsWith('/')) {
      value = value.substring(1);
    }
    return value;
  },

  segmentMatches: (linkSegment: string, pathSegment: string, pathParams: Record<string, any> /*TODO*/): boolean => {
    if (linkSegment === pathSegment) {
      return true;
    }
    if (pathSegment.startsWith(':') && pathParams && pathParams[pathSegment.substr(1)] === linkSegment) {
      return true;
    }
    return false;
  },

  checkMatch: (route: string, nodesInPath: Array<any>, pathParams?: Record<string, any>): boolean => {
    let match = true;
    GenericHelpers.trimTrailingSlash(GenericHelpers.trimLeadingSlash(route))
      .split('/')
      .forEach((pathSegment, index) => {
        if (match) {
          if (index + 1 >= nodesInPath.length) {
            match = false;
          } else if (
            !nodesInPath[index + 1]?.pathSegment ||
            !NavigationHelpers.segmentMatches(pathSegment, nodesInPath[index + 1]?.pathSegment ?? '', pathParams ?? {})
          ) {
            match = false;
          }
        }
      });
    return match;
  },

  checkVisibleForFeatureToggles: (nodeToCheckPermission: any, featureToggles: FeatureToggles): boolean => {
    if (nodeToCheckPermission?.visibleForFeatureToggles) {
      const activeFeatureToggles: string[] = featureToggles?.getActiveFeatureToggleList() || [];

      for (const ft of nodeToCheckPermission.visibleForFeatureToggles) {
        if (ft.startsWith('!')) {
          if (activeFeatureToggles.includes(ft.slice(1))) {
            return false;
          }
        } else {
          if (!activeFeatureToggles.includes(ft)) {
            return false;
          }
        }
      }
    }

    return true;
  },

  generateTooltipText: (node: Node, translation: string, luigi: Luigi): string => {
    let ttText: boolean | string | undefined = node?.tooltipText;

    if (ttText === undefined) {
      ttText = luigi.getConfigValue('navigation.defaults.tooltipText');
    }

    switch (ttText) {
      case undefined:
        return translation;
      case false:
        return '';
      default:
        return luigi.i18n().getTranslation(ttText as string);
    }
  },

  isNodeAccessPermitted: (
    nodeToCheckPermissionFor: Node,
    parentNode: Node | undefined,
    currentContext: Record<string, any>,
    luigi: Luigi
  ): boolean => {
    if (luigi.auth().isAuthorizationEnabled()) {
      const loggedIn = AuthHelpers.isLoggedIn();
      const anon = nodeToCheckPermissionFor.anonymousAccess;

      if ((loggedIn && anon === 'exclusive') || (!loggedIn && anon !== 'exclusive' && anon !== true)) {
        return false;
      }
    }

    const featureToggles: FeatureToggles = luigi.featureToggles();

    if (!NavigationHelpers.checkVisibleForFeatureToggles(nodeToCheckPermissionFor, featureToggles)) {
      return false;
    }

    const permissionCheckerFn = luigi.getConfigValue('navigation.nodeAccessibilityResolver');

    if (typeof permissionCheckerFn !== 'function') {
      return true;
    }

    return permissionCheckerFn(nodeToCheckPermissionFor, parentNode, currentContext);
  },

  applyContext: (
    context: Record<string, any>,
    addition: Record<string, any>,
    navigationContext: any
  ): Record<string, any> => {
    if (addition) {
      for (let p in addition) {
        context[p] = addition[p];
      }
    }

    if (navigationContext && context.parentNavigationContexts) {
      context.parentNavigationContexts.unshift(navigationContext);
    }

    return context;
  },

  updateHeaderTitle: (appSwitcherData: AppSwitcher, pathData: PathData): string | undefined => {
    const appSwitcherItems = appSwitcherData?.items;
    if (appSwitcherItems && pathData) {
      let title = '';
      [...appSwitcherItems]
        .sort((el1, el2) => (el2.link || '').localeCompare(el1.link || ''))
        .some((item) => {
          let match = false;
          match = NavigationHelpers.checkMatch(item.link || '', pathData.nodesInPath ?? []);
          if (!match && item.selectionConditions && item.selectionConditions.route) {
            //TODO if pathParams are implemented
            match = NavigationHelpers.checkMatch(item.selectionConditions.route, pathData.nodesInPath ?? []);
            if (match) {
              (item.selectionConditions.contextCriteria || []).forEach((ccrit: any) => {
                match = match && (pathData?.selectedNode as any)?.context?.[ccrit.key] === ccrit.value;
              });
            }
          }
          if (match) {
            title = item.title || '';
            return true;
          }
        });
      return title;
    }
    return;
  },

  buildPath(pathToLeftNavParent: Node[], pathData?: PathData): string {
    const replacedSegments = pathToLeftNavParent.map((node) => {
      const segment = node.pathSegment;
      if (segment?.startsWith(':')) {
        const key = segment.slice(1);
        const value = pathData?.pathParams?.[key];
        if (value != null) {
          return encodeURIComponent(String(value));
        }
      }
      return segment;
    });

    return replacedSegments.join('/');
  },

  mergeContext(...objs: Record<string, any>[]): Record<string, any> {
    return Object.assign({}, ...objs);
  },

  prepareForTests(...parts: string[]): string {
    let result = '';
    parts.forEach((p) => {
      if (p) {
        result += (result ? '_' : '') + encodeURIComponent(p.toLowerCase().split(' ').join(''));
      }
    });
    return result;
  },

  /**
   * Finds the virtual tree root node for a given node by traversing up the node hierarchy until it finds a node with the virtualTree property set to true. If no such node is found, it returns undefined.
   * @param node  The node for which to find the virtual tree root node.
   * @returns The virtual tree root node if found, otherwise undefined.
   */
  findVirtualTreeRootNode(node: Node): Node | undefined {
    if (node.virtualTree) {
      return node;
    }
    if (node.parent) {
      return NavigationHelpers.findVirtualTreeRootNode(node.parent);
    }
    return undefined;
  },

  /**
   * Validates if a path exists and handles page not found cases.
   * Returns the redirect path if valid, or undefined if the path should not be followed.
   * @param path The path to validate
   * @param luigi The Luigi instance
   * @returns The redirect path if valid, undefined otherwise
   */
  validatePathAndGetRedirect: async (path: string, luigi: Luigi): Promise<string | undefined> => {
    const pathExist = await RoutingHelpers.pathExists(path, luigi);
    const redirectPath = await RoutingHelpers.handlePageNotFoundAndRetrieveRedirectPath(path, pathExist, luigi);
    return redirectPath || undefined;
  },

  async fetchNodeTitleData(node: Node, context: any): Promise<{ label: string; icon?: string }> {
    return new Promise<{ label: string; icon?: string }>((resolve, reject) => {
      if (!node.titleResolver) {
        reject(new Error('No title resolver defined at node'));
        return;
      }
      const strippedResolver = { ...node.titleResolver };
      delete strippedResolver._cache;

      const resolver = this.substituteVars(strippedResolver, context);
      const resolverString = JSON.stringify(resolver);
      if (node.titleResolver._cache) {
        if (node.titleResolver._cache.key === resolverString) {
          resolve(node.titleResolver._cache.value);
          return;
        }
      }

      const requestOptions = resolver.request;

      this._fetch(requestOptions.url, {
        method: requestOptions.method,
        headers: requestOptions.headers,
        body: JSON.stringify(requestOptions.body)
      })
        .then((response) => {
          response.json().then((data) => {
            try {
              const titleData = this.processTitleData(data, resolver);
              node.titleResolver!._cache = {
                key: resolverString,
                value: titleData
              };
              resolve(titleData);
            } catch (e) {
              reject(e);
            }
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Returns a nested property value defined by a chain string
   * @param {*} obj - the object
   * @param {*} propChain - a string defining the property chain
   * @param {*} fallback - fallback value if resolution fails
   * @returns the value or fallback
   */
  getPropertyChainValue(obj: Record<string, unknown>, propChain?: string, fallback?: any): any {
    if (!propChain || !obj) {
      return fallback;
    }
    return get(obj, propChain, fallback);
  },

  substituteVars(resolver: TitleResolver, context: Record<string, unknown>): TitleResolver {
    const resolverString = JSON.stringify(resolver);
    const resString = resolverString.replace(/\$\{[a-zA-Z0-9$_.]+\}/g, (match) => {
      const chain = match.substr(2, match.length - 3);
      return this.getPropertyChainValue(context, chain) || match;
    });
    return JSON.parse(resString);
  },

  _fetch(url: string, options: RequestInit): Promise<Response> {
    return fetch(url, options);
  },

  processTitleData(data: Record<string, unknown>, resolver: TitleResolver): { label: string; icon?: string } {
    let label = this.getPropertyChainValue(data, resolver.titlePropertyChain);
    if (label) {
      label = label.trim();
    }
    if (label && resolver.titleDecorator) {
      label = resolver.titleDecorator.replace('%s', label);
    }
    return {
      label: label || resolver.fallbackTitle,
      icon: this.getPropertyChainValue(data, resolver.iconPropertyChain, resolver.fallbackIcon)
    };
  }
};
