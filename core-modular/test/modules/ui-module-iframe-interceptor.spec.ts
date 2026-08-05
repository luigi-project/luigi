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
    substituteViewUrl: jest.fn().mockReturnValue('http://localhost/mfe'),
    checkWCUrl: jest.fn().mockReturnValue(true)
  }
}));
jest.mock('../../src/utilities/helpers/navigation-helpers', () => ({
  NavigationHelpers: { findVirtualTreeRootNode: jest.fn() }
}));
jest.mock('../../src/utilities/helpers/generic-helpers', () => ({
  GenericHelpers: {
    getRandomId: jest.fn().mockReturnValue('random-id'),
    isFunction: jest.fn((fn: any) => typeof fn === 'function')
  }
}));
jest.mock('../../src/utilities/helpers/auth-helpers', () => ({
  AuthHelpers: { getStoredAuthData: jest.fn() }
}));

import { UIModule } from '../../src/modules/ui-module';
import { serviceRegistry } from '../../src/services/service-registry';
import { ViewUrlDecoratorSvc } from '../../src/services/viewurl-decorator';
import { ModalService } from '../../src/services/modal.service';
import { DirtyStatusService } from '../../src/services/dirty-status.service';

describe('UIModule - iframeCreationInterceptor', () => {
  let mockLuigi: any;
  let mockConnector: any;
  let containerWrapper: HTMLElement;

  beforeEach(() => {
    containerWrapper = document.createElement('div');
    mockConnector = {
      getContainerWrapper: jest.fn().mockReturnValue(containerWrapper),
      showLoadingIndicator: jest.fn(),
      hideLoadingIndicator: jest.fn(),
      renderModal: jest.fn(),
      renderDrawer: jest.fn()
    };
    mockLuigi = {
      getConfigValue: jest.fn(),
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
    const mockModalService = { registerModal: jest.fn(), getModalSettings: jest.fn().mockReturnValue({}) };
    const mockDirtyStatusService = { shouldShowUnsavedChangesModal: jest.fn().mockReturnValue(false) };

    (serviceRegistry.get as jest.Mock).mockImplementation((service: any) => {
      if (service === ViewUrlDecoratorSvc) return mockViewUrlDecoratorSvc;
      if (service === ModalService) return mockModalService;
      if (service === DirtyStatusService) return mockDirtyStatusService;
      return {};
    });

    UIModule.modalContainer = [];
    UIModule.drawerContainer = undefined;
  });

  it('should set iframeCreationInterceptor on container when configured', async () => {
    const interceptor = jest.fn();
    mockLuigi.getConfigValue.mockImplementation((key: string) => {
      if (key === 'settings.iframeCreationInterceptor') return interceptor;
      return undefined;
    });

    const node = { viewUrl: 'http://localhost/mfe' } as any;
    await UIModule.updateMainContent(node, mockLuigi, {});

    const children = [...containerWrapper.children] as any[];
    expect(children.length).toBe(1);
    expect(children[0].iframeCreationInterceptor).toBe(interceptor);
    expect(children[0]._luigiCurrentNode).toBe(node);
    expect(children[0]._luigiMicroFrontendType).toBe('main');
  });

  it('should not set iframeCreationInterceptor when not configured', async () => {
    mockLuigi.getConfigValue.mockReturnValue(undefined);

    const node = { viewUrl: 'http://localhost/mfe' } as any;
    await UIModule.updateMainContent(node, mockLuigi, {});

    const children = [...containerWrapper.children] as any[];
    expect(children.length).toBe(1);
    expect(children[0].iframeCreationInterceptor).toBeUndefined();
  });

  it('should not set iframeCreationInterceptor when config value is not a function', async () => {
    mockLuigi.getConfigValue.mockImplementation((key: string) => {
      if (key === 'settings.iframeCreationInterceptor') return 'not-a-function';
      return undefined;
    });

    const node = { viewUrl: 'http://localhost/mfe' } as any;
    await UIModule.updateMainContent(node, mockLuigi, {});

    const children = [...containerWrapper.children] as any[];
    expect(children.length).toBe(1);
    expect(children[0].iframeCreationInterceptor).toBeUndefined();
  });

  it('should set microFrontendType to modal for openModal', async () => {
    const interceptor = jest.fn();
    mockLuigi.getConfigValue.mockImplementation((key: string) => {
      if (key === 'settings.iframeCreationInterceptor') return interceptor;
      return undefined;
    });

    const node = { viewUrl: 'http://localhost/mfe' } as any;
    await UIModule.openModal(mockLuigi, node, {});

    const lc = UIModule.modalContainer[UIModule.modalContainer.length - 1] as any;
    expect(lc.iframeCreationInterceptor).toBe(interceptor);
    expect(lc._luigiMicroFrontendType).toBe('modal');
  });

  it('should set microFrontendType to drawer for openDrawer', async () => {
    const interceptor = jest.fn();
    mockLuigi.getConfigValue.mockImplementation((key: string) => {
      if (key === 'settings.iframeCreationInterceptor') return interceptor;
      return undefined;
    });

    const node = { viewUrl: 'http://localhost/mfe' } as any;
    await UIModule.openDrawer(mockLuigi, node, {});

    const lc = UIModule.drawerContainer as any;
    expect(lc.iframeCreationInterceptor).toBe(interceptor);
    expect(lc._luigiMicroFrontendType).toBe('drawer');
  });
});
