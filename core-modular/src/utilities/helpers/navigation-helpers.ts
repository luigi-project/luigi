import type { FeatureToggles } from '../../core-api/feature-toggles';
import type { Luigi } from '../../core-api/luigi';
import type { AppSwitcher, Node, PathData } from '../../services/navigation.service';
import { AuthHelpers } from './auth-helpers';
import { GenericHelpers } from './generic-helpers';

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

  generateTooltipText: (node: any, translation: string, luigi: Luigi): string => {
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
    currentContext: Record<string, any> | {},
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
  }
};
