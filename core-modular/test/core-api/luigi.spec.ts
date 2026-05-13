import { Luigi } from '../../src/core-api/luigi';
import { GenericHelpers } from '../../src/utilities/helpers/generic-helpers';
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

  describe('getGlobalContext', () => {
    it('should return the globalContext from config', () => {
      luigi.config = { navigation: { globalContext: { tenant: 'abc', theme: 'dark' } } };

      expect(luigi.getGlobalContext()).toEqual({ tenant: 'abc', theme: 'dark' });
    });

    it('should return an empty object when globalContext is not set', () => {
      luigi.config = { navigation: {} };

      expect(luigi.getGlobalContext()).toEqual({});
    });

    it('should return an empty object when navigation is not set', () => {
      luigi.config = {};

      expect(luigi.getGlobalContext()).toEqual({});
    });

    it('should return an empty object when config is undefined', () => {
      luigi.config = undefined;

      expect(luigi.getGlobalContext()).toEqual({});
    });
  });

  describe('setGlobalContext', () => {
    it('should set globalContext on the config', () => {
      luigi.config = { navigation: {} };

      luigi.setGlobalContext({ tenant: 'xyz' });

      expect(luigi.config.navigation.globalContext).toEqual({ tenant: 'xyz' });
    });

    it('should trigger configChanged with navigation scope', () => {
      luigi.config = { navigation: {} };
      const spy = jest.spyOn(luigi, 'configChanged');

      luigi.setGlobalContext({ key: 'value' });

      expect(spy).toHaveBeenCalledWith('navigation');
    });

    it('should not trigger configChanged when preventUpdate is true', () => {
      luigi.config = { navigation: {} };
      const spy = jest.spyOn(luigi, 'configChanged');

      luigi.setGlobalContext({ key: 'value' }, true);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should overwrite existing globalContext', () => {
      luigi.config = { navigation: { globalContext: { old: 'data' } } };

      luigi.setGlobalContext({ new: 'data' });

      expect(luigi.config.navigation.globalContext).toEqual({ new: 'data' });
    });

    it('should do nothing when config is undefined', () => {
      luigi.config = undefined;

      expect(() => luigi.setGlobalContext({ key: 'value' })).not.toThrow();
    });

    it('should do nothing when navigation is not set', () => {
      luigi.config = {};

      expect(() => luigi.setGlobalContext({ key: 'value' })).not.toThrow();
    });
  });

  describe('updateContextValues', () => {
    it('should call updateContext on all microfrontend containers', () => {
      const containers = [
        { context: { existing: 'data' }, updateContext: jest.fn() },
        { context: { other: 'value' }, updateContext: jest.fn() }
      ];
      jest.spyOn(GenericHelpers, 'getNodeList').mockReturnValue(containers as any);

      luigi.updateContextValues({ userId: '123' });

      expect(containers[0].updateContext).toHaveBeenCalledWith({ existing: 'data', userId: '123' });
      expect(containers[1].updateContext).toHaveBeenCalledWith({ other: 'value', userId: '123' });
    });

    it('should not fail when containers have no updateContext method', () => {
      const containers = [{ context: {}, someOtherMethod: jest.fn() }, { context: {} }];
      jest.spyOn(GenericHelpers, 'getNodeList').mockReturnValue(containers as any);

      expect(() => luigi.updateContextValues({ key: 'val' })).not.toThrow();
    });

    it('should not fail when there are no microfrontend containers', () => {
      jest.spyOn(GenericHelpers, 'getNodeList').mockReturnValue(null as any);

      expect(() => luigi.updateContextValues({ key: 'val' })).not.toThrow();
    });
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
