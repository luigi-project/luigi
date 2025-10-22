import { featureToggles } from '../../core-api/featuretoggles';
import type { Luigi } from '../../core-api/luigi';
import type { AppSwitcher, PathData } from '../../services/navigation.service';
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

  checkVisibleForFeatureToggles: (nodeToCheckPermission: any): boolean => {
    if (nodeToCheckPermission?.visibleForFeatureToggles) {
      const activeFeatureToggles: string[] = featureToggles.getActiveFeatureToggleList();

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

  isNodeAccessPermitted: (
    nodeToCheckPermissionFor: any,
    parentNode: any,
    currentContext: any,
    luigi: Luigi
  ): boolean => {
    if (luigi.auth().isAuthorizationEnabled()) {
      const loggedIn = AuthHelpers.isLoggedIn();
      const anon = nodeToCheckPermissionFor.anonymousAccess;

      if ((loggedIn && anon === 'exclusive') || (!loggedIn && anon !== 'exclusive' && anon !== true)) {
        return false;
      }
    }

    if (!NavigationHelpers.checkVisibleForFeatureToggles(nodeToCheckPermissionFor)) return false;

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
                match = match && (pathData?.selectedNode as any)?.context[ccrit.key] === ccrit.value;
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
  }
};
