import type { Link, ProcessedTextAndLinks } from '../../modules/ux-module';

// Helper methods that deal with character escaping.
export const EscapingHelpers = {
  sanitizeHtml(text = '') {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/javascript:/g, '');
  },

  restoreSanitizedBrs(text = '') {
    return text
      .replace(/&lt;br\/&gt;/g, '<br>')
      .replace(/&lt;br \/&gt;/g, '<br>')
      .replace(/&lt;br&gt;/g, '<br>')
      .replace(/&lt;br &gt;/g, '<br>');
  },

  restoreSanitizedElements(text = '') {
    let result = text;
    const elements = ['i', 'b', 'br', 'mark', 'strong', 'em', 'small', 'del', 'ins', 'sub', 'sup'];

    for (let i = 0; i < elements.length; i++) {
      const openTag_1 = new RegExp(`&lt;${elements[i]}\/&gt;`, 'g');
      const openTag_2 = new RegExp(`&lt;${elements[i]} \/&gt;`, 'g');
      const openTag_3 = new RegExp(`&lt;${elements[i]}&gt;`, 'g');
      const openTag_4 = new RegExp(`&lt;${elements[i]} &gt;`, 'g');

      const closeTag_1 = new RegExp(`&lt;\/${elements[i]}[\/]&gt;`, 'g');
      const closeTag_2 = new RegExp(`&lt;\/${elements[i]} [\/]&gt;`, 'g');
      const closeTag_3 = new RegExp(`&lt;[\/]${elements[i]}&gt;`, 'g');
      const closeTag_4 = new RegExp(`&lt;[\/]${elements[i]} &gt;`, 'g');

      result = result
        .replace(openTag_1, `<${elements[i]}>`)
        .replace(openTag_2, `<${elements[i]}>`)
        .replace(openTag_3, `<${elements[i]}>`)
        .replace(openTag_4, `<${elements[i]}>`)
        .replace(closeTag_1, `</${elements[i]}>`)
        .replace(closeTag_2, `</${elements[i]}>`)
        .replace(closeTag_3, `</${elements[i]}>`)
        .replace(closeTag_4, `</${elements[i]}>`);
    }

    return result;
  },

  sanatizeHtmlExceptTextFormatting(text = '') {
    return this.restoreSanitizedElements(this.sanitizeHtml(text));
  },

  sanitizeParam(param = '') {
    return String(param)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&sol;');
  },

  escapeKeyForRegexp(str = '') {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  },

  processTextAndLinks(text = '', links: Link, uniqueID: any): ProcessedTextAndLinks {
    const sanitizedText = this.restoreSanitizedBrs(this.sanitizeHtml(text));
    const initialValue: ProcessedTextAndLinks = { sanitizedText, links: [] };

    if (!links) {
      return initialValue;
    }

    return Object.entries(links).reduce<ProcessedTextAndLinks>((acc, [key, content]) => {
      const elemId = `_luigi_alert_${uniqueID}_link_${this.sanitizeParam(key)}`;
      const escapedText = this.restoreSanitizedBrs(this.sanitizeHtml(content.text));
      const processedData = `<a id="${elemId}">${escapedText}</a>`;
      const keyForRegex = this.escapeKeyForRegexp(key);
      const pattern = new RegExp(`({${keyForRegex}})`, 'g');
      return {
        sanitizedText: acc.sanitizedText.replace(pattern, processedData),
        links: acc.links.concat({
          elemId,
          url: content.url ? encodeURI(this.sanitizeHtml(content.url)) : undefined,
          dismissKey: content.dismissKey ? encodeURI(this.sanitizeHtml(content.dismissKey)) : undefined
        })
      };
    }, initialValue);
  }
};
