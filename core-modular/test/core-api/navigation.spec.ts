import { Navigation } from '../../src/core-api/navigation';
import { ModalService } from '../../src/services/modal.service';
import { NavigationService } from '../../src/services/navigation.service';
import { RoutingService } from '../../src/services/routing.service';
import { serviceRegistry } from '../../src/services/service-registry';
import type { NavigationRequestParams, Node } from '../../src/types/navigation';

describe('Navigation', () => {
  let luigiMock: any;
  let navigation: Navigation;
  let mockNavService: any;
  let routingServiceMock: RoutingService;
  let modalServiceMock: any;
  let options: {
    fromContext?: any;
    fromClosestContext?: boolean;
    fromVirtualTreeRoot?: boolean;
    fromParent?: boolean;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    luigiMock = {
      getConfig: jest.fn().mockReturnValue({ routing: { useHashRouting: false } }),
      getConfigValue: jest.fn(),
      getEngine: jest.fn().mockReturnValue({
        _ui: {
          openModal: jest.fn(),
          openDrawer: jest.fn()
        }
      })
    };

    mockNavService = {
      getCurrentNode: jest.fn(),
      openViewInNewTab: jest.fn(),
      handleNavigationRequest: jest.fn()
    };

    modalServiceMock = {
      closeModals: jest.fn().mockResolvedValue(undefined), // ensure async resolves
      getModalStackLength: jest.fn().mockReturnValue(0),
      getModalSettings: jest.fn().mockReturnValue({}),
      registerModal: jest.fn(),
      clearModalStack: jest.fn(),
      updateLastModalSettings: jest.fn(),
      _modalStack: [],
      modalSettings: {}
    };

    jest.spyOn(serviceRegistry, 'get').mockReturnValue(mockNavService);
    routingServiceMock = new RoutingService(luigiMock);
    jest.spyOn(serviceRegistry, 'get').mockImplementation((service: any) => {
      if (service === ModalService) return modalServiceMock;
      if (service === NavigationService) return mockNavService;
      if (service === RoutingService) return routingServiceMock;
      return {} as any;
    });
    navigation = new Navigation(luigiMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('navigate with pathRouting enabled', () => {
    it('should open a path as modal', async () => {
      // make async
      const openModalSpy = jest.spyOn(luigiMock.getEngine()._ui, 'openModal');
      mockNavService.getCurrentNode.mockReturnValue({ pathSegment: 'home', label: 'Test Modal', children: [] });
      const modalSettings = { title: 'Custom Modal Title' };

      await navigation.openAsModal('/modal/path', modalSettings); // await

      expect(openModalSpy).toHaveBeenCalledWith(
        luigiMock,
        { pathSegment: 'home', label: 'Test Modal', children: [] },
        modalSettings,
        undefined
      );
    });
  });
  describe('navigate with hashRouting enabled', () => {
    beforeEach(() => {
      luigiMock.getConfig = jest.fn().mockReturnValue({ routing: { useHashRouting: true } });
      navigation = new Navigation(luigiMock);
    });
    it('should open a path as modal', async () => {
      // make async
      const openModalSpy = jest.spyOn(luigiMock.getEngine()._ui, 'openModal');
      mockNavService.getCurrentNode.mockReturnValue({ label: 'Test Modal', children: [] });
      const modalSettings = { title: 'Custom Modal Title' };

      await navigation.openAsModal('/modal/hashpath', modalSettings); // await

      expect(openModalSpy).toHaveBeenCalledWith(
        luigiMock,
        { label: 'Test Modal', children: [] },
        modalSettings,
        undefined
      );
    });
  });
  describe('openAsModal', () => {
    it('should set modal title from node label if not provided', async () => {
      // async
      const openModalSpy = jest.spyOn(luigiMock.getEngine()._ui, 'openModal');
      mockNavService.getCurrentNode.mockReturnValue({ label: 'Node Label', children: [] });

      await navigation.openAsModal('/modal/path', {}); // await

      expect(openModalSpy).toHaveBeenCalledWith(
        luigiMock,
        { label: 'Node Label', children: [] },
        { title: 'Node Label' },
        undefined
      );
    });
    it('should append modal data to URL if configured', async () => {
      // async
      luigiMock.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'routing.showModalPathInUrl') return true;
        return null;
      });
      const appendModalDataToUrlSpy = jest.spyOn(routingServiceMock, 'appendModalDataToUrl');
      mockNavService.getCurrentNode.mockReturnValue({ label: 'Node Label', children: [] });
      navigation.routingService = routingServiceMock;

      await navigation.openAsModal('/modal/path', { title: 'Modal Title' }); // await

      expect(appendModalDataToUrlSpy).toHaveBeenCalledWith('/modal/path', { title: 'Modal Title' });
    });
  });
  describe('openAsDrawer', () => {
    it('should set drawer title from node label if not provided', async () => {
      const openDrawerSpy = jest.spyOn(luigiMock.getEngine()._ui, 'openDrawer');
      await mockNavService.getCurrentNode.mockReturnValue({ label: 'Node Label', children: [] });

      await navigation.openAsDrawer('/drawer/path', {});

      expect(openDrawerSpy).toHaveBeenCalled();
      expect(openDrawerSpy).toHaveBeenCalledWith(
        luigiMock,
        { label: 'Node Label', children: [] },
        { title: 'Node Label' },
        undefined
      );
    });
    it('should open drawer with provided settings', async () => {
      const openDrawerSpy = jest.spyOn(luigiMock.getEngine()._ui, 'openDrawer');
      await mockNavService.getCurrentNode.mockReturnValue({ label: 'Node Label', children: [] }); // FIX
      const drawerSettings = { title: 'Custom Drawer Title' };

      await navigation.openAsDrawer('/drawer/path', drawerSettings);
      expect(openDrawerSpy).toHaveBeenCalled();
      expect(openDrawerSpy).toHaveBeenCalledWith(
        luigiMock,
        { label: 'Node Label', children: [] },
        drawerSettings,
        undefined
      );
    });
  });

  describe('runTimeErrorHandler', () => {
    it('should trigger runtime error handler when it is set for current node', async () => {
      const currentNode = {
        label: 'Node Label',
        runTimeErrorHandler: {
          errorFn: (obj: any, node: Node) => {
            return { obj, node };
          }
        }
      };
      const defaultRunTimeErrorHandler = undefined;
      const errorFnSpy = jest.spyOn(currentNode.runTimeErrorHandler, 'errorFn');
      const errorObj = { msg: 'error' };

      await mockNavService.getCurrentNode.mockReturnValue(currentNode);
      luigiMock.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'navigation.defaults.runTimeErrorHandler') return defaultRunTimeErrorHandler;
        return null;
      });

      await navigation.runTimeErrorHandler(errorObj);

      expect(errorFnSpy).toHaveBeenCalled();
      expect(errorFnSpy).toHaveBeenCalledWith({ msg: 'error' }, currentNode);
    });

    it('should trigger runtime error handler when it is not set for current node, but config fallback exists', async () => {
      const currentNode = { label: 'Node Label' };
      const defaultRunTimeErrorHandler = {
        errorFn: (obj: any, node: Node) => {
          return { obj, node };
        }
      };
      const errorFnSpy = jest.spyOn(defaultRunTimeErrorHandler, 'errorFn');
      const errorObj = { msg: 'error2' };

      await mockNavService.getCurrentNode.mockReturnValue(currentNode);
      luigiMock.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'navigation.defaults.runTimeErrorHandler') return defaultRunTimeErrorHandler;
        return null;
      });

      await navigation.runTimeErrorHandler(errorObj);

      expect(errorFnSpy).toHaveBeenCalled();
      expect(errorFnSpy).toHaveBeenCalledWith({ msg: 'error2' }, currentNode);
    });
  });

  describe('navigate', () => {
    it('check parameter for navigate function', () => {
      const handleNavigationRequestSpy = jest.spyOn(mockNavService, 'handleNavigationRequest');
      const navRequestParams: NavigationRequestParams = {
        modalSettings: { title: 'Modal Title' },
        newTab: false,
        path: '/test/path',
        preserveView: 'preserveViewValue',
        preventContextUpdate: false,
        preventHistoryEntry: false,
        withoutSync: false,
        options: {
          fromVirtualTreeRoot: false,
          fromContext: null,
          fromClosestContext: false,
          fromParent: false
        }
      };

      navigation.navigate(
        '/test/path',
        'preserveViewValue',
        { title: 'Modal Title' },
        { splitView: true },
        { drawer: true }
      );

      expect(handleNavigationRequestSpy).toHaveBeenCalledWith(navRequestParams, undefined);
    });
  });
});
