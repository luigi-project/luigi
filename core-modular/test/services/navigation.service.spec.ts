import { NavigationService, type Node } from '../../src/services/navigation.service';

describe('NavigationService', () => {
  let luigiMock: any;
  let navigationService: NavigationService;

  beforeEach(() => {
    luigiMock = {
      getConfigValue: jest.fn(),
      getConfig: jest.fn()
    };
    navigationService = new NavigationService(luigiMock);
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
    it('should return path data with pathParams included', () => {
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

      const path = 'home/123';
      const pathData = navigationService.getPathData(path);

      expect(pathData.pathParams).toEqual({ id: '123' });
    });
    it('should return path data with empty pathParams if no dynamic segments', () => {
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
      const pathData = navigationService.getPathData(path);

      expect(pathData.pathParams).toEqual({});
    });
    it('should return path data with empty pathParams if no matching nodes', () => {
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
      const pathData = navigationService.getPathData(path);

      expect(pathData.pathParams).toEqual({});
    });
    it('should return path data with correct selectedNode and selectedNodeChildren', () => {
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

      const path = 'home/dashboard';
      const pathData = navigationService.getPathData(path);
      const expectedNode = cfg.navigation.nodes[0].children[0];
      (expectedNode as any).context = {};
      expect(pathData.selectedNode).toEqual(expectedNode);
      expect(pathData.selectedNodeChildren).toEqual([]);
    });
    it('should return path data with undefined selectedNode and rootNodes as selectedNodeChildren for unknown path', () => {
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
      const pathData = navigationService.getPathData(path);

      expect(pathData.selectedNode).toBeUndefined();
      expect(pathData.selectedNodeChildren).toEqual(cfg.navigation.nodes);
    });
    it('should return path data with rootNodes as selectedNodeChildren for root path', () => {
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

      const path = '';
      const pathData = navigationService.getPathData(path);

      expect(pathData.selectedNode).toBeUndefined();
      expect(pathData.selectedNodeChildren).toEqual(cfg.navigation.nodes);
    });
    it('should handle trailing slashes in path correctly', () => {
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

      const path = 'home/dashboard/';
      const pathData = navigationService.getPathData(path);
      let expectedNode = cfg.navigation.nodes[0].children[0];
      (expectedNode as any).context = {};
      expect(pathData.selectedNode).toEqual(expectedNode);
      expect(pathData.selectedNodeChildren).toEqual([]);
    });
    it('inhert context from globalContext', () => {
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

      const path = 'home';
      const pathData = navigationService.getPathData(path);

      expect(pathData.selectedNode?.context).toEqual(cfg.navigation.globalContext);
    });
    it('should return empty context if no globalContext is defined', () => {
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

      const path = 'home';
      const pathData = navigationService.getPathData(path);

      expect(pathData.selectedNode?.context).toEqual({});
    });
    it('should merge globalContext with node context, node context takes precedence', () => {
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

      const path = 'home';
      const pathData = navigationService.getPathData(path);

      expect(pathData.selectedNode?.context).toEqual({
        user: 'testUser',
        theme: 'light'
      });
    });
    it('inhert context from parent nodes', () => {
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

      const path = 'home/dashboard';
      const pathData = navigationService.getPathData(path);

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
        children: []
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

      expect(navigateSpy).toHaveBeenCalledWith('/');
    });
    it('should navigate to root if node has no pathSegment', () => {
      const navigateSpy = jest.fn();
      luigiMock.navigation = jest.fn().mockReturnValue({
        navigate: navigateSpy
      });

      navigationService.navItemClick({ pathSegment: 'pro', children: [] }, '/projects');

      expect(navigateSpy).toHaveBeenCalledWith('/projects/pro');
    });
  });
});
