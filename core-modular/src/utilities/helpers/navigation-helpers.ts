import { get } from 'lodash';
import { GenericHelpers } from './generic-helpers';
import type { AppSwitcher, PathData } from '../../services/navigation.service';

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

  updateHeaderTitle: (appSwitcherData: AppSwitcher, pathData: PathData): String | undefined => {
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
                match = match && get((pathData.selectedNode as any)?.context, ccrit.key) === ccrit.value;
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
