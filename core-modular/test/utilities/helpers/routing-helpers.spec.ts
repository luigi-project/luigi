import { RoutingHelpers } from '../../../src/utilities/helpers/routing-helpers';
const chai = require('chai');
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
      'otherParam': 'value3'
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
      'param1': 'value1',
      'param2': '<script>alert("xss")</script>'
    };
    const sanitizedMap = RoutingHelpers.sanitizeParamsMap(paramsMap);
    assert.equal(sanitizedMap['param1'], 'value1');
    assert.equal(sanitizedMap['param2'], '&lt;script&gt;alert(&quot;xss&quot;)&lt;&sol;script&gt;');
  });
});
