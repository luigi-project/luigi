import { CommunicationModule } from '../../src/modules/communicaton-module';
import { UIModule } from '../../src/modules/ui-module';
import { UXModule } from '../../src/modules/ux-module';
import { serviceRegistry } from '../../src/services/service-registry';
import { RoutingModule } from '../../src/modules/routing-module';

jest.mock('@luigi-project/container', () => {
  const names = [
    'INITIALIZED', 'NAVIGATION_COMPLETED_REPORT', 'CUSTOM_MESSAGE', 'NAVIGATION_REQUEST',
    'ALERT_REQUEST', 'SHOW_CONFIRMATION_MODAL_REQUEST', 'ADD_SEARCH_PARAMS_REQUEST',
    'ADD_NODE_PARAMS_REQUEST', 'SET_CURRENT_LOCALE_REQUEST', 'SET_ANCHOR_LINK_REQUEST',
    'SET_DIRTY_STATUS_REQUEST', 'RUNTIME_ERROR_HANDLING_REQUEST', 'SHOW_LOADING_INDICATOR_REQUEST',
    'HIDE_LOADING_INDICATOR_REQUEST', 'GO_BACK_REQUEST', 'GET_CURRENT_ROUTE_REQUEST',
    'SET_VIEW_GROUP_DATA_REQUEST', 'ADD_BACKDROP_REQUEST', 'REMOVE_BACKDROP_REQUEST',
    'UPDATE_MODAL_SETTINGS_REQUEST', 'CLOSE_CURRENT_MODAL_REQUEST'
  ];
  return { __esModule: true, default: Object.fromEntries(names.map((name) => [name, name])) };
});
jest.mock('../../src/modules/ui-module', () => ({
  UIModule: { modalContainer: [], drawerContainer: undefined, updateModalSettings: jest.fn() }
}));
jest.mock('../../src/modules/ux-module', () => ({
  UXModule: {
    luigi: null, processAlert: jest.fn(), handleConfirmationModalRequest: jest.fn(),
    handleDirtyStatusRequest: jest.fn()
  }
}));
jest.mock('../../src/services/service-registry', () => ({ serviceRegistry: { get: jest.fn() } }));
jest.mock('../../src/modules/routing-module', () => ({
  RoutingModule: { addSearchParamsFromClient: jest.fn() }
}));
jest.mock('../../src/utilities/helpers/i18n-helpers', () => ({
  I18nHelpers: { hasLocaleChangePermission: () => true }
}));

function dispatch(container: HTMLElement, type: string, payload: unknown = {}): void {
  // Same payload/detail contract as the container's LuigiEvent.
  const event = Object.assign(new Event(type), { payload, detail: payload, callback: jest.fn() });
  container.dispatchEvent(event);
}

describe('CommunicationModule - communication parity regressions', () => {
  let container: any;
  let luigi: any;
  let config: Record<string, any>;
  let sideEffect: jest.Mock;
  let listener: jest.Mock;
  let microfrontends: any[];

  beforeEach(() => {
    jest.clearAllMocks();
    UIModule.modalContainer = [];
    UIModule.drawerContainer = undefined;
    sideEffect = jest.fn();
    listener = jest.fn();
    microfrontends = [];
    config = {
      'navigation.viewGroupSettings': {},
      'communication.customMessagesListeners': { test: listener }
    };
    const connector = {
      showLoadingIndicator: sideEffect, hideLoadingIndicator: sideEffect,
      addBackdrop: sideEffect, removeBackdrop: sideEffect
    };
    luigi = {
      getConfigValue: (key: string) => config[key],
      configChanged: sideEffect,
      elements: () => ({ getMicrofrontends: () => microfrontends }),
      getEngine: () => ({ _connector: connector }),
      navigation: () => ({ runTimeErrorHandler: sideEffect }),
      routing: () => ({ addNodeParams: sideEffect, setAnchor: sideEffect }),
      i18n: () => ({ setCurrentLocale: sideEffect }),
      ux: () => ({ hideLoadingIndicator: sideEffect })
    };
    (UXModule as any).luigi = luigi;
    (serviceRegistry.get as jest.Mock).mockReturnValue({
      preload: sideEffect, viewGroupLoaded: sideEffect, handleNavigationRequest: sideEffect,
      handleGoBackRequest: sideEffect, getCurrentRoutePath: sideEffect
    });
    container = document.createElement('luigi-container');
    container.luigiMfId = 'sender-id';
    container.viewGroup = 'group';
    container.currentNode = { label: 'Sender', _internal: true };
    container.updateContext = sideEffect;
    const parent = document.createElement('div');
    parent.classList.add('content');
    parent.appendChild(container);
    document.body.appendChild(parent);
    CommunicationModule.init(luigi);
    CommunicationModule.addListeners(container, luigi);
  });

  afterEach(() => {
    container.parentNode.remove();
    UIModule.modalContainer = [];
    UIModule.drawerContainer = undefined;
    (UXModule as any).luigi = null;
    jest.restoreAllMocks();
  });

  it.each([
    ['INITIALIZED', 'luigi.init.ok'],
    ['NAVIGATION_COMPLETED_REPORT', 'luigi.navigate.ok'],
    ['CUSTOM_MESSAGE', 'custom'],
    ['NAVIGATION_REQUEST', 'luigi.navigation.open'],
    ['ALERT_REQUEST', 'luigi.ux.alert.show'],
    ['SHOW_CONFIRMATION_MODAL_REQUEST', 'luigi.ux.confirmationModal.show'],
    ['ADD_SEARCH_PARAMS_REQUEST', 'luigi.addSearchParams'],
    ['ADD_NODE_PARAMS_REQUEST', 'luigi.addNodeParams'],
    ['SET_CURRENT_LOCALE_REQUEST', 'luigi.ux.set-current-locale'],
    ['SET_ANCHOR_LINK_REQUEST', 'luigi.setAnchor'],
    ['SET_DIRTY_STATUS_REQUEST', 'luigi.set-page-dirty'],
    ['RUNTIME_ERROR_HANDLING_REQUEST', 'luigi-runtime-error-handling'],
    ['SHOW_LOADING_INDICATOR_REQUEST', 'luigi.show-loading-indicator'],
    ['HIDE_LOADING_INDICATOR_REQUEST', 'luigi.hide-loading-indicator'],
    ['GO_BACK_REQUEST', 'luigi.navigation.back'],
    ['GET_CURRENT_ROUTE_REQUEST', 'luigi.navigation.currentRoute'],
    ['SET_VIEW_GROUP_DATA_REQUEST', 'luigi.setVGData'],
    ['ADD_BACKDROP_REQUEST', 'luigi.add-backdrop'],
    ['REMOVE_BACKDROP_REQUEST', 'luigi.remove-backdrop'],
    ['UPDATE_MODAL_SETTINGS_REQUEST', 'luigi.navigation.updateModalSettings']
  ])('skips inactive %s configured with %s', (eventName, messageId) => {
    config['communication.skipEventsWhenInactive'] = [messageId];
    container.style.display = 'none';
    const debug = jest.spyOn(console, 'debug').mockImplementation(() => {});

    dispatch(container, eventName, { id: 'test' });

    expect(debug).toHaveBeenCalledWith(expect.stringContaining('SKIPPED'));
    expect(sideEffect).not.toHaveBeenCalled();
    expect(listener).not.toHaveBeenCalled();
    expect(serviceRegistry.get).not.toHaveBeenCalled();
    expect(UXModule.processAlert).not.toHaveBeenCalled();
    expect(UXModule.handleConfirmationModalRequest).not.toHaveBeenCalled();
    expect(UXModule.handleDirtyStatusRequest).not.toHaveBeenCalled();
    expect(UIModule.updateModalSettings).not.toHaveBeenCalled();
    expect(RoutingModule.addSearchParamsFromClient).not.toHaveBeenCalled();
    expect(config['navigation.viewGroupSettings']).toEqual({});
  });

  it.each([
    ['INITIALIZED', 'luigi.init.ok', 3],
    ['NAVIGATION_COMPLETED_REPORT', 'luigi.navigate.ok', 1],
    ['SET_VIEW_GROUP_DATA_REQUEST', 'luigi.setVGData', 1]
  ])('processes visible %s even when configured for skipping', (eventName, messageId, calls) => {
    config['communication.skipEventsWhenInactive'] = [messageId];
    container.style.display = 'block';
    dispatch(container, eventName, { value: 1 });
    expect(sideEffect).toHaveBeenCalledTimes(calls);
  });

  it('reads changed skip configuration for subsequent messages', () => {
    container.style.display = 'none';
    dispatch(container, 'SET_VIEW_GROUP_DATA_REQUEST', { value: 1 });
    expect(sideEffect).toHaveBeenCalledTimes(1);
    config['communication.skipEventsWhenInactive'] = ['luigi.setVGData'];
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    dispatch(container, 'SET_VIEW_GROUP_DATA_REQUEST', { value: 2 });
    expect(sideEffect).toHaveBeenCalledTimes(1);
    expect(config['navigation.viewGroupSettings'].group._liveCustomData).toEqual({ value: 1 });
  });

  it.each(['modal', 'drawer'])('does not skip events from a hidden %s', (type) => {
    config['communication.skipEventsWhenInactive'] = ['luigi-runtime-error-handling', 'custom'];
    container.style.display = 'none';
    // No creation interceptor or type metadata is needed for the exception.
    if (type === 'modal') UIModule.modalContainer = [container];
    else UIModule.drawerContainer = container;

    dispatch(container, 'RUNTIME_ERROR_HANDLING_REQUEST');
    dispatch(container, 'CUSTOM_MESSAGE', { id: 'test', data: { value: 1 } });

    expect(sideEffect).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not exempt hidden user-settings containers', () => {
    config['communication.skipEventsWhenInactive'] = ['luigi-runtime-error-handling'];
    container.classList.add('iframeUserSettingsCtn');
    container.style.display = 'none';
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    dispatch(container, 'RUNTIME_ERROR_HANDLING_REQUEST');
    expect(sideEffect).not.toHaveBeenCalled();
  });

  it.each(['iframe', 'webcomponent', 'compound'])('passes the %s sender and sanitized node', (type) => {
    const element = document.createElement(type === 'iframe' ? 'iframe' : 'my-mfe');
    const mf = { container: element, id: 'sender-id', type: 'main', active: true };
    microfrontends.push(mf);
    if (type === 'iframe') container.iframeHandle = { iframe: element };
    const payload = { id: 'test', data: { value: 1 }, _metaData: { src: type === 'compound' ? element : undefined } };

    dispatch(container, 'CUSTOM_MESSAGE', payload);

    expect(listener).toHaveBeenCalledWith({ id: 'test', value: 1 }, mf, { label: 'Sender' });
    expect(container.currentNode).toEqual({ label: 'Sender', _internal: true });
    expect(payload.data).toEqual({ value: 1 });
  });

  it('resolves a webcomponent with the valid numeric sender id zero', () => {
    container.luigiMfId = 0;
    const mf = { container: document.createElement('my-mfe'), id: 0 };
    microfrontends.push(mf);
    dispatch(container, 'CUSTOM_MESSAGE', { id: 'test' });
    expect(listener.mock.calls[0][1]).toBe(mf);
  });

  it('does not select an unrelated sender when the container id is missing', () => {
    delete container.luigiMfId;
    microfrontends.push({ container: document.createElement('other-mfe') });
    dispatch(container, 'CUSTOM_MESSAGE', { id: 'test' });
    expect(listener.mock.calls[0][1]).toBeUndefined();
  });

  it('prefers an exact compound source over the enclosing container id', () => {
    const root = { container: document.createElement('root-mfe'), id: 'sender-id' };
    const child = { container: document.createElement('child-mfe'), id: 'child-id' };
    microfrontends.push(root, child);
    dispatch(container, 'CUSTOM_MESSAGE', { id: 'test', _metaData: { src: child.container } });
    expect(listener.mock.calls[0][1]).toBe(child);
  });

  it('uses the latest node for custom messages after navigation', () => {
    container.currentNode = { label: 'Target', _virtualTree: {} };
    dispatch(container, 'CUSTOM_MESSAGE', { id: 'test' });
    expect(listener.mock.calls[0][2]).toEqual({ label: 'Target' });
  });

  it('warns about unknown custom message ids', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    dispatch(container, 'CUSTOM_MESSAGE', { id: 'unknown' });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("'unknown'"));
    expect(listener).not.toHaveBeenCalled();
  });

  it('keeps the user-settings custom message reserved', () => {
    config['communication.customMessagesListeners']['luigi.updateUserSettings'] = listener;
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    dispatch(container, 'CUSTOM_MESSAGE', { id: 'luigi.updateUserSettings' });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('not allowed'));
    expect(listener).not.toHaveBeenCalled();
  });
});
