jest.mock('../../src/services/service-registry', () => ({
  serviceRegistry: { get: jest.fn() }
}));
jest.mock('../../src/services/navigation.service', () => ({ NavigationService: class {} }));
jest.mock('../../src/services/preloading.service', () => ({ PreloadingService: class {} }));
jest.mock('../../src/services/routing.service', () => ({ RoutingService: class {} }));
jest.mock('../../src/services/dirty-status.service', () => ({ DirtyStatusService: class {} }));
jest.mock('../../src/services/viewurl-decorator', () => ({ ViewUrlDecoratorSvc: class {} }));
jest.mock('../../src/services/node-data-management.service', () => ({ NodeDataManagementService: class {} }));
jest.mock('../../src/utilities/helpers/routing-helpers', () => ({
  RoutingHelpers: { substituteViewUrl: (node: any) => node.viewUrl, getModalPathFromPath: jest.fn() }
}));
jest.mock('../../src/utilities/helpers/navigation-helpers', () => ({
  NavigationHelpers: { findVirtualTreeRootNode: jest.fn() }
}));
jest.mock('../../src/utilities/helpers/generic-helpers', () => ({
  GenericHelpers: { getRandomId: () => 'modal-id', isFunction: (value: any) => typeof value === 'function' }
}));
jest.mock('../../src/utilities/helpers/auth-helpers', () => ({
  AuthHelpers: { getStoredAuthData: jest.fn() }
}));

import { UIModule } from '../../src/modules/ui-module';
import { ModalService } from '../../src/services/modal.service';
import { RoutingService } from '../../src/services/routing.service';
import { DirtyStatusService } from '../../src/services/dirty-status.service';
import { ViewUrlDecoratorSvc } from '../../src/services/viewurl-decorator';
import { serviceRegistry } from '../../src/services/service-registry';

describe('UIModule.updateModalSettings', () => {
  let luigi: any;
  let connector: any;
  let modalService: ModalService;
  let dirtyStatusService: any;
  let routingService: any;
  let originalNavService: typeof UIModule.navService;

  beforeEach(() => {
    originalNavService = UIModule.navService;
    UIModule.modalContainer = [];
    connector = { renderModal: jest.fn(), updateModalSettings: jest.fn() };
    luigi = {
      getConfigValue: jest.fn((key: string) => (key === 'routing.showModalPathInUrl' ? true : undefined)),
      readUserSettings: jest.fn().mockResolvedValue({}),
      featureToggles: () => ({ getActiveFeatureToggleList: () => [] }),
      i18n: () => ({ getCurrentLocale: () => 'en' }),
      theming: () => ({ getCurrentTheme: () => 'sap_horizon', getCSSVariables: async () => ({}) }),
      getEngine: () => ({ _connector: connector, _comm: { addListeners: jest.fn() } })
    };
    modalService = new ModalService(luigi);
    jest.spyOn(modalService, 'registerModal');
    jest.spyOn(modalService, 'removeLastModalFromStack');
    dirtyStatusService = {
      getUnsavedChangesModalPromise: jest.fn().mockResolvedValue(undefined),
      shouldShowUnsavedChangesModal: jest.fn().mockReturnValue(false),
      clearDirtyState: jest.fn()
    };
    routingService = { removeModalDataFromUrl: jest.fn() };
    (serviceRegistry.get as jest.Mock).mockImplementation((service: any) => {
      if (service === ModalService) return modalService;
      if (service === RoutingService) return routingService;
      if (service === DirtyStatusService) return dirtyStatusService;
      if (service === ViewUrlDecoratorSvc) return { applyDecorators: (url: string) => url };
      throw new Error(`Unexpected service: ${service.name}`);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    UIModule.modalContainer = [];
    UIModule.navService = originalNavService;
    modalService.clearModalStack();
  });

  it('should not update modal settings when modal is not registered', () => {
    const getModalSettingsSpy = jest.spyOn(modalService, 'getModalSettings');
    const updateModalSettingsSpy = jest.spyOn(luigi.getEngine()._connector, 'updateModalSettings');

    UIModule.updateModalSettings({ size: 'm' }, false, luigi);

    expect(getModalSettingsSpy).not.toHaveBeenCalled();
    expect(updateModalSettingsSpy).not.toHaveBeenCalled();
  });

  it('should update modal settings when modal is registered', () => {
    const getModalSettingsSpy = jest.spyOn(modalService, 'getModalSettings');
    const updateModalSettingsSpy = jest.spyOn(luigi.getEngine()._connector, 'updateModalSettings');

    modalService.registerModal({ modalsettings: { size: 's', title: 'First' } });
    UIModule.updateModalSettings({ size: 'm' }, false, luigi);

    expect(getModalSettingsSpy).toHaveBeenCalled();
    expect(updateModalSettingsSpy).toHaveBeenCalledWith({ size: 'm', title: 'First' });
  });
});
