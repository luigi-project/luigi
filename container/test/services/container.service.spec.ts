import { LuigiInternalMessageID } from '../../src/constants/internal-communication';
import { Events, LuigiEvent } from '../../src/constants/communication';
import type { IframeHandle, ContainerElement } from '../../src/constants/container.model';
import { ContainerService } from '../../src/services/container.service';

describe('getContainerManager messageListener', () => {
  let service: ContainerService;
  let gtcSpy;
  let cw: any = {};
  let cm;
  let dispatchedEvent;
  service = new ContainerService();
  cm = service.getContainerManager();

  beforeEach(() => {
    // only get context scenario relies on postMessage, so we need special case handling for it
    const testName = expect.getState().currentTestName;
    if (testName === 'test get context message') {
      cw = { postMessage: () => {} };
    }

    gtcSpy = jest.spyOn(service, 'getTargetContainer').mockImplementation(() => {
      return {
        iframeHandle: {
          iframe: {
            contentWindow: cw
          }
        },
        dispatchEvent: (customEvent) => {
          dispatchedEvent = customEvent;
        }
      } as ContainerElement;
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('test alert request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.ALERT_REQUEST,
        data: {
          settings: {
            id: 'navRequest',
            text: 'Some alert text',
            type: 'info'
          }
        }
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.ALERT_REQUEST);
    expect(typeof dispatchedEvent?.callback).toEqual('function');
    expect(dispatchedEvent.detail.data).toEqual({
      msg: 'luigi.ux.alert.show',
      data: {
        settings: {
          id: 'navRequest',
          text: 'Some alert text',
          type: 'info'
        }
      }
    });
  });

  it('test custom message', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.CUSTOM_MESSAGE,
        data: {
          id: 'custMsgId',
          foo: 'bar'
        }
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.CUSTOM_MESSAGE);
    expect(dispatchedEvent.detail).toEqual({ id: 'custMsgId', _metaData: {}, data: { foo: 'bar' } });
    gtcSpy.mockRestore();
  });

  it('test get context message', () => {
    const event = {
      origin: '*',
      source: cw,
      data: {
        msg: LuigiInternalMessageID.GET_CONTEXT,
        data: {
          id: 'custMsgId',
          foo: 'bar'
        }
      }
    };

    // Create a mock for the postMessage method
    const postMessageMock = jest.fn();

    // Replace the real postMessage with the mock
    cw.postMessage = postMessageMock;

    // Define the message to send and target Origin
    const message = {
      authData: {},
      searchParams: {},
      pathParams: {},
      nodeParams: {},
      context: {},
      internal: {
        thirdPartyCookieCheck: {
          disabled: false
        },
        currentTheme: undefined,
        currentLocale: undefined,
        activeFeatureToggleList: []
      },
      msg: 'luigi.init'
    };
    const targetOrigin = '*';

    // Call the method that should trigger postMessage
    cm.messageListener(event);

    // Assert that postMessage was called with the expected parameters
    expect(postMessageMock).toHaveBeenCalledWith(message, targetOrigin);

    // Clean up by restoring the original postMessage function
    cw.postMessage = () => {};
    cw.origin = undefined;
  });

  it('test initialized request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.INITIALIZED,
        params: 'init'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.INITIALIZED);
    expect(dispatchedEvent.detail).toEqual('init');
  });

  it('test add search params request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.ADD_SEARCH_PARAMS_REQUEST,
        keepBrowserHistory: true,
        data: 'some-data'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.ADD_SEARCH_PARAMS_REQUEST);
    expect(dispatchedEvent.detail).toEqual({ data: 'some-data', keepBrowserHistory: true });
  });

  it('test add node params request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.ADD_NODE_PARAMS_REQUEST,
        keepBrowserHistory: false,
        data: 'some-data'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.ADD_NODE_PARAMS_REQUEST);
    expect(dispatchedEvent.detail).toEqual({ data: 'some-data', keepBrowserHistory: false });
  });

  it('test confirmationModal show request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.SHOW_CONFIRMATION_MODAL_REQUEST,
        data: {
          settings: {
            type: 'confirmation',
            header: 'Confirmation',
            body: 'Are you sure you want to do this?',
            buttonConfirm: 'Yes',
            buttonDismiss: 'No'
          }
        }
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.SHOW_CONFIRMATION_MODAL_REQUEST);
    expect(typeof dispatchedEvent?.callback).toEqual('function');
    expect(dispatchedEvent.detail).toEqual({
      settings: {
        type: 'confirmation',
        header: 'Confirmation',
        body: 'Are you sure you want to do this?',
        buttonConfirm: 'Yes',
        buttonDismiss: 'No'
      }
    });
  });

  it('test loading indicator show request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.SHOW_LOADING_INDICATOR_REQUEST,
        params: 'loading-indicator-show'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.SHOW_LOADING_INDICATOR_REQUEST);
  });

  it('test loading indicator hide request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.HIDE_LOADING_INDICATOR_REQUEST,
        params: 'loading-indicator-hide'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.HIDE_LOADING_INDICATOR_REQUEST);
  });

  it('test set locale request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.SET_CURRENT_LOCALE_REQUEST,
        params: 'set-locale'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.SET_CURRENT_LOCALE_REQUEST);
  });

  it('test set local storage request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.LOCAL_STORAGE_SET_REQUEST,
        params: 'set-local-storage'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.LOCAL_STORAGE_SET_REQUEST);
  });

  it('test runtime error handling request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.RUNTIME_ERROR_HANDLING_REQUEST,
        params: 'set-runtime-error-request'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.RUNTIME_ERROR_HANDLING_REQUEST);
  });

  it('test anchor link request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.SET_ANCHOR_LINK_REQUEST,
        params: 'set-anchor-link-request'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.SET_ANCHOR_LINK_REQUEST);
  });

  it('test third party cookies request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.SET_THIRD_PARTY_COOKIES_REQUEST,
        params: 'set-thirdparty-cookies-request'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.SET_THIRD_PARTY_COOKIES_REQUEST);
  });

  it('test navigation back request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.BACK_NAVIGATION_REQUEST,
        params: 'back-navigation-request'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.BACK_NAVIGATION_REQUEST);
  });

  it('test navigation request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.NAVIGATION_REQUEST,
        params: 'navigation-request'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.NAVIGATION_REQUEST);
  });

  it('test getCurrentRoute request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.GET_CURRENT_ROUTE_REQUEST,
        params: 'get-currentroute-request'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.GET_CURRENT_ROUTE_REQUEST);
    expect(typeof dispatchedEvent?.callback).toEqual('function');
  });

  it('test navigation completed request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.NAVIGATION_COMPLETED_REPORT,
        params: 'nav-completed-request'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.NAVIGATION_COMPLETED_REPORT);
  });

  it('test update modalPath data request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.UPDATE_MODAL_PATH_DATA_REQUEST,
        params: 'update-modalpathdata-request'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.UPDATE_MODAL_PATH_DATA_REQUEST);
  });

  it('test check pathExists request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.CHECK_PATH_EXISTS_REQUEST,
        params: 'update-check-pathexists-request'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.CHECK_PATH_EXISTS_REQUEST);
    expect(typeof dispatchedEvent?.callback).toEqual('function');
  });

  it('test set dirty status request', () => {
    const event = {
      source: cw,
      data: {
        msg: LuigiInternalMessageID.SET_DIRTY_STATUS_REQUEST,
        params: 'set-dirtystatus-request'
      }
    };
    cm.messageListener(event);
    expect(dispatchedEvent.type).toEqual(Events.SET_DIRTY_STATUS_REQUEST);
  });

  it('test default', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    const event = {
      source: cw,
      data: {
        msg: 'no-func'
      }
    };
    cm.messageListener(event);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});

describe('isVisible', () => {
  let service: ContainerService;
  service = new ContainerService();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return true for a visible element', () => {
    // Arrange
    const visibleElement = document.createElement('div');
    jest.spyOn(visibleElement, 'offsetWidth', 'get').mockImplementation(() => 200);
    document.body.appendChild(visibleElement);

    // Act
    const result = service.isVisible(visibleElement);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false for a hidden element', () => {
    // Arrange
    const hiddenElement = document.createElement('div');
    hiddenElement.style.display = 'none';
    document.body.appendChild(hiddenElement);

    // Act
    const result = service.isVisible(hiddenElement);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for an element with zero dimensions', () => {
    // Arrange
    const zeroSizeElement = document.createElement('div');
    zeroSizeElement.style.width = '0';
    zeroSizeElement.style.height = '0';
    document.body.appendChild(zeroSizeElement);

    // Act
    const result = service.isVisible(zeroSizeElement);

    // Assert
    expect(result).toBe(false);
  });
});

describe('sendCustomMessageToIframe', () => {
  let service: ContainerService;
  service = new ContainerService();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should send a custom message to the iframe', () => {
    // Arrange
    const iframeHandle: IframeHandle = {
      iframe: {
        contentWindow: {
          postMessage: jest.fn()
        },
        src: 'https://example.com'
      } as unknown as HTMLIFrameElement
    };
    const message = { key: 'value' };

    // Act
    service.sendCustomMessageToIframe(iframeHandle, message);

    // Assert
    expect(iframeHandle.iframe.contentWindow.postMessage).toHaveBeenCalledWith(
      { msg: 'custom', data: message },
      'https://example.com'
    );
  });

  it('should send a named message to the iframe', () => {
    // Arrange
    const iframeHandle: IframeHandle = {
      iframe: {
        contentWindow: {
          postMessage: jest.fn()
        },
        src: 'https://example.com'
      } as unknown as HTMLIFrameElement
    };
    const message = { key: 'value' };

    // Act
    service.sendCustomMessageToIframe(iframeHandle, message, 'namedMessage');

    // Assert
    expect(iframeHandle.iframe.contentWindow.postMessage).toHaveBeenCalledWith(
      { msg: 'namedMessage', key: 'value' },
      'https://example.com'
    );
  });

  it('should log an error if contentWindow is not available', () => {
    // Arrange
    const iframeHandle: IframeHandle = {
      iframe: {} as unknown as HTMLIFrameElement
    };
    const message = { key: 'value' };

    // Spy on console.error to capture the log message
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    service.sendCustomMessageToIframe(iframeHandle, message);

    // Assert
    expect(consoleErrorSpy).toHaveBeenCalledWith('Message target could not be resolved');

    // Restore the original console.error function
    consoleErrorSpy.mockRestore();
  });
});

describe('dispatch', () => {
  let service: ContainerService;
  service = new ContainerService();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should dispatch a Luigi event to the target container, no Callback', () => {
    // Arrange
    const targetContainer = document.createElement('div');
    const eventName = 'customEvent';
    const eventData = { key: 'value' };
    targetContainer.dispatchEvent = jest.fn();

    // Act
    service.dispatch(eventName, targetContainer, eventData);

    // Assert
    const dispatchedEvent = new LuigiEvent(eventName, eventData);
    expect(targetContainer.dispatchEvent).toHaveBeenCalledWith(dispatchedEvent);
  });

  it('should execute the callback when provided', () => {
    // Arrange
    const targetContainer = document.createElement('div') as unknown as ContainerElement;
    const eventName = 'customEvent';
    const eventData = { key: 'value' };
    targetContainer.dispatchEvent = jest.fn();

    // Define a callback function
    const callbackFunction = (data) => {
      // This function should not be called in this test
    };

    // Act
    service.dispatch(eventName, targetContainer, eventData, callbackFunction);

    // Assert
    globalThis.CustomEvent = jest
      .fn()
      .mockImplementation((type, eventInit) => ({ isTrusted: false, callback: callbackFunction }));

    const dispatchedEventMock = { isTrusted: false, callback: expect.any(Function) };
    expect(targetContainer.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining(dispatchedEventMock));
  });
});

describe('getTargetContainer', () => {
  let service: ContainerService;
  service = new ContainerService();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return the correct container when a matching container is found', () => {
    // Arrange
    const mockContainer1 = {
      iframeHandle: {
        iframe: {
          contentWindow: 'source1'
        } as unknown as HTMLIFrameElement
      } as IframeHandle
    };
    const mockContainer2 = {
      iframeHandle: {
        iframe: {
          contentWindow: 'source2'
        } as unknown as HTMLIFrameElement
      } as IframeHandle
    };

    globalThis.__luigi_container_manager = {
      container: [mockContainer1, mockContainer2]
    };

    const mockEvent = {
      source: 'source2' // Matched with mockContainer2
    };

    // Act
    const targetContainer = service.getTargetContainer(mockEvent);

    // Assert
    expect(targetContainer).toBe(mockContainer2);
  });

  it('should return undefined when no matching container is found', () => {
    // Arrange
    const mockContainer1 = {
      iframeHandle: {
        iframe: {
          contentWindow: 'source1'
        } as unknown as HTMLIFrameElement
      } as IframeHandle
    };
    const mockContainer2 = {
      iframeHandle: {
        iframe: {
          contentWindow: 'source2'
        } as unknown as HTMLIFrameElement
      } as IframeHandle
    };

    globalThis.__luigi_container_manager = {
      container: [mockContainer1, mockContainer2]
    };

    const mockEvent = {
      source: 'source3' // No matching container
    };

    // Act
    const targetContainer = service.getTargetContainer(mockEvent);

    // Assert
    expect(targetContainer).toBe(undefined);
  });
});

describe('getContainerManager branch', () => {
  let service: ContainerService;
  service = new ContainerService();

  beforeEach(() => {
    globalThis.__luigi_container_manager = undefined;
    jest.resetAllMocks();
  });

  afterEach(() => {
    // Reset the global state after each test
    globalThis.__luigi_container_manager = undefined;
    window.removeEventListener('message', globalThis.__luigi_container_manager?.messageListener);
  });

  it('should initialize and return the container manager', () => {
    const containerManager = service.getContainerManager();
    expect(containerManager).toBeDefined();
    expect(containerManager.container).toEqual([]);
    expect(containerManager.messageListener).toBeDefined();
  });

  it('should return the existing container manager if it has been initialized', () => {
    const existingManager = {
      container: ['existingData'],
      messageListener: jest.fn()
    };
    globalThis.__luigi_container_manager = existingManager;

    const containerManager = service.getContainerManager();
    expect(containerManager).toBe(existingManager);
  });

  it('should add a message event listener when initializing', () => {
    globalThis.__luigi_container_manager = undefined;
    const spy = jest.spyOn(window, 'addEventListener');

    const containerManager = service.getContainerManager(); // Initialize the manager

    // Verify that addEventListener was called with 'message' event type
    expect(containerManager).toBeDefined();
    expect(containerManager.container).toEqual([]);
    expect(spy).toHaveBeenCalledWith('message', expect.any(Function));
  });
});

describe('registerContainer', () => {
  let service: ContainerService;
  service = new ContainerService();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should add an HTMLElement to the container', () => {
    // Arrange
    const containerManager = {
      container: []
    };
    const container = document.createElement('div');
    service.getContainerManager = jest.fn().mockReturnValue(containerManager);

    // Act
    service.registerContainer(container);

    // Assert
    expect(containerManager.container).toContain(container);
    expect(service.getContainerManager).toHaveBeenCalled();
  });
});
