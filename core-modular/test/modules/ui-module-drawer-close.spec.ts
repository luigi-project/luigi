jest.mock('@luigi-project/container', () => ({
  __esModule: true,
  default: {
    CLOSE_CURRENT_MODAL_REQUEST: 'close-current-modal-request',
    GO_BACK_REQUEST: 'go-back-request',
  },
  LuigiContainer: class {},
  LuigiCompoundContainer: class {},
}));
jest.mock('../../src/services/service-registry', () => ({
  serviceRegistry: { get: jest.fn() },
}));
jest.mock('../../src/services/navigation.service', () => ({
  NavigationService: class {},
}));
jest.mock('../../src/services/preloading.service', () => ({
  PreloadingService: class {},
}));
jest.mock('../../src/services/routing.service', () => ({
  RoutingService: class {},
}));
jest.mock('../../src/services/dirty-status.service', () => ({
  DirtyStatusService: class {},
}));
jest.mock('../../src/services/viewurl-decorator', () => ({
  ViewUrlDecoratorSvc: class {},
}));
jest.mock('../../src/services/node-data-management.service', () => ({
  NodeDataManagementService: class {},
}));
jest.mock('../../src/services/modal.service', () => ({
  ModalService: class {},
}));
jest.mock('../../src/utilities/helpers/routing-helpers', () => ({
  RoutingHelpers: { substituteViewUrl: (node: any) => node.viewUrl },
}));
jest.mock('../../src/utilities/helpers/navigation-helpers', () => ({
  NavigationHelpers: { findVirtualTreeRootNode: jest.fn() },
}));
jest.mock('../../src/utilities/helpers/generic-helpers', () => ({
  GenericHelpers: {
    getRandomId: () => 'drawer-id',
    isFunction: (value: any) => typeof value === 'function',
  },
}));
jest.mock('../../src/utilities/helpers/auth-helpers', () => ({
  AuthHelpers: { getStoredAuthData: jest.fn() },
}));

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import Events from '@luigi-project/container';
import { UIModule } from '../../src/modules/ui-module';
import { DirtyStatusService } from '../../src/services/dirty-status.service';
import { ViewUrlDecoratorSvc } from '../../src/services/viewurl-decorator';
import { serviceRegistry } from '../../src/services/service-registry';

describe('UIModule.openDrawer close callbacks', () => {
  let luigi: any;
  let connector: any;
  let dirtyStatusService: any;
  let callback: jest.Mock;
  let container: HTMLElement;
  let closePromise: Promise<void>;
  let closeViaX: () => Promise<void>;
  let originalNavService: typeof UIModule.navService;

  beforeEach(() => {
    originalNavService = UIModule.navService;
    UIModule.drawerContainer = undefined;
    connector = { renderDrawer: jest.fn(), showLoadingIndicator: jest.fn() };
    luigi = {
      getConfigValue: jest.fn(),
      readUserSettings: jest.fn().mockResolvedValue({}),
      featureToggles: () => ({ getActiveFeatureToggleList: () => [] }),
      i18n: () => ({ getCurrentLocale: () => 'en' }),
      theming: () => ({
        getCurrentTheme: () => 'sap_horizon',
        getCSSVariables: async () => ({}),
      }),
      getEngine: () => ({
        _connector: connector,
        _comm: { addListeners: jest.fn() },
      }),
    };
    dirtyStatusService = {
      getUnsavedChangesModalPromise: jest.fn().mockResolvedValue(undefined),
      shouldShowUnsavedChangesModal: jest.fn().mockReturnValue(false),
      clearDirtyState: jest.fn(),
    };
    (serviceRegistry.get as jest.Mock).mockImplementation((service: any) => {
      if (service === DirtyStatusService) return dirtyStatusService;
      if (service === ViewUrlDecoratorSvc)
        return { applyDecorators: (url: string) => url };
      throw new Error(`Unexpected service: ${service.name}`);
    });
    callback = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    UIModule.drawerContainer = undefined;
    UIModule.navService = originalNavService;
    document
      .querySelectorAll('.lui-drawer, .luigi-alert--overlay')
      .forEach((element) => element.remove());
  });

  async function openDrawer(
    onCloseCallback: ((value?: any) => void) | undefined = callback,
  ) {
    await UIModule.openDrawer(
      luigi,
      { viewUrl: '/drawer.html', loadingIndicator: { enabled: false } },
      {},
      onCloseCallback,
    );
    [container, , closeViaX] = connector.renderDrawer.mock.calls[0];
    closePromise = connector.renderDrawer.mock.calls[0][3]();
  }

  async function close(path: string, context: any = 'returned context') {
    if (path === 'X') {
      await closeViaX();
    } else {
      container.dispatchEvent(
        new CustomEvent(
          path === 'goBack'
            ? Events.GO_BACK_REQUEST
            : Events.CLOSE_CURRENT_MODAL_REQUEST,
          {
            detail: context,
          },
        ),
      );
      // Allow the async event handler and promise observers to finish.
      await Promise.resolve();
    }
  }

  it.each(['closeCurrentModal', 'X', 'goBack'])(
    'notifies and cleans up exactly once via %s',
    async (path) => {
      await openDrawer();
      await close(path);
      await closePromise;

      expect(callback).toHaveBeenCalledTimes(1);
      if (path === 'goBack') {
        expect(callback).toHaveBeenCalledWith('returned context');
      } else {
        expect(callback).toHaveBeenCalledWith();
      }
      expect(UIModule.drawerContainer).toBeUndefined();
      expect(dirtyStatusService.clearDirtyState).toHaveBeenCalledTimes(1);
      expect(dirtyStatusService.clearDirtyState).toHaveBeenCalledWith(
        container,
      );

      await close('X');
      await close('closeCurrentModal');
      await close('goBack');
      expect(callback).toHaveBeenCalledTimes(1);
      expect(dirtyStatusService.clearDirtyState).toHaveBeenCalledTimes(1);
      expect(
        dirtyStatusService.getUnsavedChangesModalPromise,
      ).toHaveBeenCalledTimes(1);
    },
  );

  it.each(['closeCurrentModal', 'X', 'goBack'])(
    'keeps the drawer pending when confirmation is cancelled via %s',
    async (path) => {
      await openDrawer();
      const settled = jest.fn();
      closePromise.then(settled);
      dirtyStatusService.getUnsavedChangesModalPromise.mockRejectedValueOnce(
        new Error('cancelled'),
      );

      await close(path);
      expect(callback).not.toHaveBeenCalled();
      expect(settled).not.toHaveBeenCalled();
      expect(UIModule.drawerContainer).toBe(container);
      expect(dirtyStatusService.clearDirtyState).not.toHaveBeenCalled();

      await close(path);
      await closePromise;
      expect(callback).toHaveBeenCalledTimes(1);
      expect(settled).toHaveBeenCalledTimes(1);
    },
  );

  it('resolves and cleans up even if the caller callback throws', async () => {
    const error = new Error('caller failed');
    callback.mockImplementation(() => {
      throw error;
    });
    await openDrawer();

    await expect(closeViaX()).rejects.toThrow(error);
    await closePromise;
    expect(UIModule.drawerContainer).toBeUndefined();
    expect(dirtyStatusService.clearDirtyState).toHaveBeenCalledWith(container);
    await closeViaX();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('completes competing close requests only once', async () => {
    await openDrawer();
    let confirm!: () => void;
    dirtyStatusService.getUnsavedChangesModalPromise.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        confirm = resolve;
      }),
    );
    const pendingClose = closeViaX();
    await close('closeCurrentModal');
    await closePromise;
    confirm();
    await pendingClose;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(dirtyStatusService.clearDirtyState).toHaveBeenCalledTimes(1);
  });

  it('preserves goBack context processing', async () => {
    jest.useFakeTimers();
    UIModule.navService = {
      removeLastPreservedView: jest.fn(),
      processGoBackContext: jest.fn(),
    } as any;
    const context = { saved: true };
    await openDrawer();
    await close('goBack', context);
    await closePromise;
    jest.runAllTimers();

    expect(callback).toHaveBeenCalledWith(context);
    expect(UIModule.navService.removeLastPreservedView).toHaveBeenCalledTimes(
      1,
    );
    expect(UIModule.navService.processGoBackContext).toHaveBeenCalledWith(
      context,
    );
  });

  it('does not clear the reference to a newer drawer when an older one closes', async () => {
    await openDrawer();
    const newerContainer = document.createElement('div');
    UIModule.drawerContainer = newerContainer;
    await closeViaX();
    await closePromise;

    expect(UIModule.drawerContainer).toBe(newerContainer);
    expect(dirtyStatusService.clearDirtyState).toHaveBeenCalledWith(container);
  });

  it('closes without an optional caller callback', async () => {
    await UIModule.openDrawer(
      luigi,
      { loadingIndicator: { enabled: false } },
      {},
    );
    const [, , closeViaX, onCloseRequest] =
      connector.renderDrawer.mock.calls[0];
    await closeViaX();
    await onCloseRequest();
    expect(UIModule.drawerContainer).toBeUndefined();
  });

  it.each(['closeCurrentModal', 'X', 'goBack'])(
    'works with the real UI5 template via %s without re-entering Core',
    async (path) => {
      let ui5Connector: any;
      runInNewContext(
        readFileSync(
          resolve(
            __dirname,
            '../../dev-tools/templates/simple/luigi-ui/lui-ui5wc.js',
          ),
          'utf8',
        ),
        {
          Luigi: {
            getEngine: () => ({
              bootstrap: (value: any) => {
                ui5Connector = value;
              },
            }),
          },
          window: { addEventListener: jest.fn() },
          document,
          console,
        },
      );
      const overlay = document.createElement('div');
      overlay.className = 'luigi-alert--overlay';
      Object.assign(overlay, {
        hidePopover: jest.fn(),
        showPopover: jest.fn(),
      });
      document.body.appendChild(overlay);
      connector.renderDrawer.mockImplementation(ui5Connector.renderDrawer);
      await openDrawer();
      const dialog = container.parentElement!;
      expect(dialog.classList.contains('lui-drawer')).toBe(true);

      if (path === 'X') {
        (dialog.querySelector('ui5-button') as HTMLElement).click();
      } else {
        await close(path);
      }
      await closePromise;

      expect(callback).toHaveBeenCalledTimes(1);
      expect(
        dirtyStatusService.getUnsavedChangesModalPromise,
      ).toHaveBeenCalledTimes(1);
      expect(dirtyStatusService.clearDirtyState).toHaveBeenCalledTimes(1);
      expect(UIModule.drawerContainer).toBeUndefined();
      expect(dialog.isConnected).toBe(false);
    },
  );
});
