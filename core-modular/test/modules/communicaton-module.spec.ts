import { CommunicationModule } from '../../src/modules/communicaton-module';

jest.mock('@luigi-project/container', () => {
  const Events = {
    INITIALIZED: 'initialized',
    NAVIGATION_COMPLETED_REPORT: 'navigation-completed-report',
    NAVIGATION_REQUEST: 'navigation-request',
    RUNTIME_ERROR_HANDLING_REQUEST: 'runtime-error-handling-request',
    ALERT_REQUEST: 'alert-request',
    SHOW_CONFIRMATION_MODAL_REQUEST: 'show-confirmation-modal-request',
    SET_DOCUMENT_TITLE_REQUEST: 'set-document-title-request',
    SHOW_LOADING_INDICATOR_REQUEST: 'show-loading-indicator-request',
    HIDE_LOADING_INDICATOR_REQUEST: 'hide-loading-indicator-request',
    ADD_BACKDROP_REQUEST: 'add-backdrop-request',
    REMOVE_BACKDROP_REQUEST: 'remove-backdrop-request',
    SET_DIRTY_STATUS_REQUEST: 'set-dirty-status-request',
    ADD_NODE_PARAMS_REQUEST: 'add-node-params-request',
    COLLAPSE_LEFT_NAV_REQUEST: 'collapse-left-nav-request',
    OPEN_USER_SETTINGS_REQUEST: 'open-user-settings-request',
    CLOSE_USER_SETTINGS_REQUEST: 'close-user-settings-request',
    ADD_SEARCH_PARAMS_REQUEST: 'add-search-params-request',
    UPDATE_MODAL_SETTINGS_REQUEST: 'update-modal-settings-request',
    SET_CURRENT_LOCALE_REQUEST: 'set-current-locale-request',
    SET_VIEW_GROUP_DATA_REQUEST: 'set-viewgroup-data-request'
  };
  return { __esModule: true, default: Events, ...Events };
});

jest.mock('../../src/services/service-registry', () => ({
  serviceRegistry: { get: jest.fn().mockReturnValue({ viewGroupLoaded: jest.fn(), preload: jest.fn() }) }
}));
jest.mock('../../src/modules/ui-module', () => ({
  UIModule: { luigi: { getEngine: () => ({ _connector: {} }) } }
}));
jest.mock('../../src/modules/ux-module', () => ({
  UXModule: { luigi: null, processAlert: jest.fn(), handleConfirmationModalRequest: jest.fn(), handleDirtyStatusRequest: jest.fn() }
}));
jest.mock('../../src/modules/routing-module', () => ({
  RoutingModule: { addSearchParamsFromClient: jest.fn() }
}));
jest.mock('../../src/utilities/helpers/i18n-helpers', () => ({
  I18nHelpers: { hasLocaleChangePermission: jest.fn().mockReturnValue(true) }
}));

describe('CommunicationModule - SET_VIEW_GROUP_DATA_REQUEST', () => {
  let luigiMock: any;
  let containerElement: HTMLElement & { viewGroup?: string };

  beforeEach(() => {
    luigiMock = {
      getConfigValue: jest.fn().mockReturnValue({}),
      configChanged: jest.fn(),
      i18n: jest.fn().mockReturnValue({ setCurrentLocale: jest.fn() }),
      routing: jest.fn().mockReturnValue({ addNodeParams: jest.fn() }),
      ux: jest.fn().mockReturnValue({ collapseLeftSideNav: jest.fn(), openUserSettings: jest.fn() }),
      navigation: jest.fn().mockReturnValue({ runTimeErrorHandler: jest.fn() }),
      getEngine: jest.fn().mockReturnValue({ _connector: { closeUserSettings: jest.fn(), setDocumentTitle: jest.fn(), showLoadingIndicator: jest.fn(), hideLoadingIndicator: jest.fn(), addBackdrop: jest.fn(), removeBackdrop: jest.fn() } })
    };
    containerElement = document.createElement('div') as any;
    containerElement.viewGroup = 'testGroup';
    CommunicationModule.init(luigiMock);
    CommunicationModule.addListeners(containerElement, luigiMock);
  });

  it('should apply view group data when SET_VIEW_GROUP_DATA_REQUEST is dispatched', () => {
    const vgSettings: Record<string, any> = {};
    luigiMock.getConfigValue.mockReturnValue(vgSettings);

    const event = new CustomEvent('set-viewgroup-data-request', {
      detail: { counter: 5, name: 'Test' }
    });
    containerElement.dispatchEvent(event);

    expect(luigiMock.configChanged).toHaveBeenCalledWith('navigation.viewgroupdata');
    expect(vgSettings['testGroup']).toBeDefined();
    expect(vgSettings['testGroup']._liveCustomData).toEqual({ counter: 5, name: 'Test' });
  });

  it('should not apply view group data if container has no viewGroup', () => {
    containerElement.viewGroup = undefined;

    const event = new CustomEvent('set-viewgroup-data-request', {
      detail: { data: 'value' }
    });
    containerElement.dispatchEvent(event);

    expect(luigiMock.configChanged).not.toHaveBeenCalled();
  });

  it('should create viewGroupSettings entry if it does not exist', () => {
    const vgSettings: Record<string, any> = {};
    luigiMock.getConfigValue.mockReturnValue(vgSettings);

    const event = new CustomEvent('set-viewgroup-data-request', {
      detail: { key: 'val' }
    });
    containerElement.dispatchEvent(event);

    expect(vgSettings['testGroup']).toEqual({ _liveCustomData: { key: 'val' } });
  });

  it('should overwrite existing _liveCustomData', () => {
    const vgSettings: Record<string, any> = {
      testGroup: { _liveCustomData: { old: 'data' }, customData: { keep: 'this' } }
    };
    luigiMock.getConfigValue.mockReturnValue(vgSettings);

    const event = new CustomEvent('set-viewgroup-data-request', {
      detail: { new: 'data' }
    });
    containerElement.dispatchEvent(event);

    expect(vgSettings['testGroup']._liveCustomData).toEqual({ new: 'data' });
    expect(vgSettings['testGroup'].customData).toEqual({ keep: 'this' });
  });
});
