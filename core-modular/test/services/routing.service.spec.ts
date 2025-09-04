import { RoutingService } from '../../src/services/routing.service';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('Routing Service', ()=> {
  let luigi: any = {};
  let routingService: RoutingService;

  beforeEach(() => {
    luigi = {
      config: {},
      engine: {},
      getConfig: () => ({ routing: { contentViewParamPrefix: '~' } }),
      getEngine: () => ({}),
      setConfig: () => {},
      configChanged: () => {},
      navigation: () => ({ navigate: () => {} }),
      routing: () => ({ getSearchParams: () => ({}) }),
      uxManager: () => ({}),
      linkManager: () => ({}),
      getConfigValue: () => null,
      getActiveFeatureToggles: () => []
    };
    routingService = new RoutingService(luigi);
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
});