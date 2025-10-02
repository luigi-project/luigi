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
      getContainerWrapper: jest.fn()
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
      getTabNavData: jest.fn()
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
      sinon
        .stub(routingService.luigi, 'getConfigValue')
        .withArgs('routing.skipRoutingForUrlPatterns')
        .returns(['foo_bar']);

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

  it('should handle hashchange event and call navigation methods', () => {
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

  it('should redirect if shouldRedirect returns a path', () => {
    mockLuigi.getConfig.mockReturnValue({ routing: { useHashRouting: true } });
    mockNavService.shouldRedirect.mockReturnValue('/redirect');
    const navigateSpy = jest.fn();
    mockLuigi.navigation = jest.fn(() => ({ navigate: navigateSpy }));

    routingService.enableRouting();

    const handler = addEventListenerSpy.mock.calls.find(([event]: [string]) => event === 'hashchange')?.[1];
    handler!({} as HashChangeEvent);

    expect(navigateSpy).toHaveBeenCalledWith('/redirect');
    expect(mockNavService.getCurrentNode).not.toHaveBeenCalled();
    expect(UIModule.updateMainContent).not.toHaveBeenCalled();
  });

  it('should not add hashchange event listener when useHashRouting is false', () => {
    mockLuigi.getConfig.mockReturnValue({ routing: { useHashRouting: false } });
    routingService.enableRouting();
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('hashchange', expect.any(Function));
  });
});
