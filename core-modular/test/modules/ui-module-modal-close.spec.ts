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

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
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
    callback = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    UIModule.modalContainer = [];
    UIModule.navService = originalNavService;
    document.querySelectorAll('.lui-modal, .luigi-alert--overlay').forEach((element) => element.remove());
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

  it('notifies the caller and resolves the close promise when routing closes the modal internally', async () => {
    await openModal();

    await modalService.closeModalsWithDirtyCheck();
    await closePromise;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith();
    expect(dirtyStatusService.clearDirtyState).toHaveBeenCalledWith(container);
    expect(modalService.getModalStackLength()).toBe(0);
    expect(UIModule.modalContainer).toHaveLength(0);
    // Browser back has already updated the URL; do not navigate back again.
    expect(routingService.removeModalDataFromUrl).not.toHaveBeenCalled();
  });

  it('keeps the modal promise pending when the internal close dirty check is cancelled', async () => {
    await openModal();
    const settled = jest.fn();
    closePromise.then(settled);
    dirtyStatusService.shouldShowUnsavedChangesModal.mockReturnValue(true);
    dirtyStatusService.getUnsavedChangesModalPromise.mockRejectedValueOnce(new Error('cancelled'));

    expect(await modalService.closeModalsWithDirtyCheck()).toBe(false);

    expect(callback).not.toHaveBeenCalled();
    expect(settled).not.toHaveBeenCalled();
    expect(dirtyStatusService.clearDirtyState).not.toHaveBeenCalled();
    expect(modalService.getModalStackLength()).toBe(1);
    expect(routingService.removeModalDataFromUrl).not.toHaveBeenCalled();

    expect(await modalService.closeModalsWithDirtyCheck()).toBe(true);
    await closePromise;
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not notify again after an internal close', async () => {
    await openModal();
    await modalService.closeModalsWithDirtyCheck();
    await closePromise;
    registeredModal.onInternalClose!();
    await registeredModal.onCloseRequestHandler!();
    await closeViaGoBack();
    await closeViaX();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(modalService.removeLastModalFromStack).toHaveBeenCalledTimes(1);
    expect(routingService.removeModalDataFromUrl).not.toHaveBeenCalled();
  });

  it('does not touch the URL on an internal close even when showModalPathInUrl is set per modal (browser back)', async () => {
    // Case B: the browser has already removed modal data from the URL on back navigation,
    // so the internal close path must not call removeModalDataFromUrl again.
    await openModal({ showModalPathInUrl: true });
    registeredModal.onInternalClose!();
    await closePromise;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith();
    expect(modalService.getModalStackLength()).toBe(0);
    expect(UIModule.modalContainer).toHaveLength(0);
    expect(routingService.removeModalDataFromUrl).not.toHaveBeenCalled();
  });

  it.each(['closeCurrentModal', 'X'])('resolves and cleans up when the caller callback throws via %s', async (path) => {
    const error = new Error('caller failed');
    callback.mockImplementation(() => {
      throw error;
    });
    await openModal();

    const close = path === 'X' ? closeViaX : registeredModal.onCloseRequestHandler!;
    await expect(close()).rejects.toThrow(error);
    await closePromise;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(modalService.getModalStackLength()).toBe(0);
    expect(UIModule.modalContainer).toHaveLength(0);
    expect(routingService.removeModalDataFromUrl).toHaveBeenCalledTimes(1);
    await close();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('resolves an internal close even when the caller callback throws, without changing history', async () => {
    const error = new Error('caller failed');
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    callback.mockImplementation(() => {
      throw error;
    });
    await openModal();

    await modalService.closeModalsWithDirtyCheck();
    await closePromise;
    registeredModal.onInternalClose!();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('onInternalClose failed', error);
    expect(modalService.getModalStackLength()).toBe(0);
    expect(UIModule.modalContainer).toHaveLength(0);
    expect(routingService.removeModalDataFromUrl).not.toHaveBeenCalled();
  });

  it('does not complete a pending close request again after routing closes the modal', async () => {
    await openModal();
    let confirm!: () => void;
    dirtyStatusService.getUnsavedChangesModalPromise.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        confirm = resolve;
      })
    );
    const pendingClose = registeredModal.onCloseRequestHandler!();

    await modalService.closeModalsWithDirtyCheck();
    await closePromise;
    confirm();
    await pendingClose;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(modalService.removeLastModalFromStack).toHaveBeenCalledTimes(1);
    expect(routingService.removeModalDataFromUrl).not.toHaveBeenCalled();
  });

  it.each(['closeCurrentModal', 'X'])(
    'keeps the first modal and its callback pending with the real UI5 example connector when closing the second via %s',
    async (closePath) => {
      let ui5Connector: any;
      runInNewContext(
        readFileSync(resolve(__dirname, '../../dev-tools/templates/simple/luigi-ui/lui-ui5wc.js'), 'utf8'),
        {
          Luigi: {
            getEngine: () => ({
              bootstrap: (value: any) => {
                ui5Connector = value;
              }
            })
          },
          window: { addEventListener: jest.fn() },
          document,
          console
        }
      );
      const overlay = document.createElement('div');
      overlay.className = 'luigi-alert--overlay';
      Object.assign(overlay, { hidePopover: jest.fn(), showPopover: jest.fn() });
      document.body.appendChild(overlay);
      connector.renderModal.mockImplementation(ui5Connector.renderModal);

      await openModal();
      const firstModal = registeredModal;
      const firstPromise = closePromise;
      const firstSettled = jest.fn();
      firstPromise.then(firstSettled);
      const firstContainer = container;
      const firstDialog = container.parentElement;
      const secondCallback = jest.fn();
      await UIModule.openModal(
        luigi,
        { viewUrl: '/second-modal.html', loadingIndicator: { enabled: false } },
        { keepPrevious: true },
        secondCallback
      );
      const secondModal = (modalService.registerModal as jest.Mock).mock.calls[1][0];
      const secondPromise = connector.renderModal.mock.calls[1][3]();
      const secondContainer = connector.renderModal.mock.calls[1][0];
      const secondDialog = secondContainer.parentElement;
      expect(document.querySelectorAll('.lui-modal')).toHaveLength(2);

      if (closePath === 'X') {
        secondDialog.querySelector('ui5-button').click();
      } else {
        secondContainer.dispatchEvent(new CustomEvent(Events.CLOSE_CURRENT_MODAL_REQUEST));
      }
      await secondPromise;

      expect(secondCallback).toHaveBeenCalledTimes(1);
      expect(callback).not.toHaveBeenCalled();
      expect(firstSettled).not.toHaveBeenCalled();
      expect(firstDialog.isConnected).toBe(true);
      expect(secondDialog.isConnected).toBe(false);
      expect(modalService._modalStack).toEqual([firstModal]);
      expect(UIModule.modalContainer).toEqual([firstContainer]);
      expect(routingService.removeModalDataFromUrl).not.toHaveBeenCalled();

      await firstModal.onCloseRequestHandler!();
      await firstPromise;
      expect(callback).toHaveBeenCalledTimes(1);
      expect(document.querySelectorAll('.lui-modal')).toHaveLength(0);
    }
  );

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
    registeredModal.onInternalClose!();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(modalService.removeLastModalFromStack).toHaveBeenCalledTimes(1);
    expect(routingService.removeModalDataFromUrl).toHaveBeenCalledTimes(1);
  });
});
