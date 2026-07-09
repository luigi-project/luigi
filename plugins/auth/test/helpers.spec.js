import { Helpers } from '../src/helpers';

describe('Helpers.prependOrigin', () => {
  it('returns an http:// URL unchanged', () => {
    expect(Helpers.prependOrigin('http://example.com/path')).toBe(
      'http://example.com/path',
    );
  });

  it('returns an https:// URL unchanged', () => {
    expect(Helpers.prependOrigin('https://example.com/path')).toBe(
      'https://example.com/path',
    );
  });

  it('prepends origin for a leading-slash relative path', () => {
    expect(Helpers.prependOrigin('/callback')).toBe(
      window.location.origin + '/callback',
    );
  });

  it('prepends origin (with slash) for a bare relative path', () => {
    expect(Helpers.prependOrigin('callback')).toBe(
      window.location.origin + '/callback',
    );
  });

  it('returns origin alone for an empty path', () => {
    expect(Helpers.prependOrigin('')).toBe(window.location.origin);
  });

  // Security tightening: previously `startsWith('http')` accepted schemes like
  // `httpevil://` and passed them through unchanged as a "full URL". They must
  // now be treated as relative paths and prepended with the current origin.
  it('does not treat a lookalike scheme (httpevil://...) as absolute', () => {
    const result = Helpers.prependOrigin('httpevil://attacker.example/path');
    expect(result.startsWith(window.location.origin + '/httpevil://')).toBe(
      true,
    );
  });

  it('does not treat "https-foo://..." as absolute', () => {
    const result = Helpers.prependOrigin('https-foo://attacker.example/path');
    expect(result.startsWith(window.location.origin + '/https-foo://')).toBe(
      true,
    );
  });
});
