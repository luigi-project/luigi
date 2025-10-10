import { Events } from '../../src/constants/communication';
import { ContainerService, containerService } from '../../src/services/container.service';
import { WebComponentService } from '../../src/services/webcomponents.service';
import * as helperFunctions from '../../src/services/web-component-helpers';

describe('trivial functions', () => {
  let service;
  beforeEach(() => {
    service = new WebComponentService();
  });

  it('checkWCUrl', () => {
    const returnVal = service.checkWCUrl('http://localhost:4200/foo/bar');
    expect(returnVal).toEqual(true);
  });

  it('processViewUrl', () => {
    const viewUrl = 'http://localhost:4200/foo/bar';
    const returnVal = service.processViewUrl(viewUrl);
    expect(returnVal).toEqual(viewUrl);
  });
});

describe('attachWC', () => {
  // setup data
  let service;
  const wc_id = 'span';
  const wcItemPlaceholder = document.createElement('div');
  const wc_container = document.createElement('div');
  wc_container.appendChild(wcItemPlaceholder);
  const viewUrl = '/path/to/component';
  const nodeId = 'node123';

  beforeEach(() => {
    service = new WebComponentService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('wc_container contains wcItemPlaceholder and nodeId is provided', () => {
    const innerWCElement = document.createElement(wc_id);
    innerWCElement.setAttribute('nodeId', nodeId);
    innerWCElement.setAttribute('lui_web_component', 'true');

    // Mock methods to spy on them
    const dispatchEventSpy = jest.spyOn(wc_container, 'dispatchEvent');
    const createElementSpy = jest.spyOn(document, 'createElement');
    service.initWC = jest.fn();
    wc_container.replaceChild = jest.fn();

    // Act
    service.attachWC(wc_id, wcItemPlaceholder, wc_container, null, viewUrl, nodeId);

    // Assert
    expect(service.initWC).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith(wc_id);
    expect(wc_container.replaceChild).toHaveBeenCalledWith(innerWCElement, wcItemPlaceholder);
    expect(dispatchEventSpy).toHaveBeenCalledWith(new Event('wc_ready'));
  });

  it('wc_container does NOT contain wcItemPlaceholder', () => {
    const wc_container_ = document.createElement('div');

    // Mock methods to spy on them
    const replaceChildSpy = jest.spyOn(wc_container_, 'replaceChild');
    const dispatchEventSpy = jest.spyOn(wc_container_, 'dispatchEvent');
    const createElementSpy = jest.spyOn(document, 'createElement');

    // Act
    service.attachWC(wc_id, wcItemPlaceholder, wc_container_, null, viewUrl, nodeId);

    // Assert
    expect(createElementSpy).not.toHaveBeenCalledWith(wc_id);
    expect(replaceChildSpy).not.toHaveBeenCalled();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('nodeId not provided', () => {
    const innerWCElement = document.createElement(wc_id);
    innerWCElement.setAttribute('lui_web_component', 'true');

    // Mock methods to spy on them
    const dispatchEventSpy = jest.spyOn(wc_container, 'dispatchEvent');
    wc_container.replaceChild = jest.fn();

    // Act
    service.attachWC(wc_id, wcItemPlaceholder, wc_container, null, viewUrl, undefined);

    // Assert
    expect(wc_container.replaceChild).toHaveBeenCalledWith(innerWCElement, wcItemPlaceholder);
    expect(dispatchEventSpy).toHaveBeenCalledWith(new Event('wc_ready'));
  });

  it('_luigi_node provided', () => {
    const innerWCElement = document.createElement(wc_id);
    innerWCElement.setAttribute('lui_web_component', 'true');

    // Mock methods to spy on them
    const dispatchEventSpy = jest.spyOn(wc_container, 'dispatchEvent');
    wc_container.replaceChild = jest.fn();
    (wc_container as any)._luigi_node = { test: 'node' };

    // Act
    service.attachWC(wc_id, wcItemPlaceholder, wc_container, null, viewUrl, undefined);

    // Assert
    expect(wc_container.replaceChild).toHaveBeenCalledWith(innerWCElement, wcItemPlaceholder);
    expect((wc_container as any)._luigi_mfe_webcomponent).toEqual(innerWCElement);

    expect(dispatchEventSpy).toHaveBeenCalledWith(new Event('wc_ready'));
  });
});

describe('dispatchLuigiEvent', () => {
  let service = new WebComponentService();

  it('should call containerService.dispatch with the correct arguments', () => {
    const dispatchSpy = jest.spyOn(service.containerService, 'dispatch').mockImplementation(() => {});

    const msg = 'testMessage';
    const data = { key: 'value' };
    const callback = jest.fn();

    // Act
    service.dispatchLuigiEvent(msg, data, callback);

    // Assert
    expect(dispatchSpy).toHaveBeenCalledWith(msg, service.thisComponent, data, callback);
  });
});

describe('createClientAPI', () => {
  let service;
  beforeEach(() => {
    service = new WebComponentService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('linkManager', () => {
    it('test linkManager navigate', () => {
      const route = '/test/route';

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().navigate(route);

      // assert
      const expectedPayload = {
        fromClosestContext: false,
        fromParent: false,
        fromContext: null,
        fromVirtualTreeRoot: false,
        link: '/test/route',
        nodeParams: {}
      };
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.NAVIGATION_REQUEST, expectedPayload);
    });

    it.each([
      { slug: null, params: null },
      { slug: 'Sales-settings', params: null },
      { slug: null, params: { project: 'pr2', user: 'john' } },
      { slug: 'Sales-settings', params: { project: 'pr2', user: 'john' } }
    ])('test linkManager navigateToIntent', (data) => {
      let payloadLink = `#?intent=${data.slug}`;

      if (data.params && Object.keys(data.params)?.length) {
        const paramList = Object.entries(data.params);

        if (paramList.length > 0) {
          payloadLink += '?';

          for (const [key, value] of paramList) {
            payloadLink += key + '=' + value + '&';
          }

          payloadLink = payloadLink.slice(0, -1);
        }
      }

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().navigateToIntent(data.slug, data.params);

      // assert
      const expectedPayload = {
        fromClosestContext: false,
        fromParent: false,
        fromContext: null,
        fromVirtualTreeRoot: false,
        link: payloadLink,
        nodeParams: {}
      };

      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.NAVIGATION_REQUEST, expectedPayload);
    });

    it('test linkManager: openAsDrawer', () => {
      const route = '/test/route';

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().openAsDrawer(route, { size: 's' });

      // assert
      const expectedPayload = {
        fromClosestContext: false,
        fromParent: false,
        fromContext: null,
        fromVirtualTreeRoot: false,
        link: '/test/route',
        nodeParams: {},
        drawer: {
          size: 's'
        }
      };
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.NAVIGATION_REQUEST, expectedPayload);
    });

    it('test linkManager: openAsModal', () => {
      const route = '/test/route';

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().openAsModal(route, { size: 's' });

      // assert
      const expectedPayload = {
        fromClosestContext: false,
        fromParent: false,
        fromContext: null,
        fromVirtualTreeRoot: false,
        link: '/test/route',
        nodeParams: {},
        modal: {
          size: 's'
        }
      };
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.NAVIGATION_REQUEST, expectedPayload);
    });

    it('test linkManager: openAsSplitView', () => {
      const route = '/test/route';

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().openAsSplitView(route, { size: 's' });

      // assert
      const expectedPayload = {
        fromClosestContext: false,
        fromParent: false,
        fromContext: null,
        fromVirtualTreeRoot: false,
        link: '/test/route',
        nodeParams: {},
        splitView: {
          size: 's'
        }
      };
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.NAVIGATION_REQUEST, expectedPayload);
    });

    it('test linkManager fromClosestContext', () => {
      const route = '/test/route';

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().fromClosestContext().navigate(route);

      // assert
      const expectedPayload = {
        fromClosestContext: true,
        fromParent: false,
        fromContext: null,
        fromVirtualTreeRoot: false,
        link: '/test/route',
        nodeParams: {}
      };
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.NAVIGATION_REQUEST, expectedPayload);
    });

    it('test linkManager fromContext', () => {
      const route = '/test/route';

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().fromContext({ test: 'data' }).navigate(route);

      // assert
      const expectedPayload = {
        fromClosestContext: false,
        fromParent: false,
        fromContext: { test: 'data' },
        fromVirtualTreeRoot: false,
        link: '/test/route',
        nodeParams: {}
      };
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.NAVIGATION_REQUEST, expectedPayload);
    });

    it('test linkManager fromVirtualTreeRoot', () => {
      const route = '/test/route';

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().fromVirtualTreeRoot().navigate(route);

      // assert
      const expectedPayload = {
        fromClosestContext: false,
        fromParent: false,
        fromContext: null,
        fromVirtualTreeRoot: true,
        link: '/test/route',
        nodeParams: {}
      };
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.NAVIGATION_REQUEST, expectedPayload);
    });

    it('test linkManager currentRoute', () => {
      // Mock and spy on functions
      service.containerService.dispatch = jest.fn((event, component, options, callback) => {
        callback('/current/route');
      });

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      const currentRoutePromise = clientAPI.linkManager().getCurrentRoute();

      // assert
      const expectedPayload = {
        fromClosestContext: false,
        fromParent: false,
        fromContext: null,
        fromVirtualTreeRoot: false,
        nodeParams: {}
      };
      return currentRoutePromise.then((result) => {
        expect(service.containerService.dispatch).toHaveBeenCalledWith(
          Events.GET_CURRENT_ROUTE_REQUEST,
          service.thisComponent,
          expectedPayload,
          expect.any(Function)
        );
        expect(result).toBe('/current/route');
      });
    });

    it('test linkManager currentRoute from parent', () => {
      // Mock and spy on functions
      service.containerService.dispatch = jest.fn((event, component, options, callback) => {
        callback('/route');
      });

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      const currentRoutePromise = clientAPI.linkManager().fromParent().getCurrentRoute();

      // assert
      const expectedPayload = {
        fromClosestContext: false,
        fromParent: true,
        fromContext: null,
        fromVirtualTreeRoot: false,
        nodeParams: {}
      };
      return currentRoutePromise.then((result) => {
        expect(service.containerService.dispatch).toHaveBeenCalledWith(
          Events.GET_CURRENT_ROUTE_REQUEST,
          service.thisComponent,
          expectedPayload,
          expect.any(Function)
        );
        expect(result).toBe('/route');
      });
    });

    it('test linkManager withParams', () => {
      const route = '/test/route';

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().withParams({ params: 'some params' }).navigate(route);

      // assert
      const expectedPayload = {
        fromClosestContext: false,
        fromContext: null,
        fromParent: false,
        fromVirtualTreeRoot: false,
        link: '/test/route',
        nodeParams: { params: 'some params' }
      };
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.NAVIGATION_REQUEST, expectedPayload);
    });

    it('test linkManager updateModalPathInternalNavigation', () => {
      const history = true;
      const link = '/test/route';
      const modal = { title: 'Some modal' };

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().updateModalPathInternalNavigation(link, modal, history);

      // assert
      const expectedPayload = {
        fromClosestContext: false,
        fromContext: null,
        fromParent: false,
        fromVirtualTreeRoot: false,
        history,
        link,
        modal,
        nodeParams: {}
      };
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.UPDATE_MODAL_PATH_DATA_REQUEST, expectedPayload);
    });

    it('test linkManager updateTopNavigation', () => {
      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().updateTopNavigation();

      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.UPDATE_TOP_NAVIGATION_REQUEST, {});
    });

    it('test linkManager goBack', () => {
      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().goBack({ ctx: 'context' });

      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.GO_BACK_REQUEST, { ctx: 'context' });
    });

    it('test linkManager hasBack set to default false', () => {
      // since the hasBack functionality is not relevant to container but we need to keep
      // container - core wc client api in sync, leaving it as a default false functionality
      // mock and spy on data/functions
      service.thisComponent = document.createElement('div');
      service.thisComponent.hasBack = true;

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      const hasBack = clientAPI.linkManager().hasBack();

      // assert
      expect(hasBack).toEqual(false);
    });

    it('test linkManager hasBack not set', () => {
      // mock and spy on data/functions
      service.thisComponent = document.createElement('div');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      const hasBack = clientAPI.linkManager().hasBack();

      // assert
      expect(hasBack).toEqual(false);
    });

    it('test linkManager updateModalSettings', () => {
      const addHistoryEntry = true;
      const updatedModalSettings = { title: 'Some modal' };

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.linkManager().updateModalSettings(updatedModalSettings, addHistoryEntry);

      // assert
      const expectedPayload = {
        addHistoryEntry,
        updatedModalSettings
      };
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.UPDATE_MODAL_SETTINGS_REQUEST, expectedPayload);
    });

    it('test linkManager pathExists: should resolve with true if path exists', () => {
      // Mock and spy on functions
      service.containerService.dispatch = jest.fn((event, component, options, callback) => {
        callback(true);
      });

      // Call the function and get the Promise
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      const pathExistsPromise = clientAPI.linkManager().pathExists();

      // Simulate asynchronous behavior
      return pathExistsPromise.then((result) => {
        // Check if the dispatch function was called with the correct arguments
        expect(service.containerService.dispatch).toHaveBeenCalledWith(
          Events.CHECK_PATH_EXISTS_REQUEST,
          service.thisComponent,
          expect.any(Object),
          expect.any(Function)
        );
        // Check if the function resolves with the correct value
        expect(result).toBe(true);
      });
    });

    it('test linkManager pathExists: should reject with false if path does not exist', () => {
      // Mock and spy on functions
      service.containerService.dispatch = jest.fn((event, component, options, callback) => {
        callback(false);
      });

      // Call the function and get the Promise
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      const pathExistsPromise = clientAPI.linkManager().pathExists();

      // Simulate asynchronous behavior
      return pathExistsPromise
        .then((result) => {})
        .catch((error) => {
          // Check if the dispatch function was called with the correct arguments
          expect(service.containerService.dispatch).toHaveBeenCalledWith(
            Events.CHECK_PATH_EXISTS_REQUEST,
            service.thisComponent,
            expect.any(Object),
            expect.any(Function)
          );
          expect(error).toBe(false);
        });
    });
  });

  describe('uxManager', () => {
    it('test uxManager showAlert', () => {
      const alertSettings = {
        text: 'Some alert text',
        type: 'info'
      };

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.uxManager().showAlert(alertSettings);

      // assert
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.ALERT_REQUEST, alertSettings, expect.any(Function));
    });

    it('test uxManager getCurrentTheme', () => {
      // mock and spy on data/functions
      service.thisComponent = document.createElement('div');
      service.thisComponent.theme = 'my-theme';

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      const receivedTheme = clientAPI.uxManager().getCurrentTheme();

      // assert
      expect(receivedTheme).toEqual('my-theme');
    });

    it('test uxManager getCurrentTheme UNDEFINED', () => {
      // mock and spy on data/functions
      service.thisComponent = document.createElement('div');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      const receivedTheme = clientAPI.uxManager().getCurrentTheme();

      // assert
      expect(receivedTheme).toEqual(undefined);
    });

    it('test uxManager showConfirmationModal - resolve when data present', () => {
      // mock and spy on data/functions
      const settings = { confirmationSettings: 'settings' };
      const mockEventData = { result: 'confirmation data' };

      service.containerService.dispatch = jest.fn((eventType, target, eventData, callback) => {
        callback(mockEventData);
      });

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      const confirmationModalPromise = clientAPI.uxManager().showConfirmationModal(settings);

      // assert
      return confirmationModalPromise.then((result) => {
        expect(service.containerService.dispatch).toHaveBeenCalledWith(
          Events.SHOW_CONFIRMATION_MODAL_REQUEST,
          service.thisComponent,
          settings,
          expect.any(Function)
        );
        expect(result).toEqual(undefined);
      });
    });

    it('test uxManager showConfirmationModal - reject when NO data present', () => {
      // mock and spy on data/functions
      const settings = { confirmationSettings: 'settings' };

      service.containerService.dispatch = jest.fn((eventType, target, eventData, callback) => {
        callback(false);
      });

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      const confirmationModalPromise = clientAPI.uxManager().showConfirmationModal(settings);

      // assert
      expect(confirmationModalPromise).rejects.toBeUndefined();
    });

    it('test uxManager closeUserSettings', () => {
      service.thisComponent = document.createElement('div');
      const userSettings = {
        user: 'Some user data'
      };
      service.thisComponent.userSettings = userSettings;

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.uxManager().closeUserSettings(userSettings);

      // assert
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.CLOSE_USER_SETTINGS_REQUEST, userSettings);
    });

    it('test uxManager openUserSettings', () => {
      service.thisComponent = document.createElement('div');
      const userSettings = {
        user: 'Some open user settings data'
      };
      service.thisComponent.userSettings = userSettings;

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.uxManager().openUserSettings(userSettings);

      // assert
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.OPEN_USER_SETTINGS_REQUEST, userSettings);
    });

    it('test uxManager collapseLeftSideNav', () => {
      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.uxManager().collapseLeftSideNav();

      // assert
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.COLLAPSE_LEFT_NAV_REQUEST, {});
    });

    it('test uxManager setDocumentTitle', () => {
      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.uxManager().setDocumentTitle('TITLE');

      // assert
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.SET_DOCUMENT_TITLE_REQUEST, 'TITLE');
    });

    it('test uxManager getDocumentTitle', () => {
      // mock and spy on data/functions
      service.thisComponent = document.createElement('div');
      service.thisComponent.documentTitle = 'Title';

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      const result = clientAPI.uxManager().getDocumentTitle();

      // assert
      expect(result).toEqual('Title');
    });

    it.each([true, false])('test uxManager getDirtyStatus', (value) => {
      // mock and spy on data/functions
      service.thisComponent = document.createElement('div');
      service.thisComponent.dirtyStatus = value;

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      const result = clientAPI.uxManager().getDirtyStatus();

      // assert
      expect(result).toEqual(value);
    });

    it.each([true, false])('test uxManager setDirtyStatus', (value) => {
      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.uxManager().setDirtyStatus(value);

      // assert
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.SET_DIRTY_STATUS_REQUEST, { dirty: value });
    });

    it('test uxManager setCurrentLocale', () => {
      const locale = 'en';

      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.uxManager().setCurrentLocale(locale);

      // assert
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.SET_CURRENT_LOCALE_REQUEST, { currentLocale: locale });
    });

    it('test uxManager removeBackdrop', () => {
      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.uxManager().removeBackdrop();

      // assert
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.REMOVE_BACKDROP_REQUEST, {});
    });

    it('test uxManager showLoadingIndicator', () => {
      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.uxManager().showLoadingIndicator();

      // assert
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.SHOW_LOADING_INDICATOR_REQUEST, {});
    });

    it('test uxManager hideLoadingIndicator', () => {
      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.uxManager().hideLoadingIndicator();

      // assert
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.HIDE_LOADING_INDICATOR_REQUEST, {});
    });

    it('test uxManager hideAppLoadingIndicator', () => {
      // mock and spy on functions
      service.containerService.dispatch = jest.fn();
      const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

      // act
      const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
      clientAPI.uxManager().hideAppLoadingIndicator();

      // assert
      expect(dispatchEventSpy).toHaveBeenCalledWith(Events.HIDE_LOADING_INDICATOR_REQUEST, {});
    });
  });

  it('test getCurrentLocale set value', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');
    service.thisComponent.locale = 'en';

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
    const result = clientAPI.getCurrentLocale();

    // assert
    expect(result).toEqual('en');
  });

  it('test getCurrentLocale attribute NOT set', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
    const result = clientAPI.getCurrentLocale();

    // assert
    expect(result).toEqual(undefined);
  });

  it('test getActiveFeatureToggles set value', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');
    service.thisComponent.activeFeatureToggleList = ['ft1', 'ft2'];

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
    const result = clientAPI.getActiveFeatureToggles();

    // assert
    expect(result).toEqual(['ft1', 'ft2']);
  });

  it('test getActiveFeatureToggles attribute NOT set', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
    const result = clientAPI.getActiveFeatureToggles();

    // assert
    expect(result).toEqual([]);
  });

  it('test publishEvent custom message Defined eventBusElement', () => {
    // mock and spy
    const eventBusElement = {
      eventBus: {
        onPublishEvent: () => {}
      }
    };
    const eventBusPublishEventSpy = jest.spyOn(eventBusElement.eventBus, 'onPublishEvent');
    const dispatchSpy = jest.spyOn(service.containerService, 'dispatch').mockImplementation(() => {});
    const customEvent = new CustomEvent('test-event', { detail: 1 });
    const node_id = 'nodeId';
    const wc_id = 'wc_id';

    // act
    const clientAPI = service.createClientAPI(eventBusElement, node_id, wc_id, 'component');
    clientAPI.publishEvent(customEvent);
    const expectedPayload = {
      id: 'test-event',
      _metaData: {
        nodeId: 'nodeId',
        src: 'component',
        wc_id: 'wc_id'
      },
      data: 1
    };

    // asert
    expect(eventBusPublishEventSpy).toHaveBeenCalledWith(customEvent, node_id, wc_id);
    expect(dispatchSpy).toHaveBeenCalledWith(Events.CUSTOM_MESSAGE, undefined, expectedPayload, undefined);
  });

  it('test publishEvent custom message with UNDEFINED eventBusElement', () => {
    // mock and spy
    const expectedPayload = {
      id: 'test-event',
      _metaData: {
        nodeId: 'nodeId',
        src: 'component',
        wc_id: 'wc_id'
      },
      data: 1
    };
    const dispatchSpy = jest.spyOn(service.containerService, 'dispatch').mockImplementation(() => {});

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
    clientAPI.publishEvent(new CustomEvent('test-event', { detail: 1 }));

    // assert
    expect(dispatchSpy).toHaveBeenCalledWith(Events.CUSTOM_MESSAGE, undefined, expectedPayload, undefined);
  });

  it('test luigiClientInit', () => {
    // mock and spy on functions
    service.containerService.dispatch = jest.fn();
    const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
    clientAPI.luigiClientInit();

    // assert
    expect(dispatchEventSpy).toHaveBeenCalledWith(Events.INITIALIZED, {});
  });

  it('test setViewGroupData', () => {
    // mock and spy on functions
    service.containerService.dispatch = jest.fn();
    const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
    const data = { vg: 'some data' };
    clientAPI.setViewGroupData(data);

    // assert
    expect(dispatchEventSpy).toHaveBeenCalledWith(Events.SET_VIEW_GROUP_DATA_REQUEST, data);
  });

  it('test addNodeParams isSpecial FALSE', () => {
    // mock and spy on functions
    service.containerService.dispatch = jest.fn();
    const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');
    const params = { luigi: 'rocks' };
    const keepBrowserHistory = true;

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    clientAPI.addNodeParams(params, keepBrowserHistory);

    // assert
    expect(dispatchEventSpy).toHaveBeenCalledWith(Events.ADD_NODE_PARAMS_REQUEST, {
      params,
      data: params,
      keepBrowserHistory
    });
  });

  it('test addNodeParams isSpecial TRUE', () => {
    // mock and spy on functions
    service.containerService.dispatch = jest.fn();
    const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', true);
    clientAPI.addNodeParams();

    // assert
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('test getNodeParams isSpecial TRUE', () => {
    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', true);

    // assert
    expect(clientAPI.getNodeParams()).toEqual({});
  });

  it('test getNodeParams isSpecial FALSE, shouldDesanitise true', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');
    // const paramsRaw = { "test": "sum 2+2 &lt; 3+5 and 5 &gt; 1" };
    const paramsObject = { test: 'sum 2+2 &lt; 3+5 and 5 &gt; 1' };
    const paramsResult = { test: 'sum 2+2 < 3+5 and 5 > 1' };

    service.thisComponent.nodeParams = paramsObject;
    const deSanitizeParamsMapSpy = jest.spyOn(helperFunctions, 'deSanitizeParamsMap');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    const result = clientAPI.getNodeParams(true);

    // assert
    expect(deSanitizeParamsMapSpy).toHaveBeenCalledWith(paramsObject);
    expect(result).toEqual(paramsResult);
  });

  it('test getNodeParams isSpecial FALSE, shouldDesanitise false', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');
    const params = { test: 'luigi &lt;' };

    service.thisComponent.nodeParams = params;
    const deSanitizeParamsMapSpy = jest.spyOn(helperFunctions, 'deSanitizeParamsMap');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    const result = clientAPI.getNodeParams(false);

    // assert
    expect(deSanitizeParamsMapSpy).not.toHaveBeenCalled();
    expect(result).toEqual(params);
  });

  it('test getNodeParams isSpecial FALSE, shouldDesanitise false, NO node-params', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');

    // service.thisComponent.getAttribute =  jest.fn().mockReturnValue(undefined);
    const deSanitizeParamsMapSpy = jest.spyOn(helperFunctions, 'deSanitizeParamsMap');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    const result = clientAPI.getNodeParams(false);

    // assert
    expect(deSanitizeParamsMapSpy).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it('test setAnchor isSpecial FALSE', () => {
    // mock and spy on functions
    service.containerService.dispatch = jest.fn();
    const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');
    const anchor = 'some-anchor';

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    clientAPI.setAnchor(anchor);

    // assert
    expect(dispatchEventSpy).toHaveBeenCalledWith(Events.SET_ANCHOR_LINK_REQUEST, anchor);
  });

  it('test setAnchor isSpecial TRUE', () => {
    // mock and spy on functions
    service.containerService.dispatch = jest.fn();
    const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');
    const anchor = 'some-anchor';

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', true);
    clientAPI.setAnchor(anchor);

    // assert
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('test getAnchor set value', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');
    service.thisComponent.anchor = 'home';

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
    const result = clientAPI.getAnchor();

    // assert
    expect(result).toEqual('home');
  });

  it('test getAnchor attribute NOT set', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component');
    const result = clientAPI.getAnchor();

    // assert
    expect(result).toEqual('');
  });

  it('test getCoreSearchParams WITH attribute', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');
    const paramsObject = { test: 'sum 2+2 = 4' };
    service.thisComponent.searchParams = paramsObject;

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    const result = clientAPI.getCoreSearchParams();

    // assert
    expect(result).toEqual(paramsObject);
  });

  it('test getCoreSearchParams UNDEFINED attribute', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    const result = clientAPI.getCoreSearchParams();

    // assert
    expect(result).toEqual({});
  });

  it('test addCoreSearchParams', () => {
    // mock and spy on functions
    service.containerService.dispatch = jest.fn();
    const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');
    const params = { luigi: 'rocks' };
    const keepBrowserHistory = true;

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    clientAPI.addCoreSearchParams(params, keepBrowserHistory);

    // assert
    expect(dispatchEventSpy).toHaveBeenCalledWith(Events.ADD_SEARCH_PARAMS_REQUEST, {
      data: params,
      keepBrowserHistory
    });
  });

  it('test addCoreSearchParams with no arguments', () => {
    // mock and spy on functions
    service.containerService.dispatch = jest.fn();
    const dispatchEventSpy = jest.spyOn(service, 'dispatchLuigiEvent');
    const keepBrowserHistory = true;

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    clientAPI.addCoreSearchParams();

    // assert
    expect(dispatchEventSpy).toHaveBeenCalledWith(Events.ADD_SEARCH_PARAMS_REQUEST, {
      data: {},
      keepBrowserHistory
    });
  });

  it('test getPathParams WITH attribute', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');
    const paramsObject = { pathParam: 'sum 2+2 = 4' };
    service.thisComponent.pathParams = paramsObject;

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    const result = clientAPI.getPathParams();

    // assert
    expect(result).toEqual(paramsObject);
  });

  it('test getPathParams UNDEFINED attribute', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    const result = clientAPI.getPathParams();

    // assert
    expect(result).toEqual({});
  });

  it('test getClientPermissions WITH attribute', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');
    const paramsObject = { permissions: 'lots of permission' };
    service.thisComponent.clientPermissions = paramsObject;

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    const result = clientAPI.getClientPermissions();

    // assert
    expect(result).toEqual(paramsObject);
  });

  it('test getClientPermissions UNDEFINED attribute', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    const result = clientAPI.getClientPermissions();

    // assert
    expect(result).toEqual({});
  });

  it('test getUserSettings WITH attribute', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');
    const paramsObject = { permissions: 'lots of permission' };
    service.thisComponent.userSettings = paramsObject;

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    const result = clientAPI.getUserSettings();

    // assert
    expect(result).toEqual(paramsObject);
  });

  it('test getUserSettings UNDEFINED attribute', () => {
    // mock and spy on data/functions
    service.thisComponent = document.createElement('div');

    // act
    const clientAPI = service.createClientAPI(undefined, 'nodeId', 'wc_id', 'component', false);
    const result = clientAPI.getUserSettings();

    // assert
    expect(result).toEqual({});
  });
});

describe('initWC', () => {
  let service;
  const wc_id = 'someId';
  const eventBusElement = 'eventBusElement';
  const viewUrl = 'https://example.com/some-page';
  const ctx = { some: 'context' };
  const nodeId = 'node123';
  const isCompoundChild = true;

  beforeEach(() => {
    service = new WebComponentService();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set context and LuigiClient if wc.__postProcess is not defined', () => {
    // Arrange
    const wc = { context: null, LuigiClient: null };
    const spyClientAPI = jest.spyOn(service, 'createClientAPI');

    // Act
    service.initWC(wc, wc_id, eventBusElement, viewUrl, ctx, nodeId, isCompoundChild);

    // Assert
    expect(wc.context).toEqual(ctx);
    expect(wc.LuigiClient).toBeDefined();
    expect(spyClientAPI).toHaveBeenCalledWith(eventBusElement, nodeId, wc_id, wc, isCompoundChild);
  });

  it('should call wc.__postProcess if wc.__postProcess is defined', () => {
    // Arrange
    const wc = { __postProcess: jest.fn() };

    const clientAPIReturnVal = {
      getCurrentLocale: () => {}
    };
    const spyClientAPI = jest.spyOn(service, 'createClientAPI').mockReturnValue(clientAPIReturnVal);

    const baseURIMocked = 'https://example.com/some-page/1';
    jest.spyOn(document, 'baseURI', 'get').mockReturnValue(baseURIMocked);
    const documentOrigin = 'https://example.com/some-page';
    const urlSpyMockData = {
      origin: documentOrigin,
      pathname: '/another-page'
    };
    const urlSpy = jest.spyOn(global as any, 'URL').mockImplementation((url) => urlSpyMockData);

    // Act
    service.initWC(wc, wc_id, eventBusElement, viewUrl, ctx, nodeId, isCompoundChild);

    // Assert
    expect(spyClientAPI).toHaveBeenCalledWith(eventBusElement, nodeId, wc_id, wc, isCompoundChild);
    expect(wc.__postProcess).toHaveBeenCalledWith(ctx, clientAPIReturnVal, documentOrigin + '/another-page');
    expect(urlSpy).toHaveBeenCalledTimes(4);
    expect(urlSpy).toHaveBeenNthCalledWith(1, baseURIMocked);
    expect(urlSpy).toHaveBeenNthCalledWith(2, documentOrigin, baseURIMocked);
    expect(urlSpy).toHaveBeenNthCalledWith(3, documentOrigin, baseURIMocked);
    expect(urlSpy).toHaveBeenNthCalledWith(4, './', urlSpyMockData);
  });
});

describe('generateWCId function', () => {
  let service;

  beforeEach(() => {
    service = new WebComponentService();
  });

  // Test case 1: Testing with a simple view URL
  it('should generate an ID for a simple view URL', () => {
    const URLReturn = '/mocked-URL-return-path';
    jest.spyOn(global as any, 'URL').mockImplementation((viewUrl, base) => ({
      href: URLReturn
    }));
    const viewUrl = 'https://example.com/page1';
    const expectedId = 'luigi-wc-2f6d6f636b65642d55524c2d72657475726e2d70617468';
    const result = service.generateWCId(viewUrl);
    expect(result).toBe(expectedId);
  });

  // Test case 2: Testing with a URL containing special characters
  it('should generate an ID for a URL with special characters', () => {
    const viewUrl = 'https://example.com/page?name=John&age=30';
    const URLReturn = '/mocked-URL-return-path';
    jest.spyOn(global as any, 'URL').mockImplementation((viewUrl, base) => ({
      href: URLReturn
    }));
    const expectedId = 'luigi-wc-2f6d6f636b65642d55524c2d72657475726e2d70617468';
    const result = service.generateWCId(viewUrl);
    expect(result).toBe(expectedId);
  });

  // Test case 3: Testing with an empty URL
  it('should generate an ID for an empty view URL', () => {
    const viewUrl = '';
    const URLReturn = '/mocked-URL-return-path';
    jest.spyOn(global as any, 'URL').mockImplementation((viewUrl, base) => ({
      href: URLReturn
    }));
    const expectedId = 'luigi-wc-2f6d6f636b65642d55524c2d72657475726e2d70617468';
    const result = service.generateWCId(viewUrl);
    expect(result).toBe(expectedId);
  });
});

describe('renderWebComponentCompound', () => {
  let service;
  beforeEach(() => {
    jest.clearAllMocks();

    service = new WebComponentService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('resolved', async () => {
    jest.spyOn(helperFunctions, 'resolveRenderer');
    service.createCompoundContainerAsync = jest.fn();
    service.renderWebComponent = jest.fn();
    service.registerEventListeners = jest.fn();

    // Mock createCompoundContainerAsync to return a mock compound container
    const mockCompoundContainer = document.createElement('div');
    service.createCompoundContainerAsync.mockResolvedValue(mockCompoundContainer);

    const navNode = {
      webcomponent: true,
      viewUrl: 'viewURL-1'
    };
    const wc_container = document.createElement('div');
    const context = {};

    // Call the function
    await service.renderWebComponentCompound(navNode, wc_container, context);

    // Assertions
    expect(helperFunctions.resolveRenderer).toHaveBeenCalledTimes(0);
    expect(service.createCompoundContainerAsync).toHaveBeenCalledTimes(1);
    expect(service.registerEventListeners).toHaveBeenCalledTimes(0);
    expect(service.renderWebComponent).toHaveBeenCalledTimes(0);
    // Additional assertions based on your specific use case
  });

  it('resolved with onPublishEvent called', async () => {
    jest.spyOn(helperFunctions, 'resolveRenderer');
    service.createCompoundContainerAsync = jest.fn();
    service.renderWebComponent = jest.fn();

    const compoundCntReturn = document.createElement('div');
    service.createCompoundContainerAsync = jest.fn((renderer, context, navNode) => Promise.resolve(compoundCntReturn));

    const renderer = helperFunctions.resolveRenderer({});
    const navNode = {
      compound: {
        renderer: renderer,
        children: [
          {
            context: 'compoundCtx'
          }
        ]
      }
    };
    navNode.compound.renderer.createCompoundItemContainer = jest.fn();

    const wc_container = document.createElement('div');
    const context = {};
    const customEvent = new CustomEvent('test-event', { detail: 1 });
    const srcNodeId = 'srcNodeID001';
    const wc_id = 'some0id';

    console.debug = jest.fn();
    const compountCreateSpy = jest.spyOn(
      helperFunctions.DefaultCompoundRenderer.prototype,
      'createCompoundItemContainer'
    );
    const attachCompoundItemSpy = jest.spyOn(helperFunctions.DefaultCompoundRenderer.prototype, 'attachCompoundItem');

    // Call the function
    let compoundReturn = await service.renderWebComponentCompound(navNode, wc_container, context);
    (compoundReturn as any).eventBus.onPublishEvent(customEvent, srcNodeId, wc_id);

    // Assertions
    expect(helperFunctions.resolveRenderer).toHaveBeenCalledTimes(2);
    expect(service.createCompoundContainerAsync).toHaveBeenCalledTimes(1);
    expect(service.renderWebComponent).toHaveBeenCalledTimes(1);
    expect(compountCreateSpy).toHaveBeenCalled();
    expect(attachCompoundItemSpy).toHaveBeenCalled();
  });

  it('rejected', () => {
    jest.spyOn(helperFunctions, 'resolveRenderer');
    service.createCompoundContainerAsync = jest.fn();
    service.renderWebComponent = jest.fn();
    service.registerEventListeners = jest.fn();

    // Mock createCompoundContainerAsync to return a mock compound container
    service.createCompoundContainerAsync = jest.fn().mockRejectedValue({});

    const navNode = {};
    const wc_container = document.createElement('div');
    const context = {};
    service.containerService = new ContainerService();
    service.containerService.dispatch = jest.fn();

    // Call the function
    service.renderWebComponentCompound(navNode, wc_container, context);

    // Assertions
    expect(helperFunctions.resolveRenderer).toHaveBeenCalledTimes(0);
    expect(service.createCompoundContainerAsync).toHaveBeenCalledTimes(1);
    expect(service.registerEventListeners).toHaveBeenCalledTimes(0);
    expect(service.renderWebComponent).toHaveBeenCalledTimes(0);
  });
});

describe('createCompoundContainerAsync', () => {
  let service;

  beforeEach(() => {
    service = new WebComponentService();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock function call history after each test
    jest.clearAllMocks();
  });

  it('should resolve with a web component when renderer has a viewUrl', async () => {
    // Arrange
    const renderer = {
      viewUrl: 'https://example.com/webcomponent'
    };
    const ctx = {};
    const mockGeneratedWCId = 'mocked-wc-id';
    const mockWebComponent = document.createElement(mockGeneratedWCId);
    mockWebComponent.setAttribute('lui_web_component', 'true');
    const navNode = {};

    service.initWC = jest.fn();
    service.registerWCFromUrl = jest.fn().mockResolvedValue(mockWebComponent);
    service.generateWCId = jest.fn().mockReturnValue(mockGeneratedWCId);
    service.containerService.dispatch = jest.fn();

    // Act and Assert
    const result = await service.createCompoundContainerAsync(renderer, ctx, navNode);
    expect(result).toEqual(mockWebComponent);

    // Additional Assertions
    expect(service.generateWCId).toHaveBeenCalledWith(renderer.viewUrl);
    expect(service.registerWCFromUrl).toHaveBeenCalledWith(renderer.viewUrl, mockGeneratedWCId);
    expect(service.initWC).toHaveBeenCalledWith(
      mockWebComponent,
      mockGeneratedWCId,
      mockWebComponent,
      renderer.viewUrl,
      ctx,
      '_root'
    );
  });

  // TODO: NEEDS changing TRY/CATCH not rejecting properly
  // it.only('should reject when there is an error during registration', async () => {
  //   // Arrange
  //   const renderer = {
  //     viewUrl: 'https://example.com/webcomponent',
  //   };
  //   const ctx = {};
  //   const mockGeneratedWCId = 'mocked-wc-id';
  //   const mockWebComponent = document.createElement(mockGeneratedWCId);
  //   const rejectVal = 'Rejected Reason...';

  //   // service.initWC = jest.fn();
  //   // service.generateWCId = jest.fn().mockReturnValue(mockGeneratedWCId);
  //   service.registerWCFromUrl = jest.fn().mockRejectedValue(rejectVal)
  //   service.containerService.dispatch = jest.fn();
  //   const consoleSpy = jest.spyOn(console, 'warn')

  //   // jest.spyOn(service, 'generateWCId').mockReturnValue(mockGeneratedWCId);
  //   // .mockImplementation((msg) => {
  //   //   return 'Error: ' + rejectVal
  //   // });
  //   console.warn = jest.fn();

  //   // Act and Assert
  //   const result =  service.createCompoundContainerAsync(renderer, ctx);
  //   expect(result).toEqual('Registration error');
  //   expect(consoleSpy).toHaveBeenLastCalledWith('Error: {}')
  // });

  it('should resolve with a compound container when renderer has no viewUrl', async () => {
    // Arrange
    const renderer = {
      createCompoundContainer: jest.fn()
    };
    const ctx = {};

    // Act and Assert
    await expect(service.createCompoundContainerAsync(renderer, ctx)).resolves.toEqual(
      renderer.createCompoundContainer()
    );
  });
});

describe('registerWCFromUrl', () => {
  let service;

  beforeEach(() => {
    service = new WebComponentService();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock function call history after each test
    jest.clearAllMocks();
  });

  it('should successfully register a web component customElements get = UNDEFINED', async () => {
    // Arrange
    const viewUrl = 'valid-view-url';
    const wc_id = 'custom-element-id';

    // Mock the dynamicImport function to return a module with a valid
    const spy = jest.spyOn(window.customElements, 'get').mockReturnValue(undefined);

    service.dynamicImport = jest.fn((viewUrl) =>
      Promise.resolve({
        default: class InValidWebComponent {},
        valid: class ValidWebComponent extends HTMLElement {}
      })
    );
    window.customElements.define = jest.fn();

    // act
    const result = await service.registerWCFromUrl(viewUrl, wc_id);

    // Assert
    expect(result).toBe(1); // Registration successful
    expect(service.dynamicImport).toHaveBeenCalledWith('valid-view-url');
    expect(service.dynamicImport).resolves;
    expect(spy).toHaveBeenCalled();
    expect(window.customElements.define).toHaveBeenCalled();
    // expect(window.customElements.define).toHaveBeenCalledWith('custom-element-id', expect.any(Function));
  });

  it('should fail the try catch reject', async () => {
    // Arrange
    const viewUrl = 'valid-view-url';
    const wc_id = 'custom-element-id';

    // Mock the dynamicImport function to return a module with a valid
    const spy = jest.spyOn(window.customElements, 'get').mockReturnValue(undefined);

    service.dynamicImport = jest.fn((viewUrl) =>
      Promise.resolve({
        default: class InValidWebComponent {},
        valid: class ValidWebComponent extends HTMLElement {}
      })
    );
    window.customElements.define = jest.fn().mockImplementation(() => {
      throw new Error('Registration error');
    });

    // act
    let result;
    try {
      result = await service.registerWCFromUrl(viewUrl, wc_id);
    } catch (error) {
      expect(error.message).toBe('Registration error');
      expect(service.dynamicImport).toHaveBeenCalledWith('valid-view-url');
      expect(service.dynamicImport).rejects;
      expect(spy).toHaveBeenCalled();
      expect(window.customElements.define).toHaveBeenCalled();
      expect(window.customElements.define).toHaveBeenCalledWith('custom-element-id', expect.any(Function));
    }
  });

  it('should fail with dynamicReport error', async () => {
    // Arrange
    const viewUrl = 'valid-view-url';
    const wc_id = 'custom-element-id';

    // Mock the dynamicImport function to return a module with a valid
    const spy = jest.spyOn(window.customElements, 'get').mockReturnValue(undefined);

    service.dynamicImport = jest.fn((viewUrl) => Promise.reject(new Error('Dynamic import error')));

    // act
    let result;
    try {
      result = await service.registerWCFromUrl(viewUrl, wc_id);
    } catch (error) {
      expect(error.message).toBe('Dynamic import error');
    }
  });

  it('should reject with checkWCUrl FALSE', async () => {
    // Arrange
    const viewUrl = 'valid-view-url';
    const wc_id = 'custom-element-id';

    // Mock the dynamicImport function to return a module with a valid
    service.checkWCUrl = jest.fn().mockReturnValue(false);
    const failMessage = `Error: View URL '${viewUrl}' not allowed to be included`;

    // act
    try {
      await service.registerWCFromUrl(viewUrl, wc_id);
    } catch (error) {
      expect(error).toBe(`Error: View URL '${viewUrl}' not allowed to be included`);
    }
  });
});

describe('includeSelfRegisteredWCFromUrl', () => {
  let originalLuigi;
  let service;

  beforeEach(() => {
    service = new WebComponentService();
    // Store the original values of customElements and Luigi
    originalLuigi = (window as any).Luigi;
  });

  afterEach(() => {
    // Restore the original values after each test
    (window as any).Luigi = originalLuigi;
    jest.clearAllMocks(); // Clear mock function call history after each test
  });

  it('should modify document body with script tag', () => {
    // Arrange
    const node = { webcomponent: { type: 'module' } };
    const viewUrl = 'valid-view-url';
    const onload = jest.fn();

    // Mock checkWCUrl to return true
    jest.spyOn(service, 'checkWCUrl').mockReturnValue(true);

    // Mock customElements.define to capture the arguments passed
    window.customElements.define = jest.fn();
    const containerManagerSpy = jest.spyOn(service.containerService, 'getContainerManager');
    const gwID = jest.spyOn(service, 'generateWCId').mockReturnValue('my-wc-id');
    const mockedElement = document.createElement('div');
    const mockedSrc = 'src';

    // Act
    service.includeSelfRegisteredWCFromUrl(node, viewUrl, onload);
    (window as any).Luigi._registerWebcomponent(mockedSrc, mockedElement);

    const resultingScript = document.body.getElementsByTagName('script')[0];
    resultingScript.dispatchEvent(new Event('load'));

    // Assert
    expect(containerManagerSpy).toHaveBeenCalled();
    expect(window.customElements.define).toHaveBeenCalledWith('my-wc-id', mockedElement);
    expect(resultingScript.getAttribute('defer')).toEqual('true');
    expect(resultingScript.getAttribute('src')).toEqual(viewUrl);
    expect(resultingScript.getAttribute('type')).toEqual('module');
    expect(onload).toHaveBeenCalled();
  });

  it('should log warning if checkWCURL return false', () => {
    // Arrange
    const node = { webcomponent: { type: 'module' } };
    const viewUrl = 'valid-view-url';
    const onload = jest.fn();

    // Mock checkWCUrl to return true
    jest.spyOn(service, 'checkWCUrl').mockReturnValue(false);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    const warningMsg = `View URL '${viewUrl}' not allowed to be included`;
    // Act
    service.includeSelfRegisteredWCFromUrl(node, viewUrl, onload);

    // assert
    expect(consoleWarnSpy).toHaveBeenCalledWith(warningMsg);
  });
});

describe('renderWebComponent', () => {
  let originalLuigi;
  let originalLuigiWCFn;
  let service;
  let mockedViewURL;
  let wc_container;
  let context;
  let node;
  let wcItemPlaceholder;
  const wc_id = 'my-custom-element';
  let spyAttachWc;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new WebComponentService();

    // Mock necessary functions and objects
    mockedViewURL = 'mocked-view-url';
    jest.spyOn(service, 'processViewUrl').mockReturnValue(mockedViewURL);
    spyAttachWc = jest.spyOn(service, 'attachWC').mockImplementation(jest.fn());
    wc_container = document.createElement('div');
    context = {};
    node = { webcomponent: { tagName: wc_id } };
    wcItemPlaceholder = document.createElement('div');
    wc_container.appendChild(wcItemPlaceholder);

    // Store the original values of Luigi
    originalLuigi = (window as any).Luigi;
    originalLuigiWCFn = (window as any).lugiWCFn;
  });

  afterEach(() => {
    // Restore the original values after each test
    (window as any).Luigi = originalLuigi;
    (window as any).lugiWCFn = originalLuigiWCFn;
    jest.clearAllMocks();
  });

  it('should call attachWC if customeElements get returns valid value', () => {
    // Mock necessary functions and objects
    const mockCustomElementConstructor = class MockCustomElement extends HTMLElement {};
    jest.spyOn(window.customElements, 'get').mockReturnValue(mockCustomElementConstructor);

    // Call the function to be tested
    service.renderWebComponent(mockedViewURL, wc_container, context, node);

    // Assert that the web component was attached
    expect(spyAttachWc).toHaveBeenCalled();
  });

  it('should call luigiWCFn when customElements get returns UNDEFINED', () => {
    // Mock necessary functions and objects
    jest.spyOn(window.customElements, 'get').mockReturnValue(undefined);
    const mockedFn = (url, id, placeholder, callsAttachWC) => {
      callsAttachWC();
    };
    (window as any).luigiWCFn = jest.fn().mockImplementation(mockedFn);

    // Call the function to be tested
    service.renderWebComponent(mockedViewURL, wc_container, context, node);
    (window as any).luigiWCFn(mockedViewURL, wc_id, wcItemPlaceholder, jest.fn());

    // Assert that the web component was attached
    expect((window as any).luigiWCFn).toHaveBeenCalledWith(
      mockedViewURL,
      wc_id,
      wcItemPlaceholder,
      expect.any(Function)
    );
    expect(spyAttachWc).toHaveBeenCalled();
  });

  it('should call includeSelfRegisteredWCFromUrl when selfRegistered = TRUE', () => {
    // Mock necessary functions and objects
    jest.spyOn(window.customElements, 'get').mockReturnValue(undefined);
    jest.spyOn(service, 'generateWCId').mockReturnValue(mockedViewURL);

    (window as any).luigiWCFn = undefined;
    node = {
      webcomponent: {
        selfRegistered: true
      }
    };
    const mockedFn = (node, url, callsAttachWC) => {
      callsAttachWC();
    };
    const spyIncludeSRWU = jest.spyOn(service, 'includeSelfRegisteredWCFromUrl').mockImplementation(mockedFn);

    // Call the function to be tested
    service.renderWebComponent(mockedViewURL, wc_container, context, node);

    // Assert that the web component was attached
    expect(spyIncludeSRWU).toHaveBeenCalled();
    expect(spyAttachWc).toHaveBeenCalled();
  });

  it('should call attachWC inside when selfRegistered = TRUE', () => {
    // Mock necessary functions and objects
    jest.spyOn(window.customElements, 'get').mockReturnValue(undefined);
    jest.spyOn(service, 'generateWCId').mockReturnValue(mockedViewURL);

    (window as any).luigiWCFn = undefined;
    node = {
      webcomponent: {
        selfRegistered: false
      }
    };
    service.registerWCFromUrl = jest.fn((viewUrl) => Promise.resolve());

    // Call the function to be tested
    service.renderWebComponent(mockedViewURL, wc_container, context, node);

    // Assert that the web component was attached
    expect(service.registerWCFromUrl).toHaveBeenCalled();
  });

  it('should call throw warning and dispatch runtime error when registerWCFromUrl fails ', async () => {
    // Mock necessary functions and objects
    jest.spyOn(window.customElements, 'get').mockReturnValue(undefined);
    jest.spyOn(service, 'generateWCId').mockReturnValue(mockedViewURL);
    (window as any).luigiWCFn = undefined;
    node = {
      webcomponent: {
        selfRegistered: false
      }
    };
    const errorThrown = new Error('Error registering WC from URL');
    service.registerWCFromUrl = jest.fn().mockRejectedValue(errorThrown);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    service.containerService.dispatch = jest.fn();

    // act
    await service.renderWebComponent(mockedViewURL, wc_container, context, node);

    // assert
    expect(service.registerWCFromUrl).toHaveBeenCalled();
  });
});

describe('resolveAlert', () => {
  let service;

  beforeEach(() => {
    service = new WebComponentService();
    // Mock implementation for the alertResolvers map
    service.alertResolvers = {};
  });

  it('should resolve the alert and remove the resolver from alertResolvers', () => {
    const mockResolver = jest.fn();
    const alertId = 'testAlert';
    service.alertResolvers[alertId] = mockResolver;

    service.resolveAlert(alertId, 'dismissKey');

    // Ensure the resolver was called with the correct dismissKey
    expect(mockResolver).toHaveBeenCalledWith('dismissKey');
    // Ensure the resolver is removed from the alertResolvers
    expect(service.alertResolvers[alertId]).toBeUndefined();
  });

  it('should resolve the alert with the default dismissKey (true) if none is provided', () => {
    const mockResolver = jest.fn();
    const alertId = 'testAlert';
    service.alertResolvers[alertId] = mockResolver;

    service.resolveAlert(alertId);

    // Ensure the resolver was called with the default dismissKey
    expect(mockResolver).toHaveBeenCalledWith(true);
    // Ensure the resolver is removed from the alertResolvers
    expect(service.alertResolvers[alertId]).toBeUndefined();
  });

  it('should log a message if the alert ID is not found', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const nonExistentAlertId = 'nonExistentAlert';

    service.resolveAlert(nonExistentAlertId);

    // Ensure a console log was called with the correct message
    expect(consoleSpy).toHaveBeenCalledWith('Promise is not in the list.');

    // Restore the original console.log
    consoleSpy.mockRestore();
  });
});

describe('notifyConfirmationModalClosed', () => {
  const mockResolver = { resolve: jest.fn(), reject: jest.fn() };
  let service;

  beforeEach(() => {
    service = new WebComponentService();
    service.modalResolver = mockResolver;
  });

  it('should resolve the modal and reset related data when modal is confirmed', () => {
    // act
    service.notifyConfirmationModalClosed(true);

    // assert
    expect(mockResolver.resolve).toHaveBeenCalled();
    expect(service.modalResolver).toBeUndefined();
  });

  it('should reject the modal and reset related data when modal is dismissed', () => {
    // act
    service.notifyConfirmationModalClosed(false);

    // assert
    expect(mockResolver.reject).toHaveBeenCalled();
    expect(service.modalResolver).toBeUndefined();
  });
});
