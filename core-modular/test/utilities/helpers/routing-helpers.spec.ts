import { get } from 'lodash';
import { RoutingHelpers } from '../../../src/utilities/helpers/routing-helpers';
import { Routing } from '../../../src/core-api/routing';
const chai = require('chai');
const sinon = require('sinon');
const assert = chai.assert;

describe('Routing-helpers', () => {
  let luigi: any = {};
  beforeEach(() => {
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
});
