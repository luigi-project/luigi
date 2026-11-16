jest.mock('@luigi-project/container', () => ({
  __esModule: true,
  default: { CUSTOM_MESSAGE: 'custom-message' },
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

describe('UIModule.openUserSettings', () => {
  let mockLuigi: any;
  let mockConnector: any;
  let createdContainers: any[];
  let realCreateElement: typeof document.createElement;

  // Captured hooks that core installs on the dialogSettings object.
  let renderMicroFrontendContainer: (groupConfig: any, groupKey: string) => Promise<any>;
  let onCloseCallback: (stored: any) => Promise<void> | void;

  const CUSTOM_MESSAGE = 'custom-message';

  beforeEach(() => {
    createdContainers = [];
    // Stub only luigi-container creation; everything else uses the real factory.
    // Use a real element so core can appendChild it into a target and read
    // parentElement, but capture listeners and stub updateContext.
    realCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag: any, ...rest: any[]) => {
      if (tag === 'luigi-container') {
        const lc: any = realCreateElement('div');
        lc.listeners = {} as Record<string, (e: any) => void>;
        lc.addEventListener = jest.fn((type: string, cb: (e: any) => void) => {
          lc.listeners[type] = cb;
        });
        lc.updateContext = jest.fn();
        createdContainers.push(lc);
        return lc;
      }
      return realCreateElement(tag, ...rest);
    });

    mockConnector = {
      getContainerWrapper: jest.fn().mockReturnValue(document.createElement('div')),
      // Capture the hooks core installs, as a real head would receive them.
      openUserSettings: jest.fn((dialogSettings: any) => {
        renderMicroFrontendContainer = dialogSettings.renderMicroFrontendContainer;
        onCloseCallback = dialogSettings.onCloseCallback;
      })
    };
    mockLuigi = {
      getConfigValue: jest.fn().mockReturnValue(undefined),
      readUserSettings: jest.fn().mockResolvedValue({}),
      storeUserSettings: jest.fn().mockResolvedValue(undefined),
      featureToggles: () => ({ getActiveFeatureToggleList: () => [] }),
      i18n: () => ({ getCurrentLocale: () => 'en' }),
      theming: () => ({ getCurrentTheme: () => 'sap_horizon', getCSSVariables: () => Promise.resolve({}) }),
      getEngine: () => ({
        _connector: mockConnector,
        _comm: { addListeners: jest.fn() }
      })
    };

    (serviceRegistry.get as jest.Mock).mockImplementation((svc: any) => {
      if (svc === ViewUrlDecoratorSvc) {
        return { applyDecorators: (url: string) => url };
      }
      return {};
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    UIModule.userSettingsContainer = undefined;
  });

  const openDialog = async (previousUserSettings: any = {}, groupConfig: any = { viewUrl: '/mf.html' }) => {
    const dialogSettings: any = { dialogHeader: 'Settings' };
    const userSettingData = [{ custom: groupConfig }];
    await UIModule.openUserSettings(
      dialogSettings,
      userSettingData,
      previousUserSettings,
      previousUserSettings,
      mockLuigi
    );
    return dialogSettings;
  };

  it('creates the container only once per group and returns the cached one on re-activation', async () => {
    await openDialog();

    const first = await renderMicroFrontendContainer({ viewUrl: '/mf.html' }, 'custom');
    const second = await renderMicroFrontendContainer({ viewUrl: '/mf.html' }, 'custom');

    expect(first).toBe(second);
    expect(createdContainers).toHaveLength(1);
  });

  it('pushes the updated context back into the same group on luigi.updateUserSettings', async () => {
    await openDialog({ custom: { theme: 'red' } }, { viewUrl: '/mf.html', context: { base: 'x' } });

    const lc = await renderMicroFrontendContainer({ viewUrl: '/mf.html', context: { base: 'x' } }, 'custom');

    // Simulate the MF reporting a config change.
    lc.listeners[CUSTOM_MESSAGE]({
      detail: { id: 'luigi.updateUserSettings', data: { theme: 'green' } }
    });

    // Only userSettingsData is pushed (mirrors legacy core), and withoutSync:false
    // so the client does not merge viewUrl / pathParams into the context.
    expect(lc.updateContext).toHaveBeenCalledWith({ userSettingsData: { theme: 'green' } }, { withoutSync: false });
  });

  it('ignores custom messages other than luigi.updateUserSettings', async () => {
    await openDialog();
    const lc = await renderMicroFrontendContainer({ viewUrl: '/mf.html' }, 'custom');

    lc.listeners[CUSTOM_MESSAGE]({ detail: { id: 'something.else', data: { x: 1 } } });

    expect(lc.updateContext).not.toHaveBeenCalled();
  });

  it('merges MF-reported settings over the head-provided stored settings on close', async () => {
    await openDialog();
    const lc = await renderMicroFrontendContainer({ viewUrl: '/mf.html' }, 'custom');
    lc.listeners[CUSTOM_MESSAGE]({
      detail: { id: 'luigi.updateUserSettings', data: { theme: 'green' } }
    });

    await onCloseCallback({ account: { name: 'Luigi' }, custom: { theme: 'red' } });

    expect(mockLuigi.storeUserSettings).toHaveBeenCalledWith(
      { account: { name: 'Luigi' }, custom: { theme: 'green' } },
      {}
    );
  });
});
