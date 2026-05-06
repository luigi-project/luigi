import { test, fc } from '@fast-check/jest';
import { EscapingHelpers, RoutingHelpers } from '../../../src/utilities/helpers';

describe('EscapingHelpers - property-based tests', () => {
  describe('sanitizeHtml', () => {
    test.prop([fc.string()])('never contains dangerous protocol schemes', (input) => {
      const result = EscapingHelpers.sanitizeHtml(input);
      expect(result.toLowerCase()).not.toContain('javascript:');
      expect(result.toLowerCase()).not.toContain('data:');
      expect(result.toLowerCase()).not.toContain('vbscript:');
    });

    test.prop([fc.string()])('never contains unescaped angle brackets or quotes', (input) => {
      const result = EscapingHelpers.sanitizeHtml(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('"');
      expect(result).not.toContain("'");
    });

    test.prop([fc.string()])('ampersands are always escaped', (input) => {
      const result = EscapingHelpers.sanitizeHtml(input);
      const unescapedAmpersands = result.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, '');
      expect(unescapedAmpersands).not.toContain('&');
    });
  });

  describe('sanitizeParam', () => {
    test.prop([fc.string()])('never contains unescaped dangerous characters', (input) => {
      const result = EscapingHelpers.sanitizeParam(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('"');
      expect(result).not.toContain("'");
      expect(result).not.toContain('/');
    });

    test.prop([fc.string()])('is idempotent', (input) => {
      const once = EscapingHelpers.sanitizeParam(input);
      const twice = EscapingHelpers.sanitizeParam(once);
      expect(twice).toBe(once);
    });
  });
});

describe('RoutingHelpers - property-based tests', () => {
  describe('parseParams', () => {
    test.prop([
      fc.array(fc.tuple(fc.string({ unit: 'grapheme' }), fc.string({ unit: 'grapheme' })), {
        minLength: 1,
        maxLength: 5
      })
    ])('returns null-prototype object for well-formed params', (pairs) => {
      const paramsString = pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      const result = RoutingHelpers.parseParams(paramsString);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(Object.getPrototypeOf(result)).toBeNull();
    });

    test.prop([
      fc.array(fc.tuple(fc.string({ unit: 'grapheme' }), fc.string({ unit: 'grapheme' })), {
        minLength: 1,
        maxLength: 5
      })
    ])('all values are strings for well-formed input', (pairs) => {
      const paramsString = pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      const result = RoutingHelpers.parseParams(paramsString);
      for (const value of Object.values(result)) {
        expect(typeof value).toBe('string');
      }
    });

    test.prop([
      fc.array(fc.tuple(fc.string({ unit: 'grapheme' }), fc.string({ unit: 'grapheme' })), {
        minLength: 1,
        maxLength: 5
      })
    ])('no inherited properties leak from prototype', (pairs) => {
      const paramsString = pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      const result = RoutingHelpers.parseParams(paramsString);
      const keys = new Set(pairs.map(([k]) => k));
      if (!keys.has('constructor')) {
        expect(result.constructor).toBeUndefined();
      }
      if (!keys.has('__proto__')) {
        expect(result.__proto__).toBeUndefined();
      }
    });
  });
});
