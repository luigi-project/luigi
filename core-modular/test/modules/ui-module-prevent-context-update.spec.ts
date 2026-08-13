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
    checkWCUrl: jest.fn().mockReturnValue(true)
  }
}));
jest.mock('../../src/utilities/helpers/navigation-helpers', () => ({
  NavigationHelpers: { findVirtualTreeRootNode: jest.fn() }
}));
jest.mock('../../src/utilities/helpers/generic-helpers', () => ({
  GenericHelpers: {
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
import { DirtyStatusService } from '../../src/services/dirty-status.service';

describe('UIModule.updateMainContent - preventContextUpdate', () => {
  let mockLuigi: any;
  let mockConnector: any;
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

  function createMockContainer(viewurl: string): any {
    const el = document.createElement('luigi-container') as any;
    el.viewurl = viewurl;
    el.updateContext = jest.fn();
    el.updateViewUrl = jest.fn();
    return el;
  }

  it('should preserve existing container when preventContextUpdate is true and viewUrls differ', async () => {
    const existingContainer = createMockContainer('/withoptions.html');
    containerWrapper.appendChild(existingContainer);

    const targetNode = { viewUrl: '/multipurpose.html' } as any;

    await UIModule.updateMainContent(targetNode, mockLuigi, {}, false, true);

    expect(containerWrapper.contains(existingContainer)).toBe(true);
    expect(containerWrapper.children.length).toBe(1);
    expect(existingContainer.viewurl).toBe('/withoptions.html');
  });

  it('should not update viewurl or properties when preventContextUpdate is true', async () => {
    const existingContainer = createMockContainer('/withoptions.html');
    existingContainer.nodeParams = { original: 'params' };
    containerWrapper.appendChild(existingContainer);

    const targetNode = { viewUrl: '/multipurpose.html', clientPermissions: { urlPatterns: true } } as any;
    const luigiParams = { nodeParams: { new: 'params' }, pathParams: {}, searchParams: {} };

    await UIModule.updateMainContent(targetNode, mockLuigi, luigiParams, false, true);

    expect(existingContainer.viewurl).toBe('/withoptions.html');
    expect(existingContainer.nodeParams).toEqual({ original: 'params' });
  });

  it('should not trigger context update when preventContextUpdate is true', async () => {
    const existingContainer = createMockContainer('/withoptions.html');
    containerWrapper.appendChild(existingContainer);

    const targetNode = { viewUrl: '/multipurpose.html', context: { some: 'data' } } as any;

    await UIModule.updateMainContent(targetNode, mockLuigi, {}, false, true);

    expect(existingContainer.updateContext).not.toHaveBeenCalled();
    expect(existingContainer.updateViewUrl).not.toHaveBeenCalled();
  });

  it('should remove container and create new one when preventContextUpdate is false and viewUrls differ', async () => {
    const existingContainer = createMockContainer('/withoptions.html');
    containerWrapper.appendChild(existingContainer);

    const targetNode = { viewUrl: '/multipurpose.html' } as any;

    await UIModule.updateMainContent(targetNode, mockLuigi, {}, false, false);

    expect(containerWrapper.contains(existingContainer)).toBe(false);
    expect(containerWrapper.children.length).toBe(1);
    const newContainer = containerWrapper.children[0] as any;
    expect(newContainer.viewurl).toBe('/multipurpose.html');
  });

  it('should reuse container and update context when preventContextUpdate is false and viewUrls match', async () => {
    const existingContainer = createMockContainer('/multipurpose.html');
    containerWrapper.appendChild(existingContainer);

    const targetNode = { viewUrl: '/multipurpose.html', context: { updated: true } } as any;

    await UIModule.updateMainContent(targetNode, mockLuigi, {}, false, false);

    expect(containerWrapper.contains(existingContainer)).toBe(true);
    expect(existingContainer.updateContext).toHaveBeenCalledWith({ updated: true }, { withoutSync: false });
  });

  it('should not match container when node is webcomponent even with preventContextUpdate', async () => {
    const existingContainer = createMockContainer('/withoptions.html');
    containerWrapper.appendChild(existingContainer);

    const targetNode = { viewUrl: '/multipurpose.html', webcomponent: true } as any;

    await UIModule.updateMainContent(targetNode, mockLuigi, {}, false, true);

    expect(containerWrapper.contains(existingContainer)).toBe(false);
  });

  it('should not match container when node has isolateView even with preventContextUpdate', async () => {
    const existingContainer = createMockContainer('/withoptions.html');
    containerWrapper.appendChild(existingContainer);

    const targetNode = { viewUrl: '/multipurpose.html', isolateView: true } as any;

    await UIModule.updateMainContent(targetNode, mockLuigi, {}, false, true);

    expect(containerWrapper.contains(existingContainer)).toBe(false);
  });

  it('should not match container when node has viewGroup even with preventContextUpdate', async () => {
    const existingContainer = createMockContainer('/withoptions.html');
    containerWrapper.appendChild(existingContainer);

    const targetNode = { viewUrl: '/multipurpose.html', viewGroup: 'myGroup' } as any;

    await UIModule.updateMainContent(targetNode, mockLuigi, {}, false, true);

    expect(containerWrapper.contains(existingContainer)).toBe(false);
  });
});
