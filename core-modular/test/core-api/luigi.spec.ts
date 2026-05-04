import { Luigi } from '../../src/core-api/luigi';
import { NodeDataManagementService } from '../../src/services/node-data-management.service';
import { serviceRegistry } from '../../src/services/service-registry';

describe('Luigi Core API', () => {
  let luigi: Luigi;
  let engineMock: any;
  let nodeDataManagementServiceMock: any;

  beforeEach(() => {
    jest.clearAllMocks();

    engineMock = {
      init: jest.fn(),
      _ui: { update: jest.fn() }
    };

    nodeDataManagementServiceMock = {
      deleteCache: jest.fn()
    };

    jest.spyOn(serviceRegistry, 'get').mockImplementation((service: any) => {
      if (service === NodeDataManagementService) return nodeDataManagementServiceMock;
      return {} as any;
    });

    luigi = new Luigi(engineMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('clearNavigationCache', () => {
    it('should call deleteCache on NodeDataManagementService', () => {
      luigi.config = { navigation: { nodes: [] } };

      luigi.clearNavigationCache();

      expect(nodeDataManagementServiceMock.deleteCache).toHaveBeenCalled();
    });

    it('should clear titleResolver._cache on flat nodes', () => {
      const nodes = [
        { pathSegment: 'home', titleResolver: { _cache: 'cachedValue' } },
        { pathSegment: 'about', titleResolver: { _cache: 'anotherCache' } }
      ];
      luigi.config = { navigation: { nodes } };

      luigi.clearNavigationCache();

      expect(nodes[0].titleResolver._cache).toBeUndefined();
      expect(nodes[1].titleResolver._cache).toBeUndefined();
    });

    it('should clear titleResolver._cache recursively on nested children', () => {
      const nodes = [
        {
          pathSegment: 'parent',
          titleResolver: { _cache: 'parentCache' },
          children: [
            {
              pathSegment: 'child',
              titleResolver: { _cache: 'childCache' },
              children: [{ pathSegment: 'grandchild', titleResolver: { _cache: 'grandchildCache' } }]
            }
          ]
        }
      ];
      luigi.config = { navigation: { nodes } };

      luigi.clearNavigationCache();

      expect(nodes[0].titleResolver._cache).toBeUndefined();
      expect(nodes[0].children[0].titleResolver._cache).toBeUndefined();
      expect(nodes[0].children[0].children[0].titleResolver._cache).toBeUndefined();
    });

    it('should not fail when nodes have no titleResolver', () => {
      const nodes = [{ pathSegment: 'home' }, { pathSegment: 'about', titleResolver: {} }];
      luigi.config = { navigation: { nodes } };

      expect(() => luigi.clearNavigationCache()).not.toThrow();
    });

    it('should not fail when nodes have no children', () => {
      const nodes = [{ pathSegment: 'home', titleResolver: { _cache: 'value' } }];
      luigi.config = { navigation: { nodes } };

      expect(() => luigi.clearNavigationCache()).not.toThrow();
      expect(nodes[0].titleResolver._cache).toBeUndefined();
    });

    it('should handle empty nodes array', () => {
      luigi.config = { navigation: { nodes: [] } };

      expect(() => luigi.clearNavigationCache()).not.toThrow();
      expect(nodeDataManagementServiceMock.deleteCache).toHaveBeenCalled();
    });

    it('should only clear _cache and not other titleResolver properties', () => {
      const nodes = [
        {
          pathSegment: 'home',
          titleResolver: { _cache: 'cached', url: '/api/title', timeout: 5000 }
        }
      ];
      luigi.config = { navigation: { nodes } };

      luigi.clearNavigationCache();

      expect(nodes[0].titleResolver._cache).toBeUndefined();
      expect(nodes[0].titleResolver.url).toBe('/api/title');
      expect(nodes[0].titleResolver.timeout).toBe(5000);
    });
  });
});
