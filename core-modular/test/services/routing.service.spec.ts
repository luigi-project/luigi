import { FeatureToggles } from '../../src/core-api/feature-toggles';
import { UIModule } from '../../src/modules/ui-module';
import { NavigationService, type ModalSettings } from '../../src/services/navigation.service';
import { RoutingService } from '../../src/services/routing.service';
import { serviceRegistry } from '../../src/services/service-registry';
import { RoutingHelpers } from '../../src/utilities/helpers/routing-helpers';

declare global {
  interface Window {
    state: any;
  }
}

describe('Routing Service', () => {
  let routingService: RoutingService;
  let navigationService: NavigationService;
  let mockLuigi: any;
  let mockNavService: any;
  let mockConnector: any;
  let addEventListenerSpy: jest.SpyInstance;

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
      setConfig: () => { },
      configChanged: () => { },
      featureToggles: () => new FeatureToggles(),
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
      extractDataFromPath: jest.fn(),
      getPathData: jest.fn(),
      findMatchingNode: jest.fn(),
      getPathParams: jest.fn(),
      leftNavItemClick: jest.fn()
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
    jest.resetAllMocks();
  });

  describe('shouldSkipRoutingForUrlPatterns', () => {
    let locationSpy: jest.SpyInstance;

    beforeEach(() => {
      locationSpy = jest.spyOn(window, 'location', 'get');
    });

    afterEach(() => {
      locationSpy.mockRestore();
      jest.restoreAllMocks();
      jest.resetAllMocks();
    });

    it('should return true if path matches default patterns', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de?access_token=bar'
        } as any;
      });

      const actual = routingService.shouldSkipRoutingForUrlPatterns();
      expect(actual).toBe(true);
    });

    it('should return true if path matches default patterns (id_token)', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de?id_token=foo'
        } as any;
      });

      const actual = routingService.shouldSkipRoutingForUrlPatterns();
      expect(actual).toBe(true);
    });

    it('should return true if path matches config patterns', () => {
      const getConfigValueSpy = (mockLuigi.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'routing.skipRoutingForUrlPatterns') {
          return ['foo_bar'];
        }
        return null;
      }));

      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de?foo_bar'
        } as any;
      });

      const actual = routingService.shouldSkipRoutingForUrlPatterns();
      expect(actual).toBe(true);

      getConfigValueSpy.mockRestore();
    });

    it('should return false if path does not match patterns', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/settings'
        } as any;
      });

      const actual = routingService.shouldSkipRoutingForUrlPatterns();
      expect(actual).toBe(false);
    });
  });

  it('should add hashchange event listener when useHashRouting is true', () => {
    mockLuigi.getConfig.mockReturnValue({ routing: { useHashRouting: true } });
    routingService.enableRouting();
    expect(addEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
  });

  it('should handle hashchange event and call navigation methods', async () => {
    mockLuigi.getConfig.mockReturnValue({ routing: { useHashRouting: true } });
    (mockNavService.shouldRedirect as jest.Mock).mockReturnValue(undefined);
    const fakeNode = { nodeParams: {}, searchParams: {} };
    (mockNavService.getCurrentNode as jest.Mock).mockReturnValue(fakeNode);

    routingService.enableRouting();

    const call = addEventListenerSpy.mock.calls.find(([event]: [string]) => event === 'hashchange');
    const handler = call?.[1];
    expect(handler).toBeInstanceOf(Function);

    handler!({} as HashChangeEvent);

    await Promise.resolve();

    expect(RoutingHelpers.getCurrentPath).toHaveBeenCalled();
    expect(RoutingHelpers.filterNodeParams).toHaveBeenCalled();
    expect(mockNavService.shouldRedirect).toHaveBeenCalledWith('/abc', undefined);
    expect(mockNavService.getCurrentNode).toHaveBeenCalledWith('/abc');
    expect(mockNavService.onNodeChange).toHaveBeenCalledWith(undefined, fakeNode);
    expect(mockConnector.renderTopNav).toHaveBeenCalled();
    expect(mockConnector.renderLeftNav).toHaveBeenCalled();
    expect(mockConnector.renderTabNav).toHaveBeenCalled();

    expect(UIModule.updateMainContent).toHaveBeenCalledWith(fakeNode, mockLuigi);
  });

  it('should redirect if shouldRedirect returns a path', async () => {
    mockLuigi.getConfig.mockReturnValue({ routing: { useHashRouting: true } });
    (mockNavService.shouldRedirect as jest.Mock).mockReturnValue('/redirect');
    const navigateSpy = jest.fn();
    mockLuigi.navigation = jest.fn(() => ({ navigate: navigateSpy }));

    routingService.enableRouting();

    const call = addEventListenerSpy.mock.calls.find(([event]: [string]) => event === 'hashchange');
    const handler = call?.[1];
    handler!({} as HashChangeEvent);

    // wait microtask queue for async ops used in handler
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
    let locationSpy: jest.SpyInstance;
    let historyPushSpy: jest.SpyInstance;
    let historyReplaceSpy: jest.SpyInstance;
    let mockUrl: any;

    beforeEach(() => {
      locationSpy = jest.spyOn(window, 'location', 'get');

      // ensure pushState/replaceState are mockable
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
      jest.spyOn(RoutingHelpers, 'encodeParams').mockImplementation((params: Record<string, any>) => {
        return Object.entries(params)
          .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
          .join('&');
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
    });

    it('should update hash and push state when hashRoutingActive and modalPath changes', () => {
      locationSpy.mockImplementation(
        () =>
          ({
            ...mockUrl,
            hash: '#/home'
          }) as any
      );
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(true); // hashRoutingActive
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue({ modalPath: 'oldPath' });

      routingService.appendModalDataToUrl('newPath', { title: 'bar' });

      expect(RoutingHelpers.getQueryParams).toHaveBeenCalledWith(mockLuigi);
      expect(RoutingHelpers.getModalViewParamName).toHaveBeenCalledWith(mockLuigi);
      expect(RoutingHelpers.encodeParams).toHaveBeenCalledWith({
        modalPath: 'newPath',
        modalPathParams: JSON.stringify({ title: 'bar' })
      });
      expect(historyPushSpy).toHaveBeenCalled();
    });

    it('should update search and push state when not hashRoutingActive and modalPath changes', () => {
      locationSpy.mockImplementation(
        () =>
          ({
            ...mockUrl,
            search: ''
          }) as any
      );
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(false); // hashRoutingActive
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue({ modalPath: 'oldPath' });

      routingService.appendModalDataToUrl('newPath', { title: 'bar' });

      expect(RoutingHelpers.encodeParams).toHaveBeenCalledWith({
        modalPath: 'newPath',
        modalPathParams: JSON.stringify({ title: 'bar' })
      });
      expect(historyPushSpy).toHaveBeenCalled();
    });

    it('should replace and push state when modalPath does not change (hashRoutingActive)', () => {
      locationSpy.mockImplementation(
        () =>
          ({
            ...mockUrl,
            hash: '#/home'
          }) as any
      );
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(true); // hashRoutingActive
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue({ modalPath: 'samePath' });

      routingService.appendModalDataToUrl('samePath', { title: 'bar' });

      expect(historyReplaceSpy).toHaveBeenCalled();
      expect(historyPushSpy).toHaveBeenCalled();
    });

    it('should replace and push state when modalPath does not change (not hashRoutingActive)', () => {
      locationSpy.mockImplementation(
        () =>
          ({
            ...mockUrl,
            search: ''
          }) as any
      );
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(true);
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue({ modalPath: 'samePath' });

      routingService.appendModalDataToUrl('samePath', { title: 'bar' });

      expect(historyReplaceSpy).toHaveBeenCalled();
      expect(historyPushSpy).toHaveBeenCalled();
    });

    it('should not add modalPathParams if modalParams is empty', () => {
      locationSpy.mockImplementation(
        () =>
          ({
            ...mockUrl,
            hash: '#/home'
          }) as any
      );
      jest.spyOn(mockLuigi, 'getConfigValue').mockReturnValue(true); // hashRoutingActive
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue({});

      routingService.appendModalDataToUrl('newPath', {});

      expect(RoutingHelpers.encodeParams).toHaveBeenCalledWith({
        modalPath: 'newPath'
      });
      expect(historyPushSpy).toHaveBeenCalled();
    });
  });

  describe('append and remove modal data from URL using hash/path routing', () => {
    const modalPath = encodeURIComponent('/project-modal');
    const modalParams = { title: 'world' };
    const params = {
      '~luigi': 'mario'
    };
    const modalParamName = 'mySpecialModal';
    let locationSpy: jest.SpyInstance;

    beforeEach(() => {
      locationSpy = jest.spyOn(window, 'location', 'get');
      // make history functions jest.fn so we can assert
      // assign directly to ensure they are mock functions
      // @ts-ignore
      window.history.replaceState = jest.fn();
      // @ts-ignore
      window.history.pushState = jest.fn();

      jest.spyOn(RoutingHelpers, 'getModalPathFromPath').mockReturnValue(modalPath);
      jest.spyOn(RoutingHelpers, 'getModalViewParamName').mockReturnValue(modalParamName);

      jest
        .spyOn(navigationService, 'extractDataFromPath')
        .mockResolvedValue({ nodeObject: {} as any, pathData: {} as any });
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockImplementation(() => ({ ...params }));
      jest.spyOn(RoutingHelpers, 'getHashQueryParamSeparator').mockReturnValue('?');
    });

    afterEach(() => {
      locationSpy.mockRestore();
      jest.restoreAllMocks();
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    it('append modal data to url with hash routing', () => {
      // jest.spyOn(RoutingHelpers, 'getQueryParams').mockReturnValue(params);
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/#/settings',
          hash: '#/settings'
        } as any;
      });
      window.state = {};
      mockLuigi.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'routing.useHashRouting') return true;
        return null;
      });
      const historyState = {
        modalHistoryLength: 1,
        historygap: 1,
        pathBeforeHistory: '/settings'
      };
      jest.spyOn(RoutingHelpers, 'handleHistoryState').mockReturnValue(historyState);

      routingService.appendModalDataToUrl(modalPath, modalParams);

      expect(window.history.pushState).toHaveBeenCalledWith(
        historyState,
        '',
        'http://some.url.de/#/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22title%22%3A%22world%22%7D'
      );
    });

    it('append modal data to url with path routing', () => {
      mockLuigi.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'routing.useHashRouting') return false;
        return null;
      });
      locationSpy.mockImplementation(
        () =>
          ({
            href: 'http://some.url.de/settings',
            hash: '',
            origin: 'http://some.url.de',
            pathname: '/settings',
            search: ''
          }) as any
      );
      window.state = {};
      const historyState = {
        modalHistoryLength: 1,
        historygap: 1,
        pathBeforeHistory: '/settings'
      };
      jest.spyOn(RoutingHelpers, 'handleHistoryState').mockReturnValue(historyState);

      routingService.appendModalDataToUrl(modalPath, modalParams);

      expect(window.history.pushState).toHaveBeenCalledWith(
        historyState,
        '',
        'http://some.url.de/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22title%22%3A%22world%22%7D'
      );
    });

    it('remove modal data from url with hash routing', () => {
      jest.spyOn(RoutingHelpers, 'getQueryParams').mockImplementation(() => ({
        '~luigi': 'mario',
        mySpecialModal: modalPath,
        mySpecialModalParams: JSON.stringify(modalParams)
      }));
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/#/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22title%22%3A%22world%22%7D',
          hash: '#/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22title%22%3A%22world%22%7D'
        } as any;
      });
      window.state = {};
      mockLuigi.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'routing.useHashRouting') return true;
        return null;
      });

      routingService.removeModalDataFromUrl(false);

      expect(window.history.pushState).toHaveBeenCalledWith({}, '', 'http://some.url.de/#/settings?~luigi=mario');
    });

    it('remove modal data from url with path routing', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22title%22%3A%22world%22%7D'
        } as any;
      });
      window.state = {};
      mockLuigi.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'routing.useHashRouting') return false;
        return null;
      });

      routingService.removeModalDataFromUrl(false);

      expect(window.history.pushState).toHaveBeenCalledWith({}, '', 'http://some.url.de/settings?~luigi=mario');
    });
  });

  describe('updateModalDataInUrl', () => {
    let locationSpy: jest.SpyInstance;
    const modalPath = encodeURIComponent('/project-modal');
    const modalParams = { title: 'world' };
    const params = {
      '~luigi': 'mario'
    };
    const modalParamName = 'mySpecialModal';
    beforeEach(() => {
      locationSpy = jest.spyOn(window, 'location', 'get');
      // ensure pushState/replaceState are mock functions
      // @ts-ignore
      window.history.replaceState = jest.fn();
      // @ts-ignore
      window.history.pushState = jest.fn();
      jest.spyOn(RoutingHelpers, 'getModalViewParamName').mockReturnValue('mySpecialModal');

      jest
        .spyOn(navigationService, 'extractDataFromPath')
        .mockResolvedValue({ nodeObject: {} as any, pathData: {} as any });
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
      locationSpy.mockRestore();
    });

    it('should update modal data in url when hash routing is active', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/#/settings?mySpecialModal=%252Fproject-modal',
          hash: '#/settings?mySpecialModal=%252Fproject-modal'
        } as any;
      });
      window.state = {};
      mockLuigi.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'routing.useHashRouting') return true;
        return null;
      });

      routingService.updateModalDataInUrl(modalPath, modalParams, false);

      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://some.url.de/#/settings?mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22title%22%3A%22world%22%7D'
      );
    });

    it('should update modal data in url when path routing is active', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/settings?mySpecialModal=%252Fproject-modal',
          hash: '#/settings?mySpecialModal=%252Fproject-modal'
        } as any;
      });
      window.state = {};
      mockLuigi.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'routing.useHashRouting') return false;
        return null;
      });

      routingService.updateModalDataInUrl(modalPath, modalParams, false);

      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://some.url.de/settings?mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22title%22%3A%22world%22%7D'
      );
    });

    it('should update modal data in url when modalParams change', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/settings?mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22title%22%3A%22world%22%7D',
          hash: '#/settings?mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22title%22%3A%22world%22%7D'
        } as any;
      });
      window.state = {};
      mockLuigi.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'routing.useHashRouting') return false;
        return null;
      });

      const newModalParams = { title: 'universe' };
      routingService.updateModalDataInUrl(modalPath, newModalParams, false);

      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://some.url.de/settings?mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22title%22%3A%22universe%22%7D'
      );
    });

    it('should remove previous modal data when it is not in updated modal data', () => {
      const mockModelSettings = { title: 'world' } as ModalSettings;
      routingService.modalSettings = mockModelSettings;
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/settings?mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22title%22%3A%22world%22%7D',
          hash: '#/settings?mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22title%22%3A%22world%22%7D'
        } as any;
      });
      window.state = {};
      mockLuigi.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'routing.useHashRouting') return false;
        return null;
      });

      const newModalParams: ModalSettings = { size: 's' };
      routingService.updateModalDataInUrl(modalPath, newModalParams, false);

      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://some.url.de/settings?mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22size%22%3A%22s%22%7D'
      );
    });
  });
});
