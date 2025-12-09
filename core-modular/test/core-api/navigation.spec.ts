import { Navigation } from '../../src/core-api/navigation';
import { ModalService } from '../../src/services/modal.service';
import { NavigationService } from '../../src/services/navigation.service';
import { RoutingService } from '../../src/services/routing.service';
import { serviceRegistry } from '../../src/services/service-registry';

describe('Navigation', () => {
  let luigiMock: any;
  let navigation: Navigation;
  let mockNavService: any;
  let routingServiceMock: RoutingService;
  let modalServiceMock: any;

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
      getCurrentNode: jest.fn()
    };

    modalServiceMock = {
      closeModals: jest.fn()
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
    it('should navigate to a path without modal', () => {
      const pushStateSpy = jest.spyOn(window.history, 'pushState');
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      navigation.navigate('/test/path');
      expect(modalServiceMock.closeModals).toHaveBeenCalled();
      expect(pushStateSpy).toHaveBeenCalledWith({ path: '/test/path' }, '', '/test/path');
      expect(dispatchEventSpy).toHaveBeenCalled();
    });
    it('should open a path as modal', () => {
      const openModalSpy = jest.spyOn(luigiMock.getEngine()._ui, 'openModal');
      mockNavService.getCurrentNode.mockReturnValue({ pathSegment: 'home', label: 'Test Modal', children: [] }); // FIX
      const modalSettings = { title: 'Custom Modal Title' };

      navigation.openAsModal('/modal/path', modalSettings);

      expect(openModalSpy).toHaveBeenCalled();
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
    it('should navigate to a path without modal', () => {
      const pushStateSpy = jest.spyOn(window.history, 'pushState');
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      navigation.navigate('/test/hashpath');
      expect(modalServiceMock.closeModals).toHaveBeenCalled();
      expect(pushStateSpy).not.toHaveBeenCalled();
      expect(window.location.hash).toBe('#/test/hashpath');
      expect(dispatchEventSpy).not.toHaveBeenCalled();
    });
    it('should open a path as modal', () => {
      const openModalSpy = jest.spyOn(luigiMock.getEngine()._ui, 'openModal');
      mockNavService.getCurrentNode.mockReturnValue({ label: 'Test Modal', children: [] }); // FIX
      const modalSettings = { title: 'Custom Modal Title' };

      navigation.openAsModal('/modal/hashpath', modalSettings);

      expect(openModalSpy).toHaveBeenCalled();
      expect(openModalSpy).toHaveBeenCalledWith(
        luigiMock,
        { label: 'Test Modal', children: [] },
        modalSettings,
        undefined
      );
    });
  });
  describe('openAsModal', () => {
    it('should set modal title from node label if not provided', () => {
      const openModalSpy = jest.spyOn(luigiMock.getEngine()._ui, 'openModal');
      mockNavService.getCurrentNode.mockReturnValue({ label: 'Node Label', children: [] }); // FIX

      navigation.openAsModal('/modal/path', {});

      expect(openModalSpy).toHaveBeenCalled();
      expect(openModalSpy).toHaveBeenCalledWith(
        luigiMock,
        { label: 'Node Label', children: [] },
        { title: 'Node Label' },
        undefined
      );
    });
    it('should append modal data to URL if configured', () => {
      luigiMock.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'routing.showModalPathInUrl') return true;
        return null;
      });
      const appendModalDataToUrlSpy = jest.spyOn(routingServiceMock, 'appendModalDataToUrl');
      mockNavService.getCurrentNode.mockReturnValue({ label: 'Node Label', children: [] });
      navigation.routingService = routingServiceMock;

      navigation.openAsModal('/modal/path', { title: 'Modal Title' });

      expect(appendModalDataToUrlSpy).toHaveBeenCalledWith('/modal/path', { title: 'Modal Title' });
    });
  });
  describe('openAsDrawer', () => {
    it('should set drawer title from node label if not provided', () => {
      const openDrawerSpy = jest.spyOn(luigiMock.getEngine()._ui, 'openDrawer');
      mockNavService.getCurrentNode.mockReturnValue({ label: 'Node Label', children: [] });

      navigation.openAsDrawer('/drawer/path', {});

      expect(openDrawerSpy).toHaveBeenCalled();
      expect(openDrawerSpy).toHaveBeenCalledWith(
        luigiMock,
        { label: 'Node Label', children: [] },
        { title: 'Node Label' },
        undefined
      );
    });
    it('should open drawer with provided settings', () => {
      const openDrawerSpy = jest.spyOn(luigiMock.getEngine()._ui, 'openDrawer');
      mockNavService.getCurrentNode.mockReturnValue({ label: 'Node Label', children: [] }); // FIX
      const drawerSettings = { title: 'Custom Drawer Title' };

      navigation.openAsDrawer('/drawer/path', drawerSettings);
      expect(openDrawerSpy).toHaveBeenCalled();
      expect(openDrawerSpy).toHaveBeenCalledWith(
        luigiMock,
        { label: 'Node Label', children: [] },
        drawerSettings,
        undefined
      );
    });
  });
});
