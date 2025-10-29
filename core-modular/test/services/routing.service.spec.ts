import { UIModule } from '../../src/modules/ui-module';
import { NavigationService } from '../../src/services/navigation.service';
import { RoutingService } from '../../src/services/routing.service';
import { serviceRegistry } from '../../src/services/service-registry';
import { RoutingHelpers } from '../../src/utilities/helpers/routing-helpers';

declare global {
  interface Window {
    state: any;
  }
}

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('Routing Service', () => {
  let routingService: RoutingService;
  let navigationService: NavigationService;
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
      showLoadingIndicator: jest.fn(),
      closeModals: jest.fn()
    };
    mockLuigi = {
      config: {},
      engine: {},
      setConfig: () => { },
      configChanged: () => { },
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
    navigationService = new NavigationService(mockLuigi);

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
      historyPushSpy = jest.spyOn(window.history, 'pushState').mockImplementation(() => { });
      historyReplaceSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => { });
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


  describe('append and remove modal data from URL using hash routing', () => {
    const modalPath = encodeURIComponent('/project-modal');
    const modalParams = { hello: 'world' };
    const params = {
      '~luigi': 'mario'
    };
    const modalParamName = 'mySpecialModal';
    let locationSpy: any;

    beforeEach(() => {
      locationSpy = jest.spyOn(window, 'location', 'get');
      history.replaceState = sinon.spy();
      history.pushState = sinon.spy();
      sinon.stub(RoutingHelpers, 'getModalPathFromPath').returns(modalPath);
      sinon.stub(RoutingHelpers, 'getModalViewParamName').returns(modalParamName);

      sinon.stub(navigationService, 'extractDataFromPath').returns({ nodeObject: {} });

    });

    afterEach(() => {
      sinon.restore();
      locationSpy.mockRestore();
    });

    it('append modal data to url with hash routing', () => {
      sinon.stub(RoutingHelpers, 'getQueryParams').returns(params);
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/#/settings',
          hash: '#/settings'
        };
      });
      window.state = {};
      sinon
        .stub(mockLuigi, 'getConfigValue')
        .withArgs('routing.useHashRouting')
        .returns(true);
      let historyState = {
        modalHistoryLength: 1,
        historygap: 1,
        pathBeforeHistory: '/settings'
      };
      sinon.stub(RoutingHelpers, 'handleHistoryState').returns(historyState);
      try {
        routingService.appendModalDataToUrl(modalPath, modalParams);
      } catch (error) {
        console.log('error', error);
      }
      // then
      sinon.assert.calledWith(
        history.pushState,
        historyState,
        '',
        'http://some.url.de/#/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22hello%22%3A%22world%22%7D'
      );
    });

    it('remove modal data from url with hash routing', () => {
      sinon.stub(RoutingHelpers, 'getQueryParams').returns(params);
      locationSpy.mockImplementation(() => {
        return {
          href:
            'http://some.url.de/#/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22hello%22%3A%22world%22%7D',
          hash:
            '#/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22hello%22%3A%22world%22%7D'
        };
      });
      window.state = {};
      sinon
        .stub(mockLuigi, 'getConfigValue')
        .withArgs('routing.useHashRouting')
        .returns(true);
      try {
        routingService.removeModalDataFromUrl(false);
      } catch (error) {
        console.log('error', error);
      }
      sinon.assert.calledWithExactly(window.history.pushState, {}, '', 'http://some.url.de/#/settings?~luigi=mario');
    });
  });
});
