jest.mock('@luigi-project/container', () => ({
  __esModule: true,
  default: {
    CLOSE_CURRENT_MODAL_REQUEST: 'close-current-modal-request',
    GO_BACK_REQUEST: 'go-back-request'
  },
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
jest.mock('../../src/services/node-data-management.service', () => ({ NodeDataManagementService: class {} }));
jest.mock('../../src/utilities/helpers/routing-helpers', () => ({
  RoutingHelpers: { substituteViewUrl: (node: any) => node.viewUrl }
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

import Events from '@luigi-project/container';
import { UIModule } from '../../src/modules/ui-module';
import { ModalService, type ModalPromiseObject } from '../../src/services/modal.service';
import { RoutingService } from '../../src/services/routing.service';
import { DirtyStatusService } from '../../src/services/dirty-status.service';
import { ViewUrlDecoratorSvc } from '../../src/services/viewurl-decorator';
import { serviceRegistry } from '../../src/services/service-registry';

describe('UIModule.openModal close callbacks', () => {
  let luigi: any;
  let connector: any;
  let modalService: ModalService;
  let dirtyStatusService: any;
  let routingService: any;
  let callback: jest.Mock;
  let registeredModal: ModalPromiseObject;
  let container: HTMLElement;
  let closePromise: Promise<void>;
  let closeViaX: () => Promise<void>;
  let originalNavService: typeof UIModule.navService;

  beforeEach(() => {
    originalNavService = UIModule.navService;
    UIModule.modalContainer = [];
    connector = { renderModal: jest.fn(), showLoadingIndicator: jest.fn() };
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
    dirtyStatusService = { getUnsavedChangesModalPromise: jest.fn().mockResolvedValue(undefined) };
    routingService = { removeModalDataFromUrl: jest.fn() };
    (serviceRegistry.get as jest.Mock).mockImplementation((service: any) => {
      if (service === ModalService) return modalService;
      if (service === RoutingService) return routingService;
      if (service === DirtyStatusService) return dirtyStatusService;
      if (service === ViewUrlDecoratorSvc) return { applyDecorators: (url: string) => url };
      throw new Error(`Unexpected service: ${service.name}`);
    });
    callback = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    UIModule.modalContainer = [];
    UIModule.navService = originalNavService;
  });

  async function openModal(settings = {}, onCloseCallback = callback) {
    await UIModule.openModal(
      luigi,
      { viewUrl: '/modal.html', loadingIndicator: { enabled: false } },
      settings,
      onCloseCallback
    );
    registeredModal = (modalService.registerModal as jest.Mock).mock.calls[0][0];
    [container, , closeViaX] = connector.renderModal.mock.calls[0];
    closePromise = connector.renderModal.mock.calls[0][3]();
  }

  async function closeViaGoBack() {
    container.dispatchEvent(new CustomEvent(Events.GO_BACK_REQUEST, { detail: 'returned context' }));
    await closePromise;
  }

  it('notifies the caller when closeCurrentModal closes the modal, without re-entering the connector callback', async () => {
    await openModal();
    // The connector only observes Core's close promise; it must not call Core again.
    await registeredModal.onCloseRequestHandler!();
    await closePromise;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith();
    expect(modalService.getModalStackLength()).toBe(0);
    expect(UIModule.modalContainer).toHaveLength(0);
    expect(routingService.removeModalDataFromUrl).toHaveBeenCalledTimes(1);
    expect(routingService.removeModalDataFromUrl).toHaveBeenCalledWith(true);
  });

  it('notifies the caller exactly once when closed via X', async () => {
    await openModal();
    await closeViaX();
    await closePromise;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith();
    expect(routingService.removeModalDataFromUrl).toHaveBeenCalledTimes(1);
  });

  it('preserves the goBack callback context', async () => {
    await openModal();
    await closeViaGoBack();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('returned context');
    expect(routingService.removeModalDataFromUrl).toHaveBeenCalledTimes(1);
  });

  it('does not notify the caller, resolve or change history if unsaved-changes confirmation is cancelled', async () => {
    await openModal();
    const settled = jest.fn();
    closePromise.then(settled);
    dirtyStatusService.getUnsavedChangesModalPromise.mockRejectedValueOnce(new Error('cancelled'));

    await registeredModal.onCloseRequestHandler!();

    expect(callback).not.toHaveBeenCalled();
    expect(settled).not.toHaveBeenCalled();
    expect(modalService.getModalStackLength()).toBe(1);
    expect(routingService.removeModalDataFromUrl).not.toHaveBeenCalled();

    // A subsequent accepted request must still complete normally.
    await registeredModal.onCloseRequestHandler!();
    await closePromise;
    expect(callback).toHaveBeenCalledTimes(1);
    expect(settled).toHaveBeenCalledTimes(1);
  });

  it('does not remove URL data when showModalPathInUrl is disabled per modal', async () => {
    await openModal({ showModalPathInUrl: false });
    await registeredModal.onCloseRequestHandler!();
    await closePromise;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(routingService.removeModalDataFromUrl).not.toHaveBeenCalled();
  });

  it('notifies the caller without clearing root modal URL data when another modal remains', async () => {
    await openModal();
    modalService._modalStack.unshift({ modalsettings: { title: 'root modal' } });
    UIModule.modalContainer.unshift(document.createElement('div'));

    await registeredModal.onCloseRequestHandler!();
    await closePromise;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(modalService.getModalStackLength()).toBe(1);
    expect(routingService.removeModalDataFromUrl).not.toHaveBeenCalled();
  });

  it('closes normally without an optional caller callback', async () => {
    await UIModule.openModal(luigi, { loadingIndicator: { enabled: false } }, {});
    const modal = (modalService.registerModal as jest.Mock).mock.calls[0][0];
    await modal.onCloseRequestHandler();

    expect(modalService.getModalStackLength()).toBe(0);
    expect(routingService.removeModalDataFromUrl).toHaveBeenCalledTimes(1);
  });

  it('processes duplicate concurrent closeCurrentModal requests only once', async () => {
    await openModal();
    await Promise.all([registeredModal.onCloseRequestHandler!(), registeredModal.onCloseRequestHandler!()]);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(modalService.removeLastModalFromStack).toHaveBeenCalledTimes(1);
    expect(routingService.removeModalDataFromUrl).toHaveBeenCalledTimes(1);
  });

  it('does not repeat notification or history cleanup across different close paths', async () => {
    await openModal();
    await closeViaX();
    await registeredModal.onCloseRequestHandler!();
    await closeViaGoBack();
    await closeViaX();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(modalService.removeLastModalFromStack).toHaveBeenCalledTimes(1);
    expect(routingService.removeModalDataFromUrl).toHaveBeenCalledTimes(1);
  });
});
