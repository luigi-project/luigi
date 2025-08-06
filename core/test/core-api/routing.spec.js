import { LuigiRouting, LuigiConfig } from '../../src/core-api';
import { RoutingHelpers } from '../../src/utilities/helpers';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('Luigi routing', function () {
  let locationSpy;

  beforeEach(() => {
    locationSpy = jest.spyOn(window, 'location', 'get');
    window.history.pushState = sinon.spy();
    window.history.replaceState = sinon.spy();
    sinon.stub(LuigiConfig, 'configChanged');
  });

  afterEach(() => {
    locationSpy.mockRestore();
    sinon.restore();
  });

  describe('SearchParams path routing', () => {
    it('get searchparams', () => {
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de?test=tets&luigi=rocks');
      });
      assert.deepEqual(LuigiRouting.getSearchParams(), { test: 'tets', luigi: 'rocks' });
    });
    it('get searchparams', () => {
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/something?test=tets&luigi=rocks');
      });
      assert.deepEqual(LuigiRouting.getSearchParams(), { test: 'tets', luigi: 'rocks' });
    });
    it('get searchparams when no query parameter', () => {
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de');
      });
      assert.deepEqual(LuigiRouting.getSearchParams(), {});
    });
    it('set searchparams', () => {
      window.state = {};
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de');
      });
      LuigiRouting.addSearchParams({ foo: 'bar' }, true);
      sinon.assert.calledWithExactly(window.history.pushState, window.state, '', 'http://some.url.de/?foo=bar');
    });
    it('set searchparams without keeping browser history', () => {
      window.state = {};
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de');
      });
      LuigiRouting.addSearchParams({ foo: 'bar' }, false);
      sinon.assert.calledWithExactly(window.history.replaceState, window.state, '', 'http://some.url.de/?foo=bar');
    });
    it('add search params to searchparams', () => {
      window.state = {};
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de?test=tets');
      });
      LuigiRouting.addSearchParams({ foo: 'bar' }, true);
      sinon.assert.calledWithExactly(
        window.history.pushState,
        window.state,
        '',
        'http://some.url.de/?test=tets&foo=bar'
      );
    });
    it('call addSearchParams with wrong argument', () => {
      console.log = sinon.spy();
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de');
      });
      LuigiRouting.addSearchParams('bar', true);
      sinon.assert.calledWith(console.log, 'Params argument must be an object');
    });
    it('delete search params from url with keepBrowserHistory is true', () => {
      window.state = {};
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de?luigi=rocks&mario=red');
      });
      LuigiRouting.addSearchParams({ mario: undefined }, true);
      sinon.assert.calledWithExactly(window.history.pushState, window.state, '', 'http://some.url.de/?luigi=rocks');
    });
    it('delete search params from url with keepBrowserHistory is false', () => {
      window.state = {};
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de?luigi=rocks&mario=red');
      });
      LuigiRouting.addSearchParams({ mario: undefined }, false);
      sinon.assert.calledWithExactly(window.history.replaceState, window.state, '', 'http://some.url.de/?luigi=rocks');
    });
  });
  describe('SearchParams hash routing', () => {
    beforeEach(() => {
      sinon.stub(LuigiConfig, 'getConfigValue').withArgs('routing.useHashRouting').returns(true);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('get searchparams hash routing', () => {
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/#/?test=tets&luigi=rocks');
      });
      assert.deepEqual(LuigiRouting.getSearchParams(), { test: 'tets', luigi: 'rocks' });
    });
    it('get searchparams', () => {
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/#/something?test=tets&luigi=rocks');
      });
      assert.deepEqual(LuigiRouting.getSearchParams(), { test: 'tets', luigi: 'rocks' });
    });
    it('get searchparams hash routing', () => {
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/#/');
      });
      assert.deepEqual(LuigiRouting.getSearchParams(), {});
    });
    it('get searchparams avoiding prototype pollution', () => {
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/#/?test=tets&luigi=rocks&__proto__=polluted');
      });
      assert.deepEqual(LuigiRouting.getSearchParams(), { test: 'tets', luigi: 'rocks' });
    });
    it('add searchparams hash routing', () => {
      window.state = {};
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/#/');
      });
      LuigiRouting.addSearchParams({ foo: 'bar' }, true);
      sinon.assert.calledWithExactly(window.history.pushState, window.state, '', 'http://some.url.de/#/?foo=bar');
    });
    it('add search params to hash routing', () => {
      window.state = {};
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/#/?test=tets');
      });
      LuigiRouting.addSearchParams({ foo: 'bar' }, true);
      sinon.assert.calledWithExactly(
        window.history.pushState,
        window.state,
        '',
        'http://some.url.de/#/?test=tets&foo=bar'
      );
    });
    it('add search params to hash routing with special characters', () => {
      window.state = {};

      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/#/?test=tets');
      });
      LuigiRouting.addSearchParams({ foo: '%bar#foo@bar&foo' }, true);
      sinon.assert.calledWithExactly(
        window.history.pushState,
        window.state,
        '',
        'http://some.url.de/#/?test=tets&foo=%25bar%23foo%40bar%26foo'
      );
    });
    it('add search params to hash routing', () => {
      window.state = {};

      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/#/?~luigi=rocks');
      });
      LuigiRouting.addSearchParams({ foo: 'bar' }, true);
      sinon.assert.calledWithExactly(
        window.history.pushState,
        window.state,
        '',
        'http://some.url.de/#/?%7Eluigi=rocks&foo=bar'
      );
    });
    it('call addSearchParams with wrong argument hash routing', () => {
      console.log = sinon.spy();
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/#/');
      });
      LuigiRouting.addSearchParams('bar', true);
      sinon.assert.calledWith(console.log, 'Params argument must be an object');
    });
    it('delete search params from url', () => {
      window.state = {};

      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/#/?luigi=rocks&mario=red');
      });
      LuigiRouting.addSearchParams({ mario: undefined }, true);
      sinon.assert.calledWithExactly(window.history.pushState, window.state, '', 'http://some.url.de/#/?luigi=rocks');
    });
  });

  describe('modifySearchParams', () => {
    beforeEach(() => {
      sinon.stub(LuigiConfig, 'getConfigValue').withArgs('routing.useHashRouting').returns(false);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('modifySearchParams', () => {
      const searchParams = new URLSearchParams('mario=rocks');
      RoutingHelpers.modifySearchParams({ test: 'tets', luigi: 'rocks', mario: undefined }, searchParams);
      assert.equal(searchParams.toString(), 'test=tets&luigi=rocks');
    });
    it('modifySearchParams with paramPrefix', () => {
      const searchParams = new URLSearchParams('~mario=rocks');
      RoutingHelpers.modifySearchParams({ test: 'tets', luigi: 'rocks' }, searchParams, '~');
      assert.equal(searchParams.toString(), '%7Emario=rocks&%7Etest=tets&%7Eluigi=rocks');
    });
    it('modifySearchParams with space', () => {
      const searchParams = new URLSearchParams('~mario=rocks');
      RoutingHelpers.modifySearchParams({ test: 'test abc' }, searchParams, '~');
      assert.equal(searchParams.toString(), '%7Emario=rocks&%7Etest=test+abc');
    });
    it('modifySearchParams with a plus sign', () => {
      const searchParams = new URLSearchParams('~mario=rocks');
      RoutingHelpers.modifySearchParams({ test: 'test+abc' }, searchParams, '~');
      assert.equal(searchParams.toString(), '%7Emario=rocks&%7Etest=test%2Babc');
    });
  });

  describe('addNodeParams', () => {
    it('add node Params', () => {
      window.state = {};

      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de');
      });
      LuigiRouting.addNodeParams({ foo: 'bar' }, true);
      sinon.assert.calledWithExactly(window.history.pushState, window.state, '', 'http://some.url.de/?%7Efoo=bar');
    });
    it('add node Params without keeping browser history', () => {
      window.state = {};

      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de');
      });
      LuigiRouting.addNodeParams({ foo: 'bar' }, false);
      sinon.assert.calledWithExactly(window.history.replaceState, window.state, '', 'http://some.url.de/?%7Efoo=bar');
    });
    it('add more node param to existing node params', () => {
      window.state = {};

      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de?~test=tets');
      });
      LuigiRouting.addNodeParams({ foo: 'bar' }, true);
      sinon.assert.calledWithExactly(
        window.history.pushState,
        window.state,
        '',
        'http://some.url.de/?%7Etest=tets&%7Efoo=bar'
      );
    });
    it('call addNodeParams with wrong argument', () => {
      console.log = sinon.spy();

      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de');
      });
      LuigiRouting.addNodeParams('bar', true);
      sinon.assert.calledWith(console.log, 'Params argument must be an object');
    });
    it('remove node param if value of params object is undefined', () => {
      window.state = {};

      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de');
      });
      LuigiRouting.addNodeParams({ test: undefined }, false);
      sinon.assert.calledWithExactly(window.history.replaceState, window.state, '', 'http://some.url.de/');
      LuigiRouting.addNodeParams({ foo: 'bar' }, false);
      sinon.assert.calledWithExactly(window.history.replaceState, window.state, '', 'http://some.url.de/?%7Efoo=bar');
      LuigiRouting.addNodeParams({ foo: undefined }, false);
      sinon.assert.calledWithExactly(window.history.replaceState, window.state, '', 'http://some.url.de/');
    });
  });

  describe('Anchor without hash routing', () => {
    it('Set and get anchor', () => {
      const anchor = '#myanchor';
      LuigiRouting.setAnchor(anchor);
      assert.equal(window.location.hash, anchor);

      const expected = LuigiRouting.getAnchor();
      assert.equal(`#${expected}`, anchor);
    });

    it('get anchor when no anchor set', () => {
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de');
      });

      const actual = LuigiRouting.getAnchor();
      const expected = '';
      assert.equal(actual, expected);
    });

    it('set anchor', () => {
      const href = window.location.href;
      const anchor = 'myanchor';
      LuigiRouting.setAnchor(anchor);
      const expected = href + '#myanchor';
      assert.equal(window.location + window.location.hash, expected);
    });
  });

  describe('Anchor with hash routing', () => {
    beforeEach(() => {
      sinon.stub(LuigiConfig, 'getConfigValue').withArgs('routing.useHashRouting').returns(true);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('get anchor', () => {
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/#/luigi#myanchor');
      });
      const actual = LuigiRouting.getAnchor();
      const expected = 'myanchor';
      assert.equal(actual, expected);
    });
    it('set anchor', () => {
      locationSpy.mockImplementation(() => {
        return new URL('http://some.url.de/#/luigi');
      });
      const anchor = 'myanchor';
      LuigiRouting.setAnchor(anchor);
      const actual = `${window.location}#${anchor}`;
      const expected = 'http://some.url.de/#/luigi#myanchor';
      assert.equal(actual, expected);
    });
  });
});
