import { FeatureToggles } from '../../src/core-api/feature-toggles';

describe('FeatureToggles', () => {
  let featureToggles: FeatureToggles;

  beforeEach(() => {
    featureToggles = new FeatureToggles();
  });

  it('should set and unset feature toggle to list', async () => {
    expect(featureToggles.getActiveFeatureToggleList()).toEqual(0);
    featureToggles.setFeatureToggle('test');
    featureToggles.setFeatureToggle(12345);
    featureToggles.unsetFeatureToggle('foo');
    expect(featureToggles.getActiveFeatureToggleList()).toEqual('test');
    featureToggles.unsetFeatureToggle('test');

    expect(featureToggles.getActiveFeatureToggleList()).toEqual(0);
    featureToggles.setFeatureToggle('!bar');
    featureToggles.setFeatureToggle('test2');
    featureToggles.setFeatureToggle('test');

    expect(featureToggles.getActiveFeatureToggleList()).toEqual(['test2', 'test']);

    featureToggles.setFeatureToggle('bar');
    expect(featureToggles.getActiveFeatureToggleList()).toEqual(['test2', 'test', 'bar']);

    featureToggles.unsetFeatureToggle('test');
    expect(featureToggles.getActiveFeatureToggleList()).toEqual(['test2', 'bar']);

    expect((featureToggles as any).isDuplicatedOrDisabled('bar')).toEqual(true);
    expect((featureToggles as any).isDuplicatedOrDisabled('foo')).toEqual(false);
  });

  it('should check feature toggle is valid with a string', () => {
    const actual = (featureToggles as any).isValid('foo');
    const expect = true;

    expect(actual).toEqual(expect);
  });

  it('should check feature toggle is valid with a number', () => {
    const actual = (featureToggles as any).isValid(123);
    const expect = false;

    expect(actual).toEqual(expect);
  });
});
