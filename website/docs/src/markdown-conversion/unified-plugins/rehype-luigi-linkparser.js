import { hasProperty } from 'hast-util-has-property';
import url from 'url';
import { visit } from 'unist-util-visit';
import { writeFile, appendFileSync } from 'fs';
import { prependForExport } from './helpers.js';

let log = (text = '') => {};
if (process.env.NODE_ENV === 'debug') {
  const debugFile = __dirname + '/debug.log';
  writeFile(debugFile, '', () => {
    log = (text = '') => {
      appendFileSync(debugFile, text);
    };
  });
}

export default function luigiLinkParser(options) {
  var settings = options || {};

  return function transformer(tree) {
    visit(tree, 'element', function (node) {
      modify(node, 'href');
    });
  };

  function modify(node, prop) {
    const githubMain = 'https://github.com/luigi-project/luigi/blob/main/';

    if (hasProperty(node, prop)) {
      const parsed = url.parse(node.properties[prop]);

      if (
        (parsed.href.startsWith(githubMain + 'docs') && parsed.pathname && parsed.pathname.endsWith('.md')) ||
        (parsed.pathname && parsed.pathname.endsWith('.md') && !parsed.protocol)
      ) {
        // internal link
        // sample links: https://..., file.md, should not start with /file.md or ../file.md
        node.properties['onclick'] = 'navigateInternal(event, this)';
        node.properties['data-linktype'] = 'internal';

        let newHref = parsed.href.replace(githubMain + 'docs/', '').replace('.md', '');

        // clean ./ from beginning of the link
        if (newHref.startsWith('./')) {
          newHref = newHref.substr(2);
        }

        node.properties['href'] = prependForExport() + '/docs/' + newHref;
      } else if (parsed.hash && !parsed.pathname && !parsed.hostname) {
        const parsedHash = parsed.hash.toLowerCase();

        // current page anchor link
        node.properties['href'] =
          prependForExport() + '/docs/' + settings.shortName + parsedHash.replace('lifecycle..', '');
        node.properties['onclick'] = 'navigateInternal(event, this)';
        node.properties['data-linktype'] = 'internal';
      } else if (
        parsed.pathname &&
        !parsed.protocol &&
        (parsed.pathname.startsWith('../') || parsed.pathname.startsWith('/'))
      ) {
        // internal absolute link, probably to some raw file
        let newHref = parsed.href;
        // remove .. if its leading
        if (newHref.startsWith('../')) {
          newHref = newHref.substr(2);
        }
        // remove leading slash
        newHref = newHref.substr(1);

        node.properties['href'] = githubMain + newHref;
        node.properties['rel'] = 'external';
        node.properties['target'] = '_blank';
      } else if (
        parsed.protocol &&
        ((parsed.pathname && !parsed.pathname.endsWith('.md')) || parsed.href.startsWith(githubMain))
      ) {
        // external link
        node.properties['rel'] = 'external';
        node.properties['target'] = '_blank';
      } else {
        console.log('<--------- UNMATCHED HREF FOUND, THIS RESULTS IN BROKEN LINK! FIX BEFORE COMMITTING ----------->');
        console.log('href', parsed.href);
        console.log(parsed);
        console.log('<--------- Warning saved to debug.log -------->');
        log(parsed.href + ' on ' + JSON.stringify(node) + '\n');
        node.properties['href'] = 'javascript:void(0)';
      }
      // node.properties[prop] = fn(parsed)
      // add logic here
    }
  }
}
