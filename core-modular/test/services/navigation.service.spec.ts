import { serviceRegistry } from '../../src/services/service-registry';
import { NavigationService, type Node } from '../../src/services/navigation.service';
import { NodeDataManagementService } from '../../src/services/node-data-management.service';
import { AsyncHelpers } from '../../src/utilities/helpers/async-helpers';

describe('NavigationService', () => {
  let luigiMock: any;
  let navigationService: NavigationService;
  let mockNodeDataManagementService: any;

  beforeEach(() => {
    luigiMock = {
      getConfigValue: jest.fn(),
      getConfig: jest.fn(),
      getAsyncConfigValue: jest.fn(),
      getConfigValueAsync: jest.fn(),
      auth: jest.fn().mockReturnValue({
        isAuthorizationEnabled: jest.fn()
      }),
      featureToggles: jest.fn().mockReturnValue({
        getActiveFeatureToggleList: jest.fn()
      })
    };
    navigationService = new NavigationService(luigiMock);

    mockNodeDataManagementService = {
      setChildren: jest.fn(),
      getChildren: jest.fn(),
      hasChildren: jest.fn(),
      setRootNode: jest.fn(),
      getRootNode: jest.fn(),
      hasRootNode: jest.fn(),
      deleteNodesRecursively: jest.fn(),
      deleteCache: jest.fn(),
      dataManagement: {} as any,
      navPath: '' as any
    };
    jest.spyOn(serviceRegistry, 'get').mockImplementation((serviceName: any) => {
      if (serviceName === NodeDataManagementService) {
        return mockNodeDataManagementService;
      }
    });
  });

  describe('NavigationService.onNodeChange', () => {
    let prevNode: Node;
    let nextNode: Node;

    beforeEach(() => {
      prevNode = { label: 'prev', children: [] };
      nextNode = { label: 'next', children: [] };
    });

    it('should call nodeChangeHook function if it is a function', () => {
      const hook = jest.fn();
      luigiMock.getConfigValue.mockReturnValue(hook);

      navigationService.onNodeChange(prevNode, nextNode);

      expect(hook).toHaveBeenCalledWith(prevNode, nextNode);
    });

    it('should not call nodeChangeHook if it is undefined', () => {
      luigiMock.getConfigValue.mockReturnValue(undefined);
      // No error should be thrown
      expect(() => navigationService.onNodeChange(prevNode, nextNode)).not.toThrow();
    });

    it('should warn if nodeChangeHook is not a function but defined', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      luigiMock.getConfigValue.mockReturnValue('notAFunction');

      navigationService.onNodeChange(prevNode, nextNode);

      expect(warnSpy).toHaveBeenCalledWith('nodeChangeHook is not a function!');
      warnSpy.mockRestore();
    });
  });

  describe('NavigationService.shouldPreventNavigation', () => {
    it('should prevent navigation if node has activation handler defined', async () => {
      const node: Node = {
        label: 'test',
        onNodeActivation: jest.fn().mockReturnValue(false)
      };

      expect(await navigationService.shouldPreventNavigation(node)).toEqual(true);
    });

    it('should not prevent navigation if node has activation handler undefined', async () => {
      const node: Node = {
        label: 'test',
        onNodeActivation: undefined
      };

      expect(await navigationService.shouldPreventNavigation(node)).toEqual(false);
    });
  });

  describe('NavigationService.shouldPreventNavigationForPath', () => {
    it('should prevent navigation for path if navigation is prevented', async () => {
      const nodepath = '/modal/path';

      navigationService.extractDataFromPath = jest.fn().mockReturnValue({ nodeObject: {}, pathData: {} });
      navigationService.shouldPreventNavigation = jest.fn().mockReturnValue(true);

      expect(await navigationService.shouldPreventNavigationForPath(nodepath)).toEqual(true);
    });

    it('should not prevent navigation for path if navigation is not prevented', async () => {
      const nodepath = '/modal/path';

      navigationService.extractDataFromPath = jest.fn().mockReturnValue({ nodeObject: {}, pathData: {} });
      navigationService.shouldPreventNavigation = jest.fn().mockReturnValue(false);

      expect(await navigationService.shouldPreventNavigationForPath(nodepath)).toEqual(false);
    });
  });

  describe('NavigationService.openViewInNewTab', () => {
    let windowOpenSpy: jest.SpyInstance;

    beforeEach(() => {
      (window as any).open = jest.fn();
      windowOpenSpy = jest.spyOn(window as any, 'open');
    });

    afterEach(() => {
      windowOpenSpy.mockRestore();
    });

    it('should open view in new tab if navigation is not prevented', async () => {
      const nodepath = '/modal/path';

      navigationService.shouldPreventNavigationForPath = jest.fn().mockReturnValue(false);

      await navigationService.openViewInNewTab(nodepath);

      expect(windowOpenSpy).toHaveBeenCalledWith(nodepath, '_blank', 'noopener,noreferrer');
    });

    it('should not open view in new tab if navigation is prevented', async () => {
      const nodepath = '/modal/path';

      navigationService.shouldPreventNavigationForPath = jest.fn().mockReturnValue(true);

      await navigationService.openViewInNewTab(nodepath);

      expect(windowOpenSpy).not.toHaveBeenCalled();
    });
  });

  // describe('NavigationService.getParentNode', () => {
  //   it('should return undefined if selectedNode is undefined', () => {
  //     const parentNode = navigationService.getParentNode(undefined, { nodesInPath: [] });
  //     expect(parentNode).toBeUndefined();
  //   });

  //   it('should return undefined if selectedNode is root node', () => {
  //     const pathData = {
  //       nodesInPath: [{}, { pathSegment: 'root' }]
  //     };
  //     const selectedNode: Node = { pathSegment: 'root', children: [] };

  //     const parentNode = navigationService.getParentNode(selectedNode, pathData);
  //     expect(parentNode).toBeUndefined();
  //   });

  //   it('should return the correct parent node', () => {
  //     const parent: Node = { pathSegment: 'parent', children: [] };
  //     const pathData = {
  //       nodesInPath: [{}, parent, { pathSegment: 'child' }]
  //     };
  //     const selectedNode: Node = { pathSegment: 'child', children: []  };

  //     const parentNode = navigationService.getParentNode(selectedNode, pathData);
  //     expect(parentNode).toBe(parent);
  //   });
  // });

  describe('NavigationService.findMatchingNode', () => {
    it('should return the matching node based on path segment', () => {
      const nodes: Node[] = [
        { pathSegment: 'home', children: [] },
        { pathSegment: 'about', children: [] }
      ];

      const matchingNode = navigationService.findMatchingNode('about', nodes);
      expect(matchingNode).toBe(nodes[1]);
    });

    it('should return undefined if no matching node is found', () => {
      const nodes: Node[] = [
        { pathSegment: 'home', children: [] },
        { pathSegment: 'about', children: [] }
      ];

      const matchingNode = navigationService.findMatchingNode('contact', nodes);
      expect(matchingNode).toBeUndefined();
    });
    it('should return undefined if nodes array is empty', () => {
      const nodes: Node[] = [];

      const matchingNode = navigationService.findMatchingNode('home', nodes);
      expect(matchingNode).toBeUndefined();
    });
  });
  describe('NavigationService.getPathData', () => {
    it('should return path data with pathParams included', async () => {
      const cfg = {
        navigation: {
          nodes: [
            {
              pathSegment: 'home',
              children: [
                {
                  pathSegment: ':id',
                  children: []
                }
              ]
            }
          ],
          globalContext: {}
        }
      };
      luigiMock.getConfig.mockReturnValue(cfg);
      luigiMock.getConfigValueAsync.mockReturnValue(cfg.navigation.nodes);

      const path = 'home/123';
      const pathData = await navigationService.getPathData(path);

      expect(pathData.pathParams).toEqual({ id: '123' });
    });
    it('should return path data with empty pathParams if no dynamic segments', async () => {
      const cfg = {
        navigation: {
          nodes: [
            {
              pathSegment: 'home',
              children: []
            }
          ],
          globalContext: {}
        }
      };
      luigiMock.getConfig.mockReturnValue(cfg);

      const path = 'home';
      const pathData = await navigationService.getPathData(path);

      expect(pathData.pathParams).toEqual({});
    });
    it('should return path data with empty pathParams if no matching nodes', async () => {
      const cfg = {
        navigation: {
          nodes: [
            {
              pathSegment: 'home',
              children: []
            }
          ],
          globalContext: {}
        }
      };
      luigiMock.getConfig.mockReturnValue(cfg);

      const path = 'unknown/path';
      const pathData = await navigationService.getPathData(path);

      expect(pathData.pathParams).toEqual({});
    });
    it('should return path data with correct selectedNode and selectedNodeChildren', async () => {
      const cfg = {
        navigation: {
          nodes: [
            {
              pathSegment: 'home',
              children: [
                {
                  pathSegment: 'dashboard',
                  children: []
                }
              ]
            }
          ],
          globalContext: {}
        }
      };
      luigiMock.getConfig.mockReturnValue(cfg);
      luigiMock.getConfigValueAsync.mockReturnValue(cfg.navigation.nodes);

      const path = 'home/dashboard';
      const pathData = await navigationService.getPathData(path);
      const expectedNode = cfg.navigation.nodes[0].children[0];
      (expectedNode as any).context = {};
      expect(pathData.selectedNode).toEqual(expectedNode);
      expect(pathData.selectedNodeChildren).toEqual([]);
    });
    it('should return path data with undefined selectedNode and rootNodes as selectedNodeChildren for unknown path', async () => {
      const cfg = {
        navigation: {
          nodes: [
            {
              pathSegment: 'home',
              children: [],
              isRootNode: true
            }
          ],
          globalContext: {}
        }
      };
      luigiMock.getConfig.mockReturnValue(cfg);
      luigiMock.getConfigValueAsync.mockReturnValue(cfg.navigation.nodes);

      const path = 'unknown/path';
      const pathData = await navigationService.getPathData(path);

      expect(pathData.selectedNode).toBeUndefined();
      expect(pathData.selectedNodeChildren).toEqual(cfg.navigation.nodes);
    });
    it('should return path data with rootNodes as selectedNodeChildren for root path', async () => {
      const cfg = {
        navigation: {
          nodes: [
            {
              pathSegment: 'home',
              children: [],
              isRootNode: true
            }
          ],
          globalContext: {}
        }
      };
      luigiMock.getConfig.mockReturnValue(cfg);
      luigiMock.getConfigValueAsync.mockReturnValue(cfg.navigation.nodes);

      const path = '';
      const pathData = await navigationService.getPathData(path);

      expect(pathData.selectedNode).toBeUndefined();
      expect(pathData.selectedNodeChildren).toEqual(cfg.navigation.nodes);
    });
    it('should handle trailing slashes in path correctly', async () => {
      const cfg = {
        navigation: {
          nodes: [
            {
              pathSegment: 'home',
              children: [
                {
                  pathSegment: 'dashboard',
                  children: []
                }
              ]
            }
          ],
          globalContext: {}
        }
      };
      luigiMock.getConfig.mockReturnValue(cfg);
      luigiMock.getConfigValueAsync.mockReturnValue(cfg.navigation.nodes);

      const path = 'home/dashboard/';
      const pathData = await navigationService.getPathData(path);
      let expectedNode = cfg.navigation.nodes[0].children[0];
      (expectedNode as any).context = {};
      expect(pathData.selectedNode).toEqual(expectedNode);
      expect(pathData.selectedNodeChildren).toEqual([]);
    });
    it('inhert context from globalContext', async () => {
      const cfg = {
        navigation: {
          nodes: [
            {
              pathSegment: 'home',
              children: []
            }
          ],
          globalContext: {
            user: 'testUser',
            theme: 'dark'
          }
        }
      };
      luigiMock.getConfig.mockReturnValue(cfg);
      luigiMock.getConfigValueAsync.mockReturnValue(cfg.navigation.nodes);

      const path = 'home';
      const pathData = await navigationService.getPathData(path);

      expect(pathData.selectedNode?.context).toEqual(cfg.navigation.globalContext);
    });
    it('should return empty context if no globalContext is defined', async () => {
      const cfg = {
        navigation: {
          nodes: [
            {
              pathSegment: 'home',
              children: []
            }
          ]
          // no globalContext
        }
      };
      luigiMock.getConfig.mockReturnValue(cfg);
      luigiMock.getConfigValueAsync.mockReturnValue(cfg.navigation.nodes);

      const path = 'home';
      const pathData = await navigationService.getPathData(path);

      expect(pathData.selectedNode?.context).toEqual({});
    });
    it('should merge globalContext with node context, node context takes precedence', async () => {
      const cfg = {
        navigation: {
          nodes: [
            {
              pathSegment: 'home',
              context: { theme: 'light' },
              children: []
            }
          ],
          globalContext: {
            user: 'testUser',
            theme: 'dark'
          }
        }
      };
      luigiMock.getConfig.mockReturnValue(cfg);
      luigiMock.getConfigValueAsync.mockReturnValue(cfg.navigation.nodes);

      const path = 'home';
      const pathData = await navigationService.getPathData(path);

      expect(pathData.selectedNode?.context).toEqual({
        user: 'testUser',
        theme: 'light'
      });
    });
    it('inhert context from parent nodes', async () => {
      const cfg = {
        navigation: {
          nodes: [
            {
              pathSegment: 'home',
              context: { region: 'US' },
              children: [
                {
                  pathSegment: 'dashboard',
                  context: { theme: 'dark' },
                  children: []
                }
              ]
            }
          ],
          globalContext: { user: 'testUser' }
        }
      };
      luigiMock.getConfig.mockReturnValue(cfg);
      luigiMock.getConfigValueAsync.mockReturnValue(cfg.navigation.nodes);

      const path = 'home/dashboard';
      const pathData = await navigationService.getPathData(path);

      expect(pathData.selectedNode?.context).toEqual({
        user: 'testUser',
        region: 'US',
        theme: 'dark'
      });
    });
  });

  describe('NavigationService.navItemClick', () => {
    it('should navigate to the given path', () => {
      const navigateSpy = jest.fn();
      luigiMock.navigation = jest.fn().mockReturnValue({
        navigate: navigateSpy
      });

      const node = {
        pathSegment: 'home',
        children: [],
        isRootNode: true
      };
      navigationService.navItemClick(node, '');

      expect(navigateSpy).toHaveBeenCalledWith('/home');
    });
    it('should not navigate if node is undefined', () => {
      const navigateSpy = jest.fn();
      luigiMock.navigation = jest.fn().mockReturnValue({
        navigate: navigateSpy
      });

      navigationService.navItemClick({}, '');

      expect(navigateSpy).not.toHaveBeenCalled();
    });
    it('should navigate to root if node has no pathSegment', () => {
      const navigateSpy = jest.fn();
      luigiMock.navigation = jest.fn().mockReturnValue({
        navigate: navigateSpy
      });

      navigationService.navItemClick({ pathSegment: 'pro', children: [] }, 'projects');

      expect(navigateSpy).toHaveBeenCalledWith('/projects/pro');
    });

    it('no rootNode marker', () => {
      const navigateSpy = jest.fn();
      luigiMock.navigation = jest.fn().mockReturnValue({
        navigate: navigateSpy
      });
      navigationService.navItemClick({ pathSegment: 'pro', children: [] }, '');
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('no rootNode marker 2', () => {
      const navigateSpy = jest.fn();
      luigiMock.navigation = jest.fn().mockReturnValue({
        navigate: navigateSpy
      });
      navigationService.navItemClick({ pathSegment: 'pro', children: [] }, '      ');
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should handle parentPath without trailing slash correctly', () => {
      const navigateSpy = jest.fn();
      luigiMock.navigation = jest.fn().mockReturnValue({
        navigate: navigateSpy
      });

      const node = {
        pathSegment: 'home',
        children: [],
        isRootNode: true
      };
      navigationService.navItemClick(node, 'parent');

      expect(navigateSpy).toHaveBeenCalledWith('/parent/home');
    });
  });
  describe('NavigationService.handleNavigationRequest', () => {
    let modalServiceMock: { closeModals: jest.Mock };
    beforeEach(() => {
      modalServiceMock = {
        closeModals: jest.fn()
      };
      jest.spyOn(serviceRegistry, 'get').mockReturnValue(modalServiceMock);
      navigationService = new NavigationService(luigiMock);
    });

    it('should call openAsModal if modalSettings are provided', async () => {
      const openAsModalMock = jest.fn();
      luigiMock.navigation = jest.fn().mockReturnValue({ openAsModal: openAsModalMock });

      await navigationService.handleNavigationRequest('/modal/path', undefined, { size: 'l' }, false, false, jest.fn());

      expect(openAsModalMock).toHaveBeenCalledWith('/modal/path', { size: 'l' }, expect.any(Function));
    });

    it('should close modals and update history if no modalSettings and not using hash routing', async () => {
      luigiMock.getConfig.mockReturnValue({ routing: { useHashRouting: false } });
      const pushStateSpy = jest.spyOn(window.history, 'pushState').mockImplementation(() => {});
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true);

      await navigationService.handleNavigationRequest('/normal/path');

      expect(modalServiceMock.closeModals).toHaveBeenCalled();
      expect(pushStateSpy).toHaveBeenCalledWith({ path: '/normal/path' }, '', '/normal/path');
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent));

      pushStateSpy.mockRestore();
      dispatchEventSpy.mockRestore();
    });

    it('should set location.hash if useHashRouting is true', async () => {
      luigiMock.getConfig.mockReturnValue({ routing: { useHashRouting: true } });
      const originalHash = window.location.hash;
      await navigationService.handleNavigationRequest('/hash/path');

      expect(window.location.hash).toBe('#/hash/path');

      window.location.hash = originalHash;
    });

    it('should navigate to a path in new browser tab', async () => {
      const openViewInNewTabSpy = jest.spyOn(navigationService, 'openViewInNewTab');
      const pushStateSpy = jest.spyOn(window.history, 'pushState');
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      navigationService.shouldPreventNavigationForPath = jest.fn().mockReturnValue(false);

      await navigationService.handleNavigationRequest('/test/path', undefined, undefined, true);

      expect(modalServiceMock.closeModals).toHaveBeenCalled();
      expect(openViewInNewTabSpy).toHaveBeenCalledWith('/test/path');
      expect(pushStateSpy).not.toHaveBeenCalled();
      expect(dispatchEventSpy).not.toHaveBeenCalled();
    });

    it('should close modals and update history if no modalSettings and using withoutSync', async () => {
      luigiMock.getConfig.mockReturnValue({ routing: { useHashRouting: false } });
      const pushStateSpy = jest.spyOn(window.history, 'pushState').mockImplementation(() => {});
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true);

      await navigationService.handleNavigationRequest('/normal/path', undefined, undefined, false, true);

      expect(modalServiceMock.closeModals).toHaveBeenCalled();
      expect(pushStateSpy).toHaveBeenCalledWith({ path: '/normal/path' }, '', '/normal/path');
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent<{
        preventContextUpdate: boolean;
        withoutSync: boolean;
      }>));

      const dispatchedEvent = dispatchEventSpy.mock.calls[0][0] as CustomEvent;

      expect(dispatchedEvent.type).toEqual('popstate');
      expect(dispatchedEvent.detail).toEqual({ preventContextUpdate: false, withoutSync: true });

      pushStateSpy.mockRestore();
      dispatchEventSpy.mockRestore();
    });
  });

  describe('NavigationService.buildNavItems', () => {
    it('should return empty array if nodes is empty', () => {
      const pathData = {
        selectedNode: undefined,
        selectedNodeChildren: [],
        nodesInPath: [],
        rootNodes: [],
        pathParams: {}
      };
      const items = navigationService.buildNavItems([], undefined, pathData);
      expect(items).toEqual([]);
    });

    it('should mark selected node as selected', () => {
      const node1: Node = { pathSegment: 'node1', label: 'Node 1', children: [] };
      const node2: Node = { pathSegment: 'node2', label: 'Node 2', children: [] };
      const selectedNode: Node = node2;
      luigiMock.i18n = jest.fn().mockReturnValue({ getTranslation: (key: string) => key });
      const pathData = {
        selectedNode,
        selectedNodeChildren: [node1, node2],
        nodesInPath: [],
        rootNodes: [node1, node2],
        pathParams: {}
      };
      const items = navigationService.buildNavItems([node1, node2], selectedNode, pathData);
      expect(items).toEqual([
        {
          altText: undefined,
          icon: undefined,
          label: 'Node 1',
          node: node1,
          selected: false,
          tooltip: 'Node 1'
        },
        {
          altText: undefined,
          icon: undefined,
          label: 'Node 2',
          node: node2,
          selected: true,
          tooltip: 'Node 2'
        }
      ]);
    });

    it('should group nodes by category', () => {
      const category = { id: 'cat1', label: 'Category 1' };
      const node1: Node = { pathSegment: 'node1', label: 'Node 1', category, children: [] };
      const node2: Node = { pathSegment: 'node2', label: 'Node 2', category, children: [] };
      luigiMock.i18n = jest.fn().mockReturnValue({ getTranslation: (key: string) => key });
      const pathData = {
        selectedNode: undefined,
        selectedNodeChildren: [node1, node2],
        nodesInPath: [],
        rootNodes: [node1, node2],
        pathParams: {}
      };
      const items = navigationService.buildNavItems([node1, node2], undefined, pathData);
      expect(items.length).toBe(1);
      expect(items[0].category?.id).toBe('cat1');
      expect(items[0].category?.nodes?.length).toBe(2);
    });

    it('test translated category label', () => {
      const category = { id: 'cat1', label: 'Category 1' };
      const node1: Node = { pathSegment: 'node1', label: 'Node 1', category, children: [] };
      luigiMock.i18n = jest.fn().mockReturnValue({ getTranslation: (key: string) => 'Translated ' + key });
      const pathData = {
        selectedNode: undefined,
        selectedNodeChildren: [node1],
        nodesInPath: [],
        rootNodes: [node1],
        pathParams: {}
      };
      const items = navigationService.buildNavItems([node1], undefined, pathData);
      expect(items.length).toBe(1);
      expect(items[0].category?.label).toBe('Translated Category 1');
    });
    it('translated node label and tooltip', () => {
      const node1: Node = { pathSegment: 'node1', label: 'Node 1', tooltipText: 'Tooltip 1', children: [] };
      luigiMock.i18n = jest.fn().mockReturnValue({ getTranslation: (key: string) => 'Translated ' + key });
      const pathData = {
        selectedNode: undefined,
        selectedNodeChildren: [node1],
        nodesInPath: [],
        rootNodes: [node1],
        pathParams: {}
      };
      const items = navigationService.buildNavItems([node1], undefined, pathData);
      expect(items.length).toBe(1);
      expect(items[0].label).toBe('Translated Node 1');
      expect(items[0].tooltip).toBe('Translated Tooltip 1');
    });
  });

  describe('NavigationService.getChildren', () => {
    let getAccessibleNodesSpy: jest.SpyInstance;
    beforeEach(() => {
      navigationService = new NavigationService(luigiMock);
      getAccessibleNodesSpy = jest.spyOn(navigationService as any, 'getAccessibleNodes');
    });
    it('should return children from NodeDataManagementService if available', async () => {
      const node: Node = { pathSegment: 'parent', label: 'Parent', children: [] };
      const children: Node[] = [
        { pathSegment: 'child1', label: 'Child 1', children: [] },
        { pathSegment: 'child2', label: 'Child 2', children: [] }
      ];

      mockNodeDataManagementService.hasChildren.mockReturnValue(true);
      mockNodeDataManagementService.getChildren.mockReturnValue({ children });
      getAccessibleNodesSpy.mockReturnValue(children);

      const result = await navigationService.getChildren(node);

      expect(getAccessibleNodesSpy).toHaveBeenCalledWith(node, children, {});
      expect(mockNodeDataManagementService.getChildren).toHaveBeenCalledWith(node);
      expect(result).toBe(children);
    });

    it('should return empty array if no children in NodeDataManagementService and no static children', async () => {
      const node: Node = { pathSegment: 'parent', label: 'Parent', children: [] };
      mockNodeDataManagementService.getChildren.mockResolvedValue(undefined);
      mockNodeDataManagementService.hasChildren.mockReturnValue(true);

      const result = await navigationService.getChildren(node);

      expect(mockNodeDataManagementService.getChildren).toHaveBeenCalledWith(node);
      expect(result).toEqual([]);
    });

    it('should return static children if no children in NodeDataManagementService', async () => {
      const staticChildren: Node[] = [
        { pathSegment: 'child1', label: 'Child 1', children: [] },
        { pathSegment: 'child2', label: 'Child 2', children: [] }
      ];
      const topNodes: Node[] = [
        { pathSegment: 'top1', label: 'Top 1', children: staticChildren },
        { pathSegment: 'top2', label: 'Top 2', children: staticChildren }
      ];
      jest.spyOn(AsyncHelpers, 'getConfigValueFromObjectAsync').mockResolvedValue(staticChildren);
      const expandSpy = jest.spyOn(navigationService, 'getExpandStructuralPathSegment');
      const bindChildToParent = jest.spyOn(navigationService, 'bindChildToParent');
      mockNodeDataManagementService.hasChildren.mockReturnValue(false);
      mockNodeDataManagementService.getChildren.mockResolvedValue(undefined);

      const result = await navigationService.getChildren({ children: topNodes }, {});

      expect(expandSpy).toHaveBeenCalledTimes(staticChildren.length);
      expect(bindChildToParent).toHaveBeenCalledTimes(staticChildren.length);

      expect(mockNodeDataManagementService.setChildren).toHaveBeenCalled();
      expect(result[0].pathSegment).toBe(staticChildren[0].pathSegment);
    });
  });

  describe('Navigation.getExpandStructuralPathSegment', () => {
    it('should expand structural path segment', async () => {
      const node: Node = {
        pathSegment: 'node',
        label: 'Node',
        children: []
      };
      const result = await navigationService.getExpandStructuralPathSegment(node);
      expect(result).toBe(node);
    });
    it('should expand structural when node is a virtual tree', async () => {
      const node: Node = {
        pathSegment: 'path/to/virtualNode',
        label: 'Virtual Node',
        children: [],
        viewUrl: 'virtual.html'
      };
      const result = await navigationService.getExpandStructuralPathSegment(node);
      expect(result.children?.[0]?.pathSegment).toBe('to');
      expect(result.children?.[0]?.children?.[0]?.pathSegment).toBe('virtualNode');
    });
  });

  describe('Navigation.bindChildToParent', () => {
    it('should bind child to parent node', () => {
      const childNode: Node = {
        pathSegment: 'child',
        label: 'Child Node',
        children: []
      };
      const parentNode: Node = {
        pathSegment: 'parent',
        label: 'Parent Node',
        children: [childNode]
      };

      navigationService.bindChildToParent(childNode, parentNode);

      expect(childNode['parent']).toBe(parentNode);
    });
    it('should not fail if parent node has no children', () => {
      const childNode: Node = {
        label: 'Child Node',
        pathSegment: 'child'
      };
      const parentNode: Node = {
        label: 'Parent Node'
      };

      navigationService.bindChildToParent(childNode, parentNode);

      expect(childNode.parent).toBeUndefined();
      expect(childNode).toBe(childNode);
    });
  });
});
