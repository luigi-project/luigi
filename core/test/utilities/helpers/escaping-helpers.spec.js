import { assert } from 'chai';
import * as sinon from 'sinon';
import { EscapingHelpers } from '../../../src/utilities/helpers';

describe('Escaping-helpers', () => {
  it('sanitizeHtml', () => {
    const text = '&<>"\'';
    const sanitizedHtml = EscapingHelpers.sanitizeHtml(text);
    assert.equal(sanitizedHtml, '&amp;&lt;&gt;&quot;&#39;');

    const text2 = `This is text <img src="http://url.to.file.which/not.exist" onerror=alert(document.cookie); onclick=javascript:alert(document.cookie)><br><IMG SRC=j&#X41vascript:alert('test2')><br>`;
    const sanitizedHtml2 = EscapingHelpers.sanitizeHtml(text2);
    assert.equal(
      sanitizedHtml2,
      'This is text &lt;img src=&quot;http://url.to.file.which/not.exist&quot; onerror=alert(document.cookie); onclick=alert(document.cookie)&gt;&lt;br&gt;&lt;IMG SRC=j&amp;#X41vascript:alert(&#39;test2&#39;)&gt;&lt;br&gt;'
    );
    const sanitizedHtml3 = EscapingHelpers.sanitizeHtml();
    assert.equal(sanitizedHtml3, '');
  });

  it('restoreSanitizedBrs', () => {
    const text = '&lt;br&gt; &lt;br &gt; &lt;br /&gt; &lt;br/&gt;';
    const restoredHtml = EscapingHelpers.restoreSanitizedBrs(text);
    assert.equal(restoredHtml, '<br> <br> <br> <br>');
    const restoredHtml2 = EscapingHelpers.restoreSanitizedBrs();
    assert.equal(restoredHtml2, '');
  });

  it('restoreSanitizedElements', () => {
    const text = '&lt;br&gt; &lt;b &gt; &lt;del /&gt; &lt;i/&gt; &lt;strong&gt;';
    const restoredHtml = EscapingHelpers.restoreSanitizedElements(text);
    assert.equal(restoredHtml, '<br> <b> <del> <i> <strong>');
    const restoredHtml2 = EscapingHelpers.restoreSanitizedElements();
    assert.equal(restoredHtml2, '');
  });

  it('sanatizeHtmlExceptTextFormatting', () => {
    const text = '<br> <b> <del> <i> <strong> <script>';
    const restoredHtml = EscapingHelpers.sanatizeHtmlExceptTextFormatting(text);
    assert.equal(restoredHtml, '<br> <b> <del> <i> <strong> &lt;script&gt;');
    const restoredHtml2 = EscapingHelpers.sanatizeHtmlExceptTextFormatting();
    assert.equal(restoredHtml2, '');
  });

  it('sanitizeParam', () => {
    const param = '<>"\'/';
    const sanitizedParam = EscapingHelpers.sanitizeParam(param);
    assert.equal(sanitizedParam, '&lt;&gt;&quot;&#39;&sol;');
    const sanitizedParam2 = EscapingHelpers.sanitizeParam();
    assert.equal(sanitizedParam2, '');
  });

  it('escapeKeyForRegexp', () => {
    const key = 'some/*/thing';
    const escapedRegexp = EscapingHelpers.escapeKeyForRegexp(key);
    assert.equal(escapedRegexp, 'some\\/\\*\\/thing');
    const escapedRegexp2 = EscapingHelpers.escapeKeyForRegexp();
    assert.equal(escapedRegexp2, '');
  });

  describe('processTextAndLinks', () => {
    beforeEach(() => {
      // added suffixes to make sure the sanitazion gets executed in the right places
      sinon.stub(EscapingHelpers, 'sanitizeParam').callsFake(input => {
        return input + '-sanitizeParam';
      });
      sinon.stub(EscapingHelpers, 'sanitizeHtml').callsFake(input => {
        return input + '-sanitizeHtml';
      });
      sinon.stub(EscapingHelpers, 'escapeKeyForRegexp').callsFake(input => {
        return input;
      });
    });

    afterEach(() => {
      EscapingHelpers.sanitizeParam.restore();
      EscapingHelpers.escapeKeyForRegexp.restore();
      EscapingHelpers.sanitizeHtml.restore();
    });

    it('without links', () => {
      const text = `This is text`;

      // when
      const escapedTextAndLinks = EscapingHelpers.processTextAndLinks(text);

      // then
      const expectedResult = {
        sanitizedText: text + '-sanitizeHtml',
        links: []
      };

      assert.deepEqual(escapedTextAndLinks, expectedResult, 'excaped text object with empty link array');
    });

    it('with links', () => {
      const text = `Hello Luigi. {issues} {pulls}`;
      const links = {
        issues: {
          text: 'Issues',
          url: `http://github.com/luigi-project/luigi/issues`,
          dismissKey: 'goToHome'
        },
        pulls: {
          text: 'Pulls',
          url: `http://github.com/luigi-project/luigi/pulls`
        }
      };
      const uniqueID = 1234567890;

      // when
      const escapedTextAndLinks = EscapingHelpers.processTextAndLinks(text, links, uniqueID);

      // then
      const expectedResult = {
        sanitizedText:
          'Hello Luigi. <a id="_luigi_alert_1234567890_link_issues-sanitizeParam">Issues-sanitizeHtml</a> <a id="_luigi_alert_1234567890_link_pulls-sanitizeParam">Pulls-sanitizeHtml</a>-sanitizeHtml',
        links: [
          {
            dismissKey: 'goToHome-sanitizeHtml',
            elemId: '_luigi_alert_1234567890_link_issues-sanitizeParam',
            url: 'http://github.com/luigi-project/luigi/issues-sanitizeHtml'
          },
          {
            dismissKey: undefined,
            elemId: '_luigi_alert_1234567890_link_pulls-sanitizeParam',
            url: 'http://github.com/luigi-project/luigi/pulls-sanitizeHtml'
          }
        ]
      };

      assert.deepEqual(escapedTextAndLinks, expectedResult, 'excaped text and links object');
    });
  });
});
