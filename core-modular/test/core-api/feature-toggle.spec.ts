import { FeatureToggles } from '../../src/core-api/feature-toggles';

const chai = require('chai');
const assert = chai.assert;

describe('FeatureToggles', () => {
  let featureToggles: FeatureToggles;

  beforeEach(() => {
    featureToggles = new FeatureToggles();
  });

  it('should set and unset feature toggle to list', async () => {
    assert.equal(featureToggles.getActiveFeatureToggleList(), 0);
    featureToggles.setFeatureToggle('test');
    featureToggles.setFeatureToggle(12345);
    featureToggles.unsetFeatureToggle('foo');
    assert.equal(featureToggles.getActiveFeatureToggleList(), 'test');
    featureToggles.unsetFeatureToggle('test');

    assert.equal(featureToggles.getActiveFeatureToggleList(), 0);
    featureToggles.setFeatureToggle('!bar');
    featureToggles.setFeatureToggle('test2');
    featureToggles.setFeatureToggle('test');

    assert.deepEqual(featureToggles.getActiveFeatureToggleList(), ['test2', 'test']);

    featureToggles.setFeatureToggle('bar');
    assert.deepEqual(featureToggles.getActiveFeatureToggleList(), ['test2', 'test', 'bar']);

    featureToggles.unsetFeatureToggle('test');
    assert.deepEqual(featureToggles.getActiveFeatureToggleList(), ['test2', 'bar']);

    assert.equal((featureToggles as any).isDuplicatedOrDisabled('bar'), true);
    assert.equal((featureToggles as any).isDuplicatedOrDisabled('foo'), false);
  });

  it('should check feature toggle is valid with a string', () => {
    const actual = (featureToggles as any).isValid('foo');
    const expect = true;

    assert.equal(actual, expect);
  });

  it('should check feature toggle is valid with a number', () => {
    const actual = (featureToggles as any).isValid(123);
    const expect = false;

    assert.equal(actual, expect);
  });
});
