import { unified } from 'unified';
import markdown from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import format from 'rehype-format';
import html from 'rehype-stringify';
import addIdsToHeadings from 'rehype-slug';
import frontmatter from 'remark-frontmatter';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import luigiLinkParser from '../unified-plugins/rehype-luigi-linkparser.js';
import addCopyToClipboard from '../unified-plugins/rehype-copy-to-clipboard.js';
import addCustomAttributes from '../unified-plugins/rehype-add-custom-attributes.js';
import wrapAccordion from '../unified-plugins/rehype-accordion.js';
import luigiNavigationBuilder from '../unified-plugins/remark-generate-luigi-navigation.js';
import addKeyWords from '../unified-plugins/rehype-add-keywords.js';
import oldVersions from '../unified-plugins/rehype-luigi-oldVersions.js';
import addLabelTag from '../unified-plugins/rehype-label.js';

// import highlight from 'rehype-highlight' // syntax highlight code blocks with lowlight: https://github.com/wooorm/lowlight
import rehypeSection from '@agentofuser/rehype-section';
const section = rehypeSection.default;
function logger() {
  return console.dir;
}
class MarkdownService {
  async process(value, data = {}) {
    return new Promise((resolve, reject) => {
      unified()
        .use(markdown)
        .use(frontmatter, { type: 'json', fence: { open: '<!-- meta', close: 'meta -->' } })
        .use(remarkGfm)
        .use(luigiNavigationBuilder, data)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(addCustomAttributes)
        .use(wrapAccordion, { questionTagName: 'h3' })
        .use(addIdsToHeadings)
        .use(rehypeAutolinkHeadings, { behavior: 'append' })
        .use(luigiLinkParser, data)
        .use(addCopyToClipboard)
        .use(addKeyWords)
        .use(oldVersions)
        .use(format)
        .use(html)
        .use(addLabelTag)
        .use(section) // section should be the last one
        .process(String(value), function(err, file) {
          if (err) {
            console.error(err || file);
            return reject();
          }
          resolve(file);
        });
    });
  }
}

export const MarkdownSvc = new MarkdownService();
