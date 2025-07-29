import { RoutingHelpers } from '../../../src/utilities/helpers/routing-helpers';
const chai = require('chai');
const assert = chai.assert;

describe('Navigation-helpers', () => {
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
        const params = { param1: 'value1', param2: 'value2'};
        const searchParams = new URLSearchParams('existingParam=existingValue');
        RoutingHelpers.modifySearchParams(params, searchParams, 'prefix_');
        assert.equal(searchParams.get('prefix_param1'), 'value1');
        assert.equal(searchParams.get('prefix_param2'), 'value2');
        assert.equal(searchParams.get('prefix_existingParam'), undefined);
    });
});