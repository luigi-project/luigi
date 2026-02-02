import { FeatureToggles } from '../../src/core-api/feature-toggles';

describe('FeatureToggles', () => {
  let featureToggles: FeatureToggles;

  beforeEach(() => {
    featureToggles = new FeatureToggles();
  });

  it('should set and unset feature toggle to list', async () => {
    expect(featureToggles.getActiveFeatureToggleList()).toEqual([]);
    featureToggles.setFeatureToggle('test');
    featureToggles.setFeatureToggle(12345);
    featureToggles.unsetFeatureToggle('foo');
    expect(featureToggles.getActiveFeatureToggleList()).toEqual(['test']);
    featureToggles.unsetFeatureToggle('test');

    expect(featureToggles.getActiveFeatureToggleList()).toEqual([]);
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
    expect((featureToggles as any).isValid('foo')).toEqual(true);
  });

  it('should check feature toggle is valid with a number', () => {
    expect((featureToggles as any).isValid(123)).toEqual(false);
  });
});
