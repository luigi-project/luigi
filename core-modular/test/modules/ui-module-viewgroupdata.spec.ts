import { NodeDataManagementService } from '../../src/services/node-data-management.service';

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
jest.mock('../../src/utilities/helpers/routing-helpers', () => ({ RoutingHelpers: {} }));
jest.mock('../../src/utilities/helpers/navigation-helpers', () => ({ NavigationHelpers: {} }));
jest.mock('../../src/utilities/helpers/generic-helpers', () => ({ GenericHelpers: {} }));
jest.mock('../../src/utilities/helpers/auth-helpers', () => ({ AuthHelpers: {} }));

import { UIModule } from '../../src/modules/ui-module';
import { serviceRegistry } from '../../src/services/service-registry';

describe('UIModule.update - viewgroupdata fast path', () => {
  let mockConnector: any;
  let mockNavService: any;
  let mockRoutingService: any;
  let mockNodeDataMgmt: any;
  let mockLuigi: any;

  beforeEach(() => {
    mockConnector = {
      renderTopNav: jest.fn(),
      renderLeftNav: jest.fn(),
      renderTabNav: jest.fn(),
      renderBreadcrumbs: jest.fn(),
      getContainerWrapper: jest.fn().mockReturnValue(document.createElement('div')),
      setDocumentTitle: jest.fn()
    };
    mockNavService = {
      getPathData: jest.fn().mockResolvedValue({ selectedNode: {}, nodesInPath: [] }),
      getTopNavData: jest.fn().mockResolvedValue({ items: [] }),
      getLeftNavData: jest.fn().mockResolvedValue({ items: [] }),
      getTabNavData: jest.fn().mockResolvedValue({ items: [] }),
      getBreadcrumbData: jest.fn().mockResolvedValue({ items: [] })
    };
    mockRoutingService = {
      getCurrentRoute: jest.fn().mockReturnValue({ path: '/home', node: {} })
    };
    mockNodeDataMgmt = {
      deleteCache: jest.fn()
    };
    mockLuigi = {
      getEngine: () => ({ _connector: mockConnector }),
      readUserSettings: jest.fn().mockResolvedValue({})
    };

    (serviceRegistry.get as jest.Mock).mockImplementation((service: any) => {
      if (service === NodeDataManagementService) return mockNodeDataMgmt;
      return {};
    });

    UIModule.luigi = mockLuigi as any;
    (UIModule as any).navService = mockNavService;
    (UIModule as any).routingService = mockRoutingService;
    UIModule.updateMainContent = jest.fn();
  });

  it('should use fast path for navigation.viewgroupdata scope', async () => {
    await UIModule.update(['navigation.viewgroupdata']);

    expect(mockNavService.getPathData).toHaveBeenCalledTimes(1);
    expect(mockNavService.getTopNavData).toHaveBeenCalledTimes(1);
    expect(mockNavService.getLeftNavData).toHaveBeenCalledTimes(1);
    expect(mockNavService.getTabNavData).toHaveBeenCalledTimes(1);
    expect(mockNavService.getBreadcrumbData).toHaveBeenCalledTimes(1);
  });

  it('should pass shared pathData to all nav data methods in fast path', async () => {
    const pathData = { selectedNode: { pathSegment: 'test' }, nodesInPath: [{ pathSegment: 'test' }] };
    mockNavService.getPathData.mockResolvedValue(pathData);

    await UIModule.update(['navigation.viewgroupdata']);

    expect(mockNavService.getTopNavData).toHaveBeenCalledWith('/home', pathData);
    expect(mockNavService.getLeftNavData).toHaveBeenCalledWith('/home', pathData);
    expect(mockNavService.getTabNavData).toHaveBeenCalledWith('/home', pathData);
    expect(mockNavService.getBreadcrumbData).toHaveBeenCalledWith('/home', pathData, expect.any(Function));
  });

  it('should render all nav components in fast path', async () => {
    const topNav = { items: [{ label: 'top' }] };
    const leftNav = { items: [{ label: 'left' }] };
    const tabNav = { items: [{ label: 'tab' }] };
    const breadcrumbs = { items: [{ label: 'bc' }] };

    mockNavService.getTopNavData.mockResolvedValue(topNav);
    mockNavService.getLeftNavData.mockResolvedValue(leftNav);
    mockNavService.getTabNavData.mockResolvedValue(tabNav);
    mockNavService.getBreadcrumbData.mockResolvedValue(breadcrumbs);

    await UIModule.update(['navigation.viewgroupdata']);

    expect(mockConnector.renderTopNav).toHaveBeenCalledWith(topNav);
    expect(mockConnector.renderLeftNav).toHaveBeenCalledWith(leftNav);
    expect(mockConnector.renderTabNav).toHaveBeenCalledWith(tabNav);
    expect(mockConnector.renderBreadcrumbs).toHaveBeenCalledWith(breadcrumbs);
  });

  it('should NOT delete cache for viewgroupdata-only scope', async () => {
    await UIModule.update(['navigation.viewgroupdata']);
    expect(mockNodeDataMgmt.deleteCache).not.toHaveBeenCalled();
  });

  it('should delete cache when navigation scope is used', async () => {
    await UIModule.update(['navigation']);

    expect(mockNodeDataMgmt.deleteCache).toHaveBeenCalled();
  });

  it('should not use fast path when multiple scopes include viewgroupdata', async () => {
    await UIModule.update(['navigation.viewgroupdata', 'navigation.nodes']);

    expect(mockNodeDataMgmt.deleteCache).toHaveBeenCalled();
  });

  it('should early return if no current route', async () => {
    mockRoutingService.getCurrentRoute.mockReturnValue(null);

    await UIModule.update(['navigation.viewgroupdata']);

    expect(mockNavService.getPathData).not.toHaveBeenCalled();
    expect(mockConnector.renderTopNav).not.toHaveBeenCalled();
  });
});
