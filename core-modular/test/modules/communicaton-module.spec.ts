import { CommunicationModule } from '../../src/modules/communicaton-module';
import { NavigationService } from '../../src/services/navigation.service';
import { serviceRegistry } from '../../src/services/service-registry';

jest.mock('@luigi-project/container', () => {
  const Events = {
    ADD_BACKDROP_REQUEST: 'add-backdrop-request',
    ADD_NODE_PARAMS_REQUEST: 'add-node-params-request',
    ADD_SEARCH_PARAMS_REQUEST: 'add-search-params-request',
    ALERT_REQUEST: 'alert-request',
    CLOSE_USER_SETTINGS_REQUEST: 'close-user-settings-request',
    COLLAPSE_LEFT_NAV_REQUEST: 'collapse-left-nav-request',
    CUSTOM_MESSAGE: 'custom-message',
    GO_BACK_REQUEST: 'navigate-back-request',
    HIDE_LOADING_INDICATOR_REQUEST: 'hide-loading-indicator-request',
    INITIALIZED: 'initialized',
    NAVIGATION_COMPLETED_REPORT: 'navigation-completed-report',
    NAVIGATION_REQUEST: 'navigation-request',
    OPEN_USER_SETTINGS_REQUEST: 'open-user-settings-request',
    REMOVE_BACKDROP_REQUEST: 'remove-backdrop-request',
    RUNTIME_ERROR_HANDLING_REQUEST: 'runtime-error-handling-request',
    SET_ANCHOR_LINK_REQUEST: 'set-anchor-request',
    SET_CURRENT_LOCALE_REQUEST: 'set-current-locale-request',
    SET_DIRTY_STATUS_REQUEST: 'set-dirty-status-request',
    SET_DOCUMENT_TITLE_REQUEST: 'set-document-title-request',
    SET_VIEW_GROUP_DATA_REQUEST: 'set-viewgroup-data-request',
    SHOW_CONFIRMATION_MODAL_REQUEST: 'show-confirmation-modal-request',
    SHOW_LOADING_INDICATOR_REQUEST: 'show-loading-indicator-request',
    UPDATE_MODAL_SETTINGS_REQUEST: 'update-modal-settings-request'
  };
  return { __esModule: true, default: Events, ...Events };
});

jest.mock('../../src/services/service-registry', () => ({
  serviceRegistry: { get: jest.fn() }
}));
jest.mock('../../src/modules/ui-module', () => ({
  UIModule: { luigi: { getEngine: () => ({ _connector: {} }) } }
}));
jest.mock('../../src/modules/ux-module', () => ({
  UXModule: {
    luigi: null,
    processAlert: jest.fn(),
    handleConfirmationModalRequest: jest.fn(),
    handleDirtyStatusRequest: jest.fn()
  }
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
  let navigationServiceMock: any;

  beforeEach(() => {
    luigiMock = {
      getConfigValue: jest.fn().mockReturnValue({}),
      configChanged: jest.fn(),
      i18n: jest.fn().mockReturnValue({ setCurrentLocale: jest.fn() }),
      routing: jest.fn().mockReturnValue({ addNodeParams: jest.fn() }),
      ux: jest.fn().mockReturnValue({ collapseLeftSideNav: jest.fn(), openUserSettings: jest.fn() }),
      navigation: jest.fn().mockReturnValue({ runTimeErrorHandler: jest.fn() }),
      getEngine: jest.fn().mockReturnValue({
        _connector: {
          closeUserSettings: jest.fn(),
          setDocumentTitle: jest.fn(),
          showLoadingIndicator: jest.fn(),
          hideLoadingIndicator: jest.fn(),
          addBackdrop: jest.fn(),
          removeBackdrop: jest.fn()
        }
      })
    };
    containerElement = document.createElement('div') as any;
    containerElement.viewGroup = 'testGroup';
    document.body.appendChild(containerElement);
    document.body.classList.add('content');
    navigationServiceMock = {
      handleGoBackRequest: jest.fn(),
      viewGroupLoaded: jest.fn(),
      preload: jest.fn()
    };
    jest.spyOn(serviceRegistry, 'get').mockImplementation((service: any) => {
      if (service === NavigationService) return navigationServiceMock;
      return {} as any;
    });
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

  it.each([true, false, '', 'test', {}, { foo: 'bar' }])(
    'should handle goBack request with correct value',
    (value: any) => {
      const event = new CustomEvent('navigate-back-request', {
        detail: value
      });
      containerElement.dispatchEvent(event);

      expect(navigationServiceMock.handleGoBackRequest).toHaveBeenCalledWith(JSON.stringify(value));
    }
  );
});

describe('CommunicationModule - skipEventsWhenInactive', () => {
  let luigiMock: any;
  let containerElement: HTMLElement & { viewGroup?: string };
  let navigationSpy: jest.Mock;

  const setConfig = (values: Record<string, any>) => {
    luigiMock.getConfigValue.mockImplementation((key: string) => values[key]);
  };

  beforeEach(() => {
    navigationSpy = jest.fn();
    luigiMock = {
      getConfigValue: jest.fn().mockReturnValue(undefined),
      configChanged: jest.fn(),
      i18n: jest.fn().mockReturnValue({ setCurrentLocale: jest.fn() }),
      routing: jest.fn().mockReturnValue({ addNodeParams: jest.fn(), setAnchor: jest.fn() }),
      ux: jest.fn().mockReturnValue({ collapseLeftSideNav: jest.fn(), openUserSettings: jest.fn() }),
      navigation: jest.fn().mockReturnValue({ runTimeErrorHandler: navigationSpy }),
      getEngine: jest.fn().mockReturnValue({ _connector: {} })
    };
    containerElement = document.createElement('div') as any;
    document.body.appendChild(containerElement);
    CommunicationModule.init(luigiMock);
    CommunicationModule.addListeners(containerElement, luigiMock);
  });

  afterEach(() => {
    containerElement.remove();
    jest.clearAllMocks();
  });

  it('should skip a configured event when the container is inactive (display:none)', () => {
    setConfig({ 'communication.skipEventsWhenInactive': ['luigi-runtime-error-handling'] });
    containerElement.style.display = 'none';

    containerElement.dispatchEvent(new CustomEvent('runtime-error-handling-request', { detail: {} }));

    expect(navigationSpy).not.toHaveBeenCalled();
  });

  it('should NOT skip a configured event when the container is active (visible)', () => {
    setConfig({ 'communication.skipEventsWhenInactive': ['luigi-runtime-error-handling'] });
    containerElement.style.display = 'block';

    containerElement.dispatchEvent(new CustomEvent('runtime-error-handling-request', { detail: {} }));

    expect(navigationSpy).toHaveBeenCalledTimes(1);
  });

  it('should NOT skip an event that is not listed in the config, even when inactive', () => {
    setConfig({ 'communication.skipEventsWhenInactive': ['luigi.ux.alert.show'] });
    containerElement.style.display = 'none';

    containerElement.dispatchEvent(new CustomEvent('runtime-error-handling-request', { detail: {} }));

    expect(navigationSpy).toHaveBeenCalledTimes(1);
  });

  it('should NOT skip any event when skipEventsWhenInactive is not configured', () => {
    setConfig({});
    containerElement.style.display = 'none';

    containerElement.dispatchEvent(new CustomEvent('runtime-error-handling-request', { detail: {} }));

    expect(navigationSpy).toHaveBeenCalledTimes(1);
  });

  it('should NOT skip when the config is an empty array', () => {
    setConfig({ 'communication.skipEventsWhenInactive': [] });
    containerElement.style.display = 'none';

    containerElement.dispatchEvent(new CustomEvent('runtime-error-handling-request', { detail: {} }));

    expect(navigationSpy).toHaveBeenCalledTimes(1);
  });

  it('should match against the internal client message id, not the container event name', () => {
    // The container event name is "runtime-error-handling-request"; configuring that must NOT skip
    // anything - only the internal id "luigi-runtime-error-handling" is honoured.
    setConfig({ 'communication.skipEventsWhenInactive': ['runtime-error-handling-request'] });
    containerElement.style.display = 'none';

    containerElement.dispatchEvent(new CustomEvent('runtime-error-handling-request', { detail: {} }));

    expect(navigationSpy).toHaveBeenCalledTimes(1);
  });
});
