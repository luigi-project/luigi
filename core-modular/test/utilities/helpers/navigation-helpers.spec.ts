import { NavigationHelpers } from '../../../src/utilities/helpers/navigation-helpers';
import type { Luigi } from '../../../src/core-api/luigi';
import { FeatureToggles } from '../../../src/core-api/feature-toggles';
import type { Node, PathData } from '../../../src/types/navigation';
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

  describe('applyContext', () => {
    it('should return provided context when no additional data is present', () => {
      const mockedContext = { data: 'store' };
      const result = NavigationHelpers.applyContext(mockedContext, null, null);

      expect(result).toEqual(mockedContext);
    });

    it('should return provided context when additional data is present', () => {
      const mockedContext = { data: 'store' };
      const mockedAddition = { foo: 'bar' };
      const result = NavigationHelpers.applyContext(mockedContext, mockedAddition, null);

      expect(result).toEqual({ ...mockedContext, ...mockedAddition });
    });
  });

  describe('findVirtualTreeRootNode', () => {
    it('should return the node itself if it is a virtual tree root', () => {
      const node: Node = { pathSegment: 'root', virtualTree: true };
      const result = NavigationHelpers.findVirtualTreeRootNode(node);
      expect(result).toBe(node);
    });

    it('should return the virtual tree root node from ancestors', () => {
      const virtualRoot: Node = { pathSegment: 'root', virtualTree: true };
      const childNode: Node = { pathSegment: 'child', parent: virtualRoot };
      const result = NavigationHelpers.findVirtualTreeRootNode(childNode);
      expect(result).toBe(virtualRoot);
    });

    it('should return undefined if no virtual tree root is found', () => {
      const node: Node = { pathSegment: 'node' };
      const result = NavigationHelpers.findVirtualTreeRootNode(node);
      expect(result).toBeUndefined();
    });
  });

  describe('getPropertyChainValue', () => {
    it('should return nested value from object', () => {
      const obj = { data: { product: { name: 'Test' } } };
      expect(NavigationHelpers.getPropertyChainValue(obj, 'data.product.name')).toBe('Test');
    });

    it('should return fallback if propChain is undefined', () => {
      expect(NavigationHelpers.getPropertyChainValue({ a: 1 }, undefined, 'fallback')).toBe('fallback');
    });

    it('should return fallback if obj is falsy', () => {
      expect(NavigationHelpers.getPropertyChainValue(null, 'a.b', 'fallback')).toBe('fallback');
    });

    it('should return fallback if path does not exist', () => {
      expect(NavigationHelpers.getPropertyChainValue({ a: 1 }, 'b.c', 'fallback')).toBe('fallback');
    });
  });

  describe('substituteVars', () => {
    it('should replace ${...} placeholders with context values', () => {
      const resolver = {
        request: { method: 'GET', url: '/api/${productId}' },
        titlePropertyChain: 'name'
      } as any;
      const context = { productId: '42' };

      const result = NavigationHelpers.substituteVars(resolver, context);

      expect(result.request.url).toBe('/api/42');
    });

    it('should keep placeholder if context value is missing', () => {
      const resolver = {
        request: { method: 'GET', url: '/api/${missing}' },
        titlePropertyChain: 'name'
      } as any;

      const result = NavigationHelpers.substituteVars(resolver, {});

      expect(result.request.url).toBe('/api/${missing}');
    });
  });

  describe('processTitleData', () => {
    it('should extract label from data using titlePropertyChain', () => {
      const data = { product: { name: '  Luigi Framework  ' } };
      const resolver = { titlePropertyChain: 'product.name' } as any;

      const result = NavigationHelpers.processTitleData(data, resolver);

      expect(result.label).toBe('Luigi Framework');
    });

    it('should apply titleDecorator', () => {
      const data = { name: 'Luigi' };
      const resolver = {
        titlePropertyChain: 'name',
        titleDecorator: 'Product: %s'
      } as any;

      const result = NavigationHelpers.processTitleData(data, resolver);

      expect(result.label).toBe('Product: Luigi');
    });

    it('should use fallbackTitle when label is not found', () => {
      const data = {};
      const resolver = {
        titlePropertyChain: 'nonexistent',
        fallbackTitle: 'Fallback'
      } as any;

      const result = NavigationHelpers.processTitleData(data, resolver);

      expect(result.label).toBe('Fallback');
    });

    it('should extract icon from data', () => {
      const data = { name: 'Test', icon: 'product' };
      const resolver = {
        titlePropertyChain: 'name',
        iconPropertyChain: 'icon',
        fallbackIcon: 'default-icon'
      } as any;

      const result = NavigationHelpers.processTitleData(data, resolver);

      expect(result.icon).toBe('product');
    });

    it('should use fallbackIcon when icon is not found', () => {
      const data = { name: 'Test' };
      const resolver = {
        titlePropertyChain: 'name',
        iconPropertyChain: 'nonexistent',
        fallbackIcon: 'default-icon'
      } as any;

      const result = NavigationHelpers.processTitleData(data, resolver);

      expect(result.icon).toBe('default-icon');
    });
  });

  describe('fetchNodeTitleData', () => {
    it('should reject if node has no titleResolver', async () => {
      const node: Node = { pathSegment: 'test' };

      await expect(NavigationHelpers.fetchNodeTitleData(node, {})).rejects.toThrow(
        'No title resolver defined at node'
      );
    });

    it('should return cached value if cache key matches', async () => {
      const cachedValue = { label: 'Cached Title', icon: 'cached-icon' };
      const titleResolver = {
        request: { method: 'GET', url: '/api/test' },
        titlePropertyChain: 'name',
        _cache: {
          key: JSON.stringify({
            request: { method: 'GET', url: '/api/test' },
            titlePropertyChain: 'name'
          }),
          value: cachedValue
        }
      };
      const node: Node = { pathSegment: 'test', titleResolver } as any;

      const result = await NavigationHelpers.fetchNodeTitleData(node, {});

      expect(result).toBe(cachedValue);
    });

    it('should fetch and resolve title data from API', async () => {
      jest.useFakeTimers();

      const apiResponse = { product: { name: 'Fetched Title' } };
      const mockResponse = {
        json: () => Promise.resolve(apiResponse)
      };
      jest.spyOn(NavigationHelpers, '_fetch').mockResolvedValue(mockResponse as any);

      const titleResolver = {
        request: { method: 'GET', url: '/api/test' },
        titlePropertyChain: 'product.name'
      };
      const node: Node = { pathSegment: 'test', titleResolver } as any;

      const promise = NavigationHelpers.fetchNodeTitleData(node, {});
      jest.advanceTimersByTime(3000);

      const result = await promise;

      expect(result.label).toBe('Fetched Title');
      expect(node.titleResolver!._cache).toEqual({
        key: expect.any(String),
        value: result
      });

      jest.useRealTimers();
    });

    it('should reject on fetch error', async () => {
      jest.useFakeTimers();

      jest.spyOn(NavigationHelpers, '_fetch').mockRejectedValue(new Error('Network error'));

      const titleResolver = {
        request: { method: 'GET', url: '/api/fail' },
        titlePropertyChain: 'name'
      };
      const node: Node = { pathSegment: 'test', titleResolver } as any;

      const promise = NavigationHelpers.fetchNodeTitleData(node, {});
      jest.advanceTimersByTime(3000);

      await expect(promise).rejects.toThrow('Network error');

      jest.useRealTimers();
    });
  });
});
