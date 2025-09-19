// @ts-nocheck
import { getAllowRules } from '../../src/services/iframe-helpers';

describe('getAllowRules function', () => {
  it('returns undefined if allowRules is undefined', () => {
    expect(getAllowRules(undefined)).toBeUndefined();
  });

  it('returns an empty string if allowRules is an empty array', () => {
    expect(getAllowRules([])).toBe('');
  });

  it('if semicolon already present, keep it.', () => {
    const allowRules = ['rule1', 'rule2;', 'rule3;'];
    const expectedRules = 'rule1; rule2; rule3;';
    expect(getAllowRules(allowRules)).toBe(expectedRules);
  });

  it('replaces double quotes with single quotes in each rule', () => {
    const allowRules = [
      'fullscreen',
      'microphone',
      'camera "none"',
      'geolocation "self" https://a.example.com https://b.example.com'
    ];
    const expectedRules =
      "fullscreen; microphone; camera 'none'; geolocation 'self' https://a.example.com https://b.example.com;";
    expect(getAllowRules(allowRules)).toBe(expectedRules);
  });
});
