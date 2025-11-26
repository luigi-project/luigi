import type { PathData } from '../../../src/services/navigation.service';
import { NavigationHelpers } from '../../../src/utilities/helpers/navigation-helpers';
import { type Node } from '../../../src/services/navigation.service';
import type { Luigi } from '../../../src/core-api/luigi';
import { FeatureToggles } from '../../../src/core-api/feature-toggles';
import { AuthHelpers } from '../../../src/utilities/helpers/auth-helpers';

describe('Navigation-helpers', () => {
  it('should normalize path', () => {
    const rawPath = '#/some/path';
    const normalizedPath = NavigationHelpers.normalizePath(rawPath);
    expect(normalizedPath).toEqual('some/path');
  });

  it('should match segments correctly', () => {
    const linkSegment = 'test';
    const pathSegment = ':id';
    const pathParams = { id: 'test' };
    const matches = NavigationHelpers.segmentMatches(linkSegment, pathSegment, pathParams);
    expect(matches).toBe(true);
  });

  it('should check route match w/o pathParams', () => {
    const route = '/some/test/path';
    const nodesInPath = [{}, { pathSegment: 'some' }, { pathSegment: 'test' }, { pathSegment: 'path' }];

    const result = NavigationHelpers.checkMatch(route, nodesInPath);
    expect(result).toBe(true);
  });

  it('should update header title based on app switcher data', () => {
    const appSwitcherData = {
      items: [
        { link: '/some/test/path', title: 'Test App' },
        { link: '/another/app', title: 'Another App' }
      ]
    };
    const pathData = {
      nodesInPath: [
        { pathSegment: 'some', children: [] },
        { pathSegment: 'test', children: [] },
        { pathSegment: 'path', children: [] }
      ],
      rootNodes: []
    };

    const result = NavigationHelpers.updateHeaderTitle(appSwitcherData, pathData as unknown as PathData);
    expect(result).toEqual('');
  });

  describe('isNodeAccessPermitted', () => {
    let permChecker: unknown = undefined;
    let authEnabled = true;
    const parentNode: Node = {
      pathSegment: 'home'
    };
    const featureToggles = new FeatureToggles();
    const luigiMock: Luigi = {
      auth: () => {
        return {
          isAuthorizationEnabled: () => {
            return authEnabled;
          }
        };
      },
      featureToggles: () => {
        return featureToggles;
      },
      getConfigValue: (key: string) => {
        if (key === 'navigation.nodeAccessibilityResolver') {
          return permChecker;
        }
      }
    } as unknown as Luigi;

    it('auth enabled, no FT', () => {
      authEnabled = true;
      const node: Node = {
        pathSegment: 'first'
      };
      jest.spyOn(AuthHelpers, 'isLoggedIn').mockReturnValue(true);

      expect(NavigationHelpers.isNodeAccessPermitted(node, parentNode, {}, luigiMock)).toEqual(true);

      node.anonymousAccess = 'exclusive';
      expect(NavigationHelpers.isNodeAccessPermitted(node, parentNode, {}, luigiMock)).toEqual(false);

      jest.spyOn(AuthHelpers, 'isLoggedIn').mockReturnValue(false);
      expect(NavigationHelpers.isNodeAccessPermitted(node, parentNode, {}, luigiMock)).toEqual(true);
      expect(NavigationHelpers.isNodeAccessPermitted(parentNode, undefined, {}, luigiMock)).toEqual(false);
    });

    it('auth disable, custom permission checker', () => {
      authEnabled = false;
      permChecker = (node: Node) => {
        if (node.pathSegment === 'notPermitted') {
          return false;
        }
        return 'perm checker result';
      };
      const node: Node = {
        pathSegment: 'first'
      };
      jest.spyOn(AuthHelpers, 'isLoggedIn').mockReturnValue(false);

      expect(NavigationHelpers.isNodeAccessPermitted(node, parentNode, {}, luigiMock)).toEqual('perm checker result');
      node.pathSegment = 'notPermitted';
      expect(NavigationHelpers.isNodeAccessPermitted(node, parentNode, {}, luigiMock)).toEqual(false);

      node.pathSegment = 'first';
      expect(NavigationHelpers.isNodeAccessPermitted(node, parentNode, {}, luigiMock)).toBeTruthy();
      node.visibleForFeatureToggles = ['myFt'];
      expect(NavigationHelpers.isNodeAccessPermitted(node, parentNode, {}, luigiMock)).toEqual(false);
      featureToggles.setFeatureToggle('myFt');
      expect(NavigationHelpers.isNodeAccessPermitted(node, parentNode, {}, luigiMock)).toBeTruthy();
    });
  });

  it('prepareForTests', () => {
    expect(NavigationHelpers.prepareForTests(undefined as unknown as string)).toEqual('');
    expect(NavigationHelpers.prepareForTests('Whatever It', 'Takes')).toEqual('whateverit_takes');
  });
});
