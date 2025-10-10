import { UIModule } from '../../src/modules/ui-module';
import { RoutingService } from '../../src/services/routing.service';
import { serviceRegistry } from '../../src/services/service-registry';
import { RoutingHelpers } from '../../src/utilities/helpers/routing-helpers';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('Routing Service', () => {
  let routingService: RoutingService;
  let mockLuigi: any;
  let mockNavService: any;
  let mockConnector: any;
  let addEventListenerSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    mockConnector = {
      renderTopNav: jest.fn(),
      renderLeftNav: jest.fn(),
      renderTabNav: jest.fn(),
      renderMainLayout: jest.fn(),
      getContainerWrapper: jest.fn(),
      hideLoadingIndicator: jest.fn(),
      showLoadingIndicator: jest.fn()
    };
    mockLuigi = {
      config: {},
      engine: {},
      setConfig: () => {},
      configChanged: () => {},
      routing: () => ({ getSearchParams: () => ({}) }),
      uxManager: () => ({}),
      linkManager: () => ({}),
      getConfigValue: () => null,
      getActiveFeatureToggles: () => [],
      getConfig: jest.fn(),
      readUserSettings: () => Promise.resolve({}),
      navigation: jest.fn(() => ({ navigate: jest.fn() })),
      getEngine: jest.fn(() => ({
        _connector: mockConnector,
        _ui: UIModule
      }))
    };
    mockNavService = {
      shouldRedirect: jest.fn(),
      getCurrentNode: jest.fn(),
      onNodeChange: jest.fn(),
      getTopNavData: jest.fn(),
      getLeftNavData: jest.fn(),
      getTabNavData: jest.fn(),
      extractDataFromPath: jest.fn()
    };
    jest.spyOn(serviceRegistry, 'get').mockReturnValue(mockNavService);

    routingService = new RoutingService(mockLuigi);

    // Mock RoutingHelpers
    jest.spyOn(RoutingHelpers, 'getCurrentPath').mockReturnValue({ path: '/abc', query: 'foo=bar' });
    jest.spyOn(RoutingHelpers, 'filterNodeParams').mockReturnValue({ foo: 'bar' });
    jest.spyOn(RoutingHelpers, 'prepareSearchParamsForClient').mockReturnValue({ foo: 'bar' });

    // Mock window.addEventListener
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    jest.spyOn(UIModule, 'updateMainContent');

    UIModule.init(mockLuigi);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('shouldSkipRoutingForUrlPatterns', () => {
    let locationSpy: any;

    beforeEach(() => {
      locationSpy = jest.spyOn(window, 'location', 'get');
    });

    afterEach(() => {
      sinon.restore();
      sinon.reset();
      locationSpy.mockRestore();
    });

    it('should return true if path matches default patterns', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de?access_token=bar'
        };
      });

      const actual = routingService.shouldSkipRoutingForUrlPatterns();
      const expect = true;

      assert.equal(actual, expect);
    });

    it('should return true if path matches default patterns', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de?id_token=foo'
        };
      });

      const actual = routingService.shouldSkipRoutingForUrlPatterns();
      const expect = true;

      assert.equal(actual, expect);
    });

    it('should return true if path matches config patterns', () => {
      sinon.restore();
      sinon.stub(mockLuigi, 'getConfigValue').withArgs('routing.skipRoutingForUrlPatterns').returns(['foo_bar']);

      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de?foo_bar'
        };
      });

      const actual = routingService.shouldSkipRoutingForUrlPatterns();
      const expect = true;

      assert.equal(actual, expect);
    });

    it('should return false if path does not matche patterns', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/settings'
        };
      });

      const actual = routingService.shouldSkipRoutingForUrlPatterns();
      const expect = false;

      assert.equal(actual, expect);
    });
  });

  it('should add hashchange event listener when useHashRouting is true', () => {
    mockLuigi.getConfig.mockReturnValue({ routing: { useHashRouting: true } });
    routingService.enableRouting();
    expect(addEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
  });

  it('should handle hashchange event and call navigation methods', async () => {
    mockLuigi.getConfig.mockReturnValue({ routing: { useHashRouting: true } });
    mockNavService.shouldRedirect.mockReturnValue(undefined);
    const fakeNode = { nodeParams: {}, searchParams: {} };
    mockNavService.getCurrentNode.mockReturnValue(fakeNode);

    routingService.enableRouting();

    // Find the hashchange handler
    const handler = addEventListenerSpy.mock.calls.find(([event]: [string]) => event === 'hashchange')?.[1];
    expect(handler).toBeInstanceOf(Function);

    // Simulate hashchange event
    handler!({} as HashChangeEvent);

    //needed to wait for async operations to complete shouldShowModalPathInUrl
    await Promise.resolve();

    expect(RoutingHelpers.getCurrentPath).toHaveBeenCalled();
    expect(RoutingHelpers.filterNodeParams).toHaveBeenCalled();
    expect(mockNavService.shouldRedirect).toHaveBeenCalledWith('/abc');
    expect(mockNavService.getCurrentNode).toHaveBeenCalledWith('/abc');
    expect(mockNavService.onNodeChange).toHaveBeenCalledWith(undefined, fakeNode);
    expect(mockConnector.renderTopNav).toHaveBeenCalled();
    expect(mockConnector.renderLeftNav).toHaveBeenCalled();
    expect(mockConnector.renderTabNav).toHaveBeenCalled();

    expect(UIModule.updateMainContent).toHaveBeenCalledWith(fakeNode, mockLuigi);
  });

  it('should redirect if shouldRedirect returns a path', async () => {
    mockLuigi.getConfig.mockReturnValue({ routing: { useHashRouting: true } });
    mockNavService.shouldRedirect.mockReturnValue('/redirect');
    const navigateSpy = jest.fn();
    mockLuigi.navigation = jest.fn(() => ({ navigate: navigateSpy }));

    routingService.enableRouting();

    const handler = addEventListenerSpy.mock.calls.find(([event]: [string]) => event === 'hashchange')?.[1];
    handler!({} as HashChangeEvent);

    //needed to wait for async operations to complete shouldShowModalPathInUrl
    await Promise.resolve();

    expect(navigateSpy).toHaveBeenCalledWith('/redirect');
    expect(mockNavService.getCurrentNode).not.toHaveBeenCalled();
    expect(UIModule.updateMainContent).not.toHaveBeenCalled();
  });

  it('should not add hashchange event listener when useHashRouting is false', () => {
    mockLuigi.getConfig.mockReturnValue({ routing: { useHashRouting: false } });
    routingService.enableRouting();
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('hashchange', expect.any(Function));
  });

  describe('appendModalDataToUrl', () => {
    let locationSpy: any;
    let historyPushSpy: any;
    let historyReplaceSpy: any;
    let mockUrl: any;

    beforeEach(() => {
      locationSpy = jest.spyOn(window, 'location', 'get');
      historyPushSpy = jest.spyOn(window.history, 'pushState').mockImplementation(() => {});
      historyReplaceSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
      mockUrl = {
        href: 'http://localhost/#/home',
        hash: '#/home',
        pathname: '/home',
        search: '',
        toString: () => 'http://localhost/#/home'
      };
      jest.spyOn(global, 'URL').mockImplementation((url: string | URL, base?: string | URL) => {
        // Simulate URL constructor
        let hrefStr = typeof url === 'string' ? url : url.toString();
        return {
          ...mockUrl,
          href: hrefStr,
          hash: mockUrl.hash,
          pathname: mockUrl.pathname,
          search: mockUrl.search
        } as any;
      });

      jest.spyOn(RoutingHelpers, 'getHashQueryParamSeparator').mockReturnValue('?');
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue({});
      jest.spyOn(RoutingHelpers, 'getModalViewParamName').mockReturnValue('modalPath');
      jest.spyOn(RoutingHelpers, 'getURLWithoutModalData').mockReturnValue('');
      jest.spyOn(RoutingHelpers, 'handleHistoryState').mockImplementation((state, path) => ({ ...state, path }));
      jest.spyOn(RoutingHelpers, 'encodeParams').mockImplementation((params) => {
        return Object.entries(params)
          .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
          .join('&');
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should update hash and push state when hashRoutingActive and modalPath changes', () => {
      locationSpy.mockImplementation(() => ({
        ...mockUrl,
        hash: '#/home'
      }));
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(true); // hashRoutingActive
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue({ modalPath: 'oldPath' });

      routingService.appendModalDataToUrl('newPath', { foo: 'bar' });

      expect(RoutingHelpers.getQueryParams).toHaveBeenCalledWith(mockLuigi);
      expect(RoutingHelpers.getModalViewParamName).toHaveBeenCalledWith(mockLuigi);
      expect(RoutingHelpers.encodeParams).toHaveBeenCalledWith({
        modalPath: 'newPath',
        modalPathParams: JSON.stringify({ foo: 'bar' })
      });
      expect(historyPushSpy).toHaveBeenCalled();
    });

    it('should update search and push state when not hashRoutingActive and modalPath changes', () => {
      locationSpy.mockImplementation(() => ({
        ...mockUrl,
        search: ''
      }));
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(false); // hashRoutingActive
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue({ modalPath: 'oldPath' });

      routingService.appendModalDataToUrl('newPath', { foo: 'bar' });

      expect(RoutingHelpers.encodeParams).toHaveBeenCalledWith({
        modalPath: 'newPath',
        modalPathParams: JSON.stringify({ foo: 'bar' })
      });
      expect(historyPushSpy).toHaveBeenCalled();
    });

    it('should replace and push state when modalPath does not change (hashRoutingActive)', () => {
      locationSpy.mockImplementation(() => ({
        ...mockUrl,
        hash: '#/home'
      }));
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(true); // hashRoutingActive
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue({ modalPath: 'samePath' });

      routingService.appendModalDataToUrl('samePath', { foo: 'bar' });

      expect(historyReplaceSpy).toHaveBeenCalled();
      expect(historyPushSpy).toHaveBeenCalled();
    });

    it('should replace and push state when modalPath does not change (not hashRoutingActive)', () => {
      locationSpy.mockImplementation(() => ({
        ...mockUrl,
        search: ''
      }));
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(true); // hashRoutingActive
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue({ modalPath: 'samePath' });

      routingService.appendModalDataToUrl('samePath', { foo: 'bar' });

      expect(historyReplaceSpy).toHaveBeenCalled();
      expect(historyPushSpy).toHaveBeenCalled();
    });

    it('should not add modalPathParams if modalParams is empty', () => {
      locationSpy.mockImplementation(() => ({
        ...mockUrl,
        hash: '#/home'
      }));
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(true); // hashRoutingActive
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue({});

      routingService.appendModalDataToUrl('newPath', {});

      expect(RoutingHelpers.encodeParams).toHaveBeenCalledWith({
        modalPath: 'newPath'
      });
      expect(historyPushSpy).toHaveBeenCalled();
    });
  });
  describe('removeModalDataFromUrl', () => {
    let locationSpy: any;
    let historyPushSpy: any;
    let historyReplaceSpy: any;
    let historyGoSpy: any;
    let addEventListenerSpy: any;
    let mockUrl: any;
    let historyStateBackup: any;

    beforeEach(() => {
      locationSpy = jest.spyOn(window, 'location', 'get');
      historyPushSpy = jest.spyOn(window.history, 'pushState').mockImplementation(() => {});
      historyReplaceSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
      historyGoSpy = jest.spyOn(window.history, 'go').mockImplementation(() => {});
      addEventListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation(() => {});
      mockUrl = {
        href: 'http://localhost/#/home?modalPath=foo',
        hash: '#/home?modalPath=foo',
        pathname: '/home',
        search: '?modalPath=foo',
        toString: () => 'http://localhost/#/home?modalPath=foo'
      };
      jest.spyOn(global, 'URL').mockImplementation((url: string | URL, base?: string | URL) => {
        let hrefStr = typeof url === 'string' ? url : url.toString();
        return {
          ...mockUrl,
          href: hrefStr,
          hash: mockUrl.hash,
          pathname: mockUrl.pathname,
          search: mockUrl.search
        } as any;
      });
      jest.spyOn(RoutingHelpers, 'encodeParams').mockImplementation((params) => {
        return Object.entries(params)
          .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
          .join('&');
      });
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue({ modalPath: 'foo', modalPathParams: 'bar' });
      jest.spyOn(RoutingHelpers, 'getModalViewParamName').mockReturnValue('modalPath');
      historyStateBackup = window.history.state;
    });

    afterEach(() => {
      jest.restoreAllMocks();
      // window.history.state is read-only and cannot be reassigned
      // If you need to reset state, consider using history.replaceState if appropriate
      // window.history.state = historyStateBackup;
    });

    it('should remove modal data from hash when hashRoutingActive', () => {
      locationSpy.mockImplementation(() => ({
        ...mockUrl,
        hash: '#/home?modalPath=foo&modalPathParams=bar'
      }));
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(true); // hashRoutingActive

      routingService.removeModalDataFromUrl(false);

      expect(RoutingHelpers.getQueryParams).toHaveBeenCalledWith(mockLuigi);
      expect(RoutingHelpers.getModalViewParamName).toHaveBeenCalledWith(mockLuigi);
      expect(historyPushSpy).toHaveBeenCalled();
    });

    it('should remove modal data from search when not hashRoutingActive', () => {
      locationSpy.mockImplementation(() => ({
        ...mockUrl,
        search: '?modalPath=foo&modalPathParams=bar'
      }));
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(false); // not hashRoutingActive

      routingService.removeModalDataFromUrl(false);

      expect(historyPushSpy).toHaveBeenCalled();
    });

    it('should handle internal modal close with modalHistoryLength and historygap', () => {
      locationSpy.mockImplementation(() => ({
        ...mockUrl,
        hash: '#/home?modalPath=foo'
      }));
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(true);
      Object.defineProperty(window.history, 'state', {
        value: {
          modalHistoryLength: 2,
          pathBeforeHistory: '/home',
          historygap: 0
        },
        writable: true
      });
      Object.defineProperty(window.history, 'length', {
        value: 2,
        writable: true
      });

      routingService.removeModalDataFromUrl(true);

      expect(addEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function), { once: true });
      expect(historyGoSpy).toHaveBeenCalledWith(-2);
    });

    it('should handle internal modal close when modalHistoryLength > history.length', () => {
      locationSpy.mockImplementation(() => ({
        ...mockUrl,
        hash: '#/home?modalPath=foo'
      }));
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(true);
      Object.defineProperty(window.history, 'state', {
        value: {
          modalHistoryLength: 5,
          pathBeforeHistory: '/home',
          historygap: 1
        },
        writable: true
      });
      Object.defineProperty(window.history, 'length', {
        value: 2,
        writable: true
      });

      routingService.removeModalDataFromUrl(true);

      expect(addEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function), { once: true });
      expect(historyGoSpy).toHaveBeenCalledWith(-1);
      expect(mockLuigi.preventLoadingModalData).toBe(true);
    });

    it('should push state when isClosedInternal is false', () => {
      locationSpy.mockImplementation(() => ({
        ...mockUrl,
        hash: '#/home?modalPath=foo'
      }));
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(true);

      routingService.removeModalDataFromUrl(false);

      expect(historyPushSpy).toHaveBeenCalled();
    });
  });

  describe('handleBookmarkableModalPath', () => {
    let getModalPathFromPathSpy: jest.SpyInstance;
    let getModalParamsFromPathSpy: jest.SpyInstance;
    let extractDataFromPathSpy: jest.SpyInstance;
    let openAsModalSpy: jest.SpyInstance;

    beforeEach(() => {
      getModalPathFromPathSpy = jest.spyOn(RoutingHelpers, 'getModalPathFromPath');
      getModalParamsFromPathSpy = jest.spyOn(RoutingHelpers, 'getModalParamsFromPath');
      extractDataFromPathSpy = jest.spyOn(mockNavService, 'extractDataFromPath');
      openAsModalSpy = jest.fn();
      mockLuigi.navigation = jest.fn(() => ({ openAsModal: openAsModalSpy }));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should do nothing if additionalModalPath is falsy', async () => {
      getModalPathFromPathSpy.mockReturnValue('');
      await routingService.handleBookmarkableModalPath();
      expect(getModalPathFromPathSpy).toHaveBeenCalledWith(mockLuigi);
      expect(getModalParamsFromPathSpy).not.toHaveBeenCalled();
      expect(extractDataFromPathSpy).not.toHaveBeenCalled();
      expect(openAsModalSpy).not.toHaveBeenCalled();
    });

    it('should open modal with modalParams if additionalModalPath exists and modalParams is defined', async () => {
      getModalPathFromPathSpy.mockReturnValue('/modal/path');
      getModalParamsFromPathSpy.mockReturnValue({ foo: 'bar' });
      extractDataFromPathSpy.mockResolvedValue({ nodeObject: { openNodeInModal: { baz: 'qux' } } });

      await routingService.handleBookmarkableModalPath();

      expect(getModalPathFromPathSpy).toHaveBeenCalledWith(mockLuigi);
      expect(getModalParamsFromPathSpy).toHaveBeenCalledWith(mockLuigi);
      expect(extractDataFromPathSpy).toHaveBeenCalledWith('/modal/path');
      expect(openAsModalSpy).toHaveBeenCalledWith('/modal/path', { foo: 'bar' });
    });

    it('should open modal with nodeObject.openNodeInModal if modalParams is falsy', async () => {
      getModalPathFromPathSpy.mockReturnValue('/modal/path');
      getModalParamsFromPathSpy.mockReturnValue(undefined);
      extractDataFromPathSpy.mockResolvedValue({ nodeObject: { openNodeInModal: { baz: 'qux' } } });

      await routingService.handleBookmarkableModalPath();

      expect(openAsModalSpy).toHaveBeenCalledWith('/modal/path', { baz: 'qux' });
    });

    it('should open modal with undefined if both modalParams and nodeObject.openNodeInModal are falsy', async () => {
      getModalPathFromPathSpy.mockReturnValue('/modal/path');
      getModalParamsFromPathSpy.mockReturnValue(undefined);
      extractDataFromPathSpy.mockResolvedValue({ nodeObject: {} });

      await routingService.handleBookmarkableModalPath();

      expect(openAsModalSpy).toHaveBeenCalledWith('/modal/path', undefined);
    });
  });
});
