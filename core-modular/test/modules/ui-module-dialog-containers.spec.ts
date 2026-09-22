jest.mock('@luigi-project/container', () => ({
  __esModule: true,
  default: {},
  LuigiContainer: class {},
  LuigiCompoundContainer: class {}
}));

jest.mock('../../src/services/service-registry', () => ({
  serviceRegistry: { get: jest.fn() }
}));

jest.mock('../../src/services/navigation.service', () => ({ NavigationService: class {} }));
jest.mock('../../src/services/preloading.service', () => ({ PreloadingService: class {} }));
jest.mock('../../src/services/routing.service', () => ({ RoutingService: class {} }));
jest.mock('../../src/services/dirty-status.service', () => ({ DirtyStatusService: class {} }));
jest.mock('../../src/services/viewurl-decorator', () => ({ ViewUrlDecoratorSvc: class {} }));
jest.mock('../../src/services/modal.service', () => ({ ModalService: class {} }));
jest.mock('../../src/services/node-data-management.service', () => ({ NodeDataManagementService: class {} }));
jest.mock('../../src/utilities/helpers/routing-helpers', () => ({
  RoutingHelpers: {
    substituteViewUrl: jest.fn().mockImplementation((node: any) => node.viewUrl),
    getCurrentPath: jest.fn().mockReturnValue({}),
    checkWCUrl: jest.fn().mockReturnValue(true)
  }
}));
jest.mock('../../src/utilities/helpers/navigation-helpers', () => ({
  NavigationHelpers: { findVirtualTreeRootNode: jest.fn() }
}));
jest.mock('../../src/utilities/helpers/generic-helpers', () => ({
  GenericHelpers: {
    getNodeList: jest.fn().mockReturnValue([]),
    getRandomId: jest.fn().mockReturnValue('random-id'),
    isFunction: jest.fn((fn: any) => typeof fn === 'function'),
    isSameUrl: jest.fn((a: string, b: string) => a === b)
  }
}));
jest.mock('../../src/utilities/helpers/auth-helpers', () => ({
  AuthHelpers: { getStoredAuthData: jest.fn() }
}));

import { UIModule } from '../../src/modules/ui-module';
import { serviceRegistry } from '../../src/services/service-registry';
import { ViewUrlDecoratorSvc } from '../../src/services/viewurl-decorator';
import { ModalService } from '../../src/services/modal.service';
import { RoutingService } from '../../src/services/routing.service';
import { DirtyStatusService } from '../../src/services/dirty-status.service';
import { GenericHelpers } from '../../src/utilities/helpers/generic-helpers';
import { RoutingHelpers } from '../../src/utilities/helpers/routing-helpers';

describe('UIModule.updateMainContent - dialog containers', () => {
  let mockLuigi: any;
  let mockConnector: any;
  let mockModalService: any;
  let mockRoutingService: any;
  let containerWrapper: HTMLElement;

  beforeEach(() => {
    containerWrapper = document.createElement('div');
    mockConnector = {
      getContainerWrapper: jest.fn().mockReturnValue(containerWrapper),
      showLoadingIndicator: jest.fn(),
      hideLoadingIndicator: jest.fn()
    };
    mockLuigi = {
      getConfigValue: jest.fn().mockReturnValue(undefined),
      readUserSettings: jest.fn().mockResolvedValue({}),
      featureToggles: () => ({ getActiveFeatureToggleList: () => [] }),
      i18n: () => ({ getCurrentLocale: () => 'en' }),
      theming: () => ({ getCurrentTheme: () => 'sap_horizon', getCSSVariables: () => Promise.resolve({}) }),
      getEngine: () => ({
        _connector: mockConnector,
        _comm: { addListeners: jest.fn() }
      })
    };

    const mockViewUrlDecoratorSvc = { applyDecorators: jest.fn().mockImplementation((url: string) => url) };
    mockModalService = {
      registerModal: jest.fn(),
      getModalSettings: jest.fn().mockReturnValue({}),
      closeModalsWithDirtyCheck: jest.fn().mockResolvedValue(true)
    };
    mockRoutingService = {
      handleBookmarkableModalPath: jest.fn().mockResolvedValue(true)
    };
    const mockDirtyStatusService = { shouldShowUnsavedChangesModal: jest.fn().mockReturnValue(false) };

    (serviceRegistry.get as jest.Mock).mockImplementation((service: any) => {
      if (service === ViewUrlDecoratorSvc) return mockViewUrlDecoratorSvc;
      if (service === ModalService) return mockModalService;
      if (service === RoutingService) return mockRoutingService;
      if (service === DirtyStatusService) return mockDirtyStatusService;
      return {};
    });

    UIModule.modalContainer = [];
    UIModule.drawerContainer = undefined;
  });

  function createMockContainer(viewurl: string): any {
    const el = document.createElement('luigi-container') as any;
    el.viewurl = viewurl;
    el.updateContext = jest.fn();
    el.updateViewUrl = jest.fn();
    return el;
  }

  function createMockElement(className: string): any {
    const el: any = {};
    Object.defineProperty(el, 'classList', {
      value: {
        classes: new Set(),
        add(...names) {
          names.forEach((name) => this.classes.add(name));
        },
        remove(...names) {
          names.forEach((name) => this.classes.delete(name));
        },
        toggle(name) {
          if (this.classes.has(name)) {
            this.classes.delete(name);
            return false;
          } else {
            this.classes.add(name);
            return true;
          }
        },
        contains(name) {
          return this.classes.has(name);
        },
        toString() {
          return Array.from(this.classes).join(' ');
        }
      },
      writable: false
    });
    el.classList.add(className);
    return el;
  }

  it('should handle dialog containers when showModalPathInUrl is true', async () => {
    const targetNode = { viewUrl: '/multipurpose.html' } as any;
    const existingContainer = createMockContainer('/withoptions.html');
    const getCurrentPathSpy = jest.spyOn(RoutingHelpers, 'getCurrentPath');
    mockLuigi.getConfigValue = jest.fn().mockImplementation((key: string) => {
      if (key === 'routing.showModalPathInUrl' || key === 'routing.useHashRouting') return true;
      return null;
    });
    containerWrapper.appendChild(existingContainer);
    UIModule.drawerContainer = { context: { existing: 'data' }, updateContext: jest.fn() };

    expect.assertions(4);
    await UIModule.updateMainContent(targetNode, mockLuigi, {}, true, false);
    await expect(mockModalService.closeModalsWithDirtyCheck).resolves.toBe(true);
    expect(getCurrentPathSpy).toHaveBeenCalled();
    await expect(mockRoutingService.handleBookmarkableModalPath).resolves.toBe(true);
    expect(UIModule.drawerContainer.updateContext).toHaveBeenCalled();
  });

  it('should handle dialog containers when showModalPathInUrl is false', async () => {
    const targetNode = { viewUrl: '/multipurpose.html' } as any;
    const existingContainer = createMockContainer('/withoptions.html');
    const parentOne: any = createMockElement('dialog');
    const parentTwo: any = createMockElement('content');
    const containers = [
      { context: { existing: 'data' }, parentNode: parentOne, updateContext: jest.fn() },
      { context: { other: 'value' }, parentNode: parentTwo, updateContext: jest.fn() }
    ];
    jest.spyOn(GenericHelpers, 'getNodeList').mockReturnValue(containers as any);
    mockLuigi.getConfigValue = jest.fn().mockImplementation((key: string) => {
      if (key === 'routing.showModalPathInUrl') return false;
      return null;
    });
    containerWrapper.appendChild(existingContainer);

    expect.assertions(3);
    await UIModule.updateMainContent(targetNode, mockLuigi, {}, true, false);
    await expect(mockModalService.closeModalsWithDirtyCheck).resolves.toBe(true);
    expect(containers[0].updateContext).toHaveBeenCalled();
    expect(containers[1].updateContext).not.toHaveBeenCalled();
  });
});
