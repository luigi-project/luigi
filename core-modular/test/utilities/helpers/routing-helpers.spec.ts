import { FeatureToggles } from '../../../src/core-api/feature-toggles';
import { RoutingHelpers } from '../../../src/utilities/helpers/routing-helpers';

const chai = require('chai');
const sinon = require('sinon');
import type { SinonStub } from 'sinon';
const assert = chai.assert;

describe('Routing-helpers', () => {
  let featureToggles: FeatureToggles;
  let luigi: any = {};

  beforeEach(() => {
    featureToggles = new FeatureToggles();
    luigi = {
      config: {},
      engine: {},
      getConfig: () => ({ routing: { contentViewParamPrefix: '~' } }),
      getEngine: () => ({}),
      setConfig: () => {},
      navigation: () => ({ navigate: () => {} }),
      routing: () => ({ getSearchParams: () => ({}) }),
      uxManager: () => ({}),
      linkManager: () => ({}),
      getConfigValue: (key: string) => {
        if (key === 'routing.contentViewParamPrefix') {
          return luigi.getConfig().routing.contentViewParamPrefix;
        }
        return null;
      },
      getActiveFeatureToggles: () => []
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('addParamsOnHashRouting should add parameters to hash routing', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const hash = '#/some/path?existingParam=existingValue';
    const updatedHash = RoutingHelpers.addParamsOnHashRouting(params, hash);
    assert.include(updatedHash, 'param1=value1');
    assert.include(updatedHash, 'param2=value2');
  });

  it('addParamsOnHashRouting should add parameters to hash routing with prefix', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const hash = '#/some/path?existingParam=existingValue&prefix_test=tets';
    const updatedHash = RoutingHelpers.addParamsOnHashRouting(params, hash, 'prefix_');
    assert.include(updatedHash, 'prefix_param1=value1');
    assert.include(updatedHash, 'prefix_param2=value2');
    assert.include(updatedHash, 'prefix_test=tets');
  });

  it('modifySearchParams should modify search parameters', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const searchParams = new URLSearchParams('existingParam=existingValue');
    RoutingHelpers.modifySearchParams(params, searchParams);
    assert.equal(searchParams.get('param1'), 'value1');
    assert.equal(searchParams.get('param2'), 'value2');
    assert.equal(searchParams.get('existingParam'), 'existingValue');
  });
  it('modifySearchParams should delete search parameters', () => {
    const params = { param1: 'value1', param2: 'value2', existingParam: undefined };
    const searchParams = new URLSearchParams('existingParam=existingValue');
    RoutingHelpers.modifySearchParams(params, searchParams);
    assert.equal(searchParams.get('param1'), 'value1');
    assert.equal(searchParams.get('param2'), 'value2');
    assert.equal(searchParams.get('existingParam'), undefined);
  });

  it('modifySearchParams should modify search parameters with prefex', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const searchParams = new URLSearchParams('existingParam=existingValue');
    RoutingHelpers.modifySearchParams(params, searchParams, 'prefix_');
    assert.equal(searchParams.get('prefix_param1'), 'value1');
    assert.equal(searchParams.get('prefix_param2'), 'value2');
    assert.equal(searchParams.get('prefix_existingParam'), undefined);
  });

  it('filterNodeParams should filter and sanitize node parameters', () => {
    const params = {
      '~param1': 'value1',
      '~param2': 'value2',
      otherParam: 'value3'
    };

    const filteredParams = RoutingHelpers.filterNodeParams(params, luigi as any);
    assert.deepEqual(filteredParams, { param1: 'value1', param2: 'value2' });
  });

  it('getContentViewParamPrefix should return the configured content view param prefix', () => {
    luigi.getConfig = () => ({ routing: { contentViewParamPrefix: '~' } });
    const prefix = RoutingHelpers.getContentViewParamPrefix(luigi);
    assert.equal(prefix, '~');
  });

  it('sanitizeParamsMap should sanitize parameter keys and values', () => {
    const paramsMap = {
      param1: 'value1',
      param2: '<script>alert("xss")</script>'
    };
    const sanitizedMap = RoutingHelpers.sanitizeParamsMap(paramsMap);
    assert.equal(sanitizedMap['param1'], 'value1');
    assert.equal(sanitizedMap['param2'], '&lt;script&gt;alert(&quot;xss&quot;)&lt;&sol;script&gt;');
  });

  it('getCurrentPath should return the current path and query', () => {
    const pathRaw = '#/some/path?param1=value1&param2=value2';
    location.hash = pathRaw; // Simulate the hash in the URL
    const currentPath = RoutingHelpers.getCurrentPath(true);
    assert.equal(currentPath.path, 'some/path');
    assert.equal(currentPath.query, 'param1=value1&param2=value2');
  });

  it('getCurrentPath should return the current path and query', () => {
    const pathRaw = '#/some/path';
    location.hash = pathRaw; // Simulate the hash in the URL
    const currentPath = RoutingHelpers.getCurrentPath(true);
    assert.equal(currentPath.path, 'some/path');
    assert.equal(currentPath.query, undefined);
  });

  it('prepareSearchParamsForClient should filter search params based on client permissions', () => {
    sinon.stub(luigi, 'routing').returns({
      getSearchParams: () => ({ param1: 'value1', param2: 'value2' })
    });
    const currentNode = {
      children: [],
      clientPermissions: {
        urlParameters: {
          param1: { read: true },
          param2: { read: false }
        }
      }
    };
    const filteredParams = RoutingHelpers.prepareSearchParamsForClient(currentNode, luigi);
    assert.deepEqual(filteredParams, { param1: 'value1' });
  });

  it('prepareSearchParamsForClient should return an empty object if no client permissions are defined', () => {
    sinon.stub(luigi, 'routing').returns({
      getSearchParams: () => ({ param1: 'value1', param2: 'value2' })
    });
    const currentNode = {
      children: []
    };
    const filteredParams = RoutingHelpers.prepareSearchParamsForClient(currentNode, luigi);
    assert.deepEqual(filteredParams, {});
  });

  describe('check valid wc url', function () {
    const sb = sinon.createSandbox();

    afterEach(() => {
      sb.restore();
    });

    it('check permission for relative and absolute urls from same domain', () => {
      assert.equal(RoutingHelpers.checkWCUrl('/folder/sth.js', luigi), true);
      assert.equal(RoutingHelpers.checkWCUrl('folder/sth.js', luigi), true);
      assert.equal(RoutingHelpers.checkWCUrl('./folder/sth.js', luigi), true);
      assert.equal(RoutingHelpers.checkWCUrl(window.location.href + '/folder/sth.js', luigi), true);
    });

    it('check permission and denial for urls based on config', () => {
      sb.stub(luigi, 'getConfigValue').returns([
        'https://fiddle.luigi-project.io/.?',
        'https://docs.luigi-project.io/.?'
      ]);

      assert.equal(RoutingHelpers.checkWCUrl('https://fiddle.luigi-project.io/folder/sth.js', luigi), true);
      assert.equal(RoutingHelpers.checkWCUrl('https://docs.luigi-project.io/folder/sth.js', luigi), true);
      assert.equal(RoutingHelpers.checkWCUrl('http://fiddle.luigi-project.io/folder/sth.js', luigi), false);
      assert.equal(RoutingHelpers.checkWCUrl('https://slack.luigi-project.io/folder/sth.js', luigi), false);
    });
  });

  describe('set feature toggle from url', () => {
    let mockPath = '/projects/pr1/settings?ft=test';

    beforeEach(() => {
      sinon.stub(featureToggles, 'setFeatureToggle');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('setFeatureToggle will be called', () => {
      RoutingHelpers.setFeatureToggles('ft', mockPath, featureToggles);
      sinon.assert.calledWith(featureToggles.setFeatureToggle, 'test');
    });

    it('setFeatureToggle will be called with two featureToggles', () => {
      mockPath = '/projects/pr1/settings?ft=test,test2';
      RoutingHelpers.setFeatureToggles('ft', mockPath, featureToggles);
      sinon.assert.calledWith(featureToggles.setFeatureToggle, 'test');
      sinon.assert.calledWith(featureToggles.setFeatureToggle, 'test2');
    });

    it("setFeatureToggle won't be called with wrong queryParam name", () => {
      RoutingHelpers.setFeatureToggles('fft', mockPath, featureToggles);
      sinon.assert.notCalled(featureToggles.setFeatureToggle);
    });
  });

  it('getHashQueryParamSeparator', () => {
    assert.equal(RoutingHelpers.getHashQueryParamSeparator(), '?');
  });

  describe('getURLWithoutModalData', () => {
    const modalParamName = 'mymodal';
    it('getURLWithoutModalData with additional search params', () => {
      let searchParamsString =
        '~test=tets&foo=bar&mymodal=%2Fsettings%2FhistoryMf&mymodalParams=%7B%22size%22%3A%22m%22%2C%22title%22%3A%22furz%22%7D';
      let urlWithoutModalData = RoutingHelpers.getURLWithoutModalData(searchParamsString, modalParamName);
      assert.equal(urlWithoutModalData, '%7Etest=tets&foo=bar');
    });
    it('getURLWithoutModalData with additional search params', () => {
      let searchParamsString =
        'mymodal=%2Fsettings%2FhistoryMf&mymodalParams=%7B%22size%22%3A%22m%22%2C%22title%22%3A%22furz%22%7D';
      let urlWithoutModalData = RoutingHelpers.getURLWithoutModalData(searchParamsString, modalParamName);
      assert.equal(urlWithoutModalData, '');
    });
  });

  describe('getModalViewParamName', () => {
    beforeEach(() => {
      sinon.stub(luigi, 'getConfigValue');
    });
    afterEach(() => {
      sinon.restore();
    });
    it('without config value', () => {
      assert.equal(RoutingHelpers.getModalViewParamName(luigi), 'modal');
    });
    it('without config value', () => {
      luigi.getConfigValue.returns('custom');
      assert.equal(RoutingHelpers.getModalViewParamName(luigi), 'custom');
    });
  });

  describe('getModalPathFromPath & getModalParamsFromPath', () => {
    let mockLocation: any = { href: 'http://localhost', search: '' };
    let modalViewParamName = 'modal';
    let getModalViewParamNameStub: any;
    let getLocationStub: any;
    beforeEach(() => {
      getModalViewParamNameStub = sinon.stub(RoutingHelpers, 'getModalViewParamName').returns(modalViewParamName);
      getLocationStub = sinon.stub(RoutingHelpers, 'getLocation').returns(mockLocation);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('without modal param', () => {
      assert.equal(RoutingHelpers.getModalPathFromPath(luigi), null);
    });
    it('with modal', () => {
      mockLocation.search = '?modal=%2Fhome%2Fchild-2';
      assert.equal(RoutingHelpers.getModalPathFromPath(luigi), '/home/child-2');
    });
    it('with modal params', () => {
      mockLocation.search = '?modal=%2Fhome%2Fchild-2&modalParams=%7B%22title%22%3A%22Real%20Child%22%7D';
      assert.equal(RoutingHelpers.getModalPathFromPath(luigi), '/home/child-2');
      assert.deepEqual(RoutingHelpers.getModalParamsFromPath(luigi), { title: 'Real Child' });
    });
    it('with custom modal param name', () => {
      getModalViewParamNameStub.returns('custom');
      mockLocation.search = '?custom=%2Fhome%2Fchild-2&customParams=%7B%22title%22%3A%22Real%20Child%22%7D';
      assert.equal(RoutingHelpers.getModalPathFromPath(luigi), '/home/child-2');
      assert.deepEqual(RoutingHelpers.getModalParamsFromPath(luigi), { title: 'Real Child' });
    });
  });

  describe('parseParams', () => {
    let mockParams;

    it('return pairs of params', () => {
      mockParams = 'test=true&foo=bar';
      assert.deepEqual(RoutingHelpers.parseParams(mockParams), {
        test: 'true',
        foo: 'bar'
      });
    });

    it('return pairs of params 2', () => {
      mockParams = 'test=true&tets&test=false&foo&luigi=is+mega%20super';
      assert.deepEqual(RoutingHelpers.parseParams(mockParams), {
        foo: '',
        test: 'false',
        tets: '',
        luigi: 'is mega super'
      });
    });

    it('should not fail on empty params', () => {
      mockParams = '';
      assert.deepEqual(RoutingHelpers.parseParams(mockParams), {});
    });

    it('return pairs of params with a space and a plus', () => {
      mockParams = 'test=true+abc&foo=bar%2Babc';
      assert.deepEqual(RoutingHelpers.parseParams(mockParams), {
        test: 'true abc',
        foo: 'bar+abc'
      });
    });
  });

  describe('getLocationSearchQueryParams', () => {
    let getLocationStub: SinonStub | undefined;
    afterEach(() => {
      if (getLocationStub) {
        getLocationStub.restore();
        getLocationStub = undefined;
      }
    });

    function stubLocationSearch(searchValue: string): void {
      if (getLocationStub) getLocationStub.restore();
      getLocationStub = sinon.stub(RoutingHelpers, 'getLocation').returns({ search: searchValue } as any);
    }

    it('returns empty object when no search part', () => {
      stubLocationSearch('');
      assert.deepEqual(RoutingHelpers.getLocationSearchQueryParams(), {});
    });

    it('returns empty object when only "?" present', () => {
      stubLocationSearch('?');
      assert.deepEqual(RoutingHelpers.getLocationSearchQueryParams(), {});
    });

    it('parses single parameter', () => {
      stubLocationSearch('?foo=bar');
      assert.deepEqual(RoutingHelpers.getLocationSearchQueryParams(), { foo: 'bar' });
    });

    it('parses multiple parameters', () => {
      stubLocationSearch('?foo=bar&baz=qux');
      assert.deepEqual(RoutingHelpers.getLocationSearchQueryParams(), { foo: 'bar', baz: 'qux' });
    });

    it('decodes encoded characters', () => {
      stubLocationSearch('?a=1%202&b=sp%2Bce');
      assert.deepEqual(RoutingHelpers.getLocationSearchQueryParams(), { a: '1 2', b: 'sp+ce' });
    });

    it('converts plus sign to space', () => {
      stubLocationSearch('?q=hello+world+test');
      assert.deepEqual(RoutingHelpers.getLocationSearchQueryParams(), { q: 'hello world test' });
    });
  });
});
