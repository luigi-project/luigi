import { test, fc } from '@fast-check/jest';
import { EscapingHelpers } from '../../../src/utilities/helpers/escaping-helpers';
import { RoutingHelpers } from '../../../src/utilities/helpers/routing-helpers';

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
      const withoutEntities = result.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, '');
      expect(withoutEntities).not.toContain('&');
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

  describe('sanitizeParamsMap', () => {
    test.prop([
      fc.dictionary(fc.string({ minLength: 1 }), fc.string())
    ])('all keys and values are sanitized', (paramsMap) => {
      const result = RoutingHelpers.sanitizeParamsMap(paramsMap);
      for (const key of Object.keys(result)) {
        expect(key).not.toContain('<');
        expect(key).not.toContain('>');
        expect(key).not.toContain('/');
      }
      for (const value of Object.values(result)) {
        expect(value).not.toContain('<');
        expect(value).not.toContain('>');
        expect(value).not.toContain('/');
      }
    });
  });
});
