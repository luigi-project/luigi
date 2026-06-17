import { Helpers } from '../../src/helpers';

describe('jest setup smoke test', () => {
  it('runs a passing test', () => {
    expect(1 + 1).toBe(2);
  });

  it('imports plugin source via babel-jest', () => {
    expect(typeof Helpers.deepMerge).toBe('function');
  });

  it('exposes the mocked Luigi global', () => {
    expect(typeof global.Luigi.getConfigValue).toBe('function');
  });
});
