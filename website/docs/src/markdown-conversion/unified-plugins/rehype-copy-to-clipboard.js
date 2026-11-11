import { h } from 'hastscript';
import { visit } from 'unist-util-visit';
import { prependForExport } from './helpers.js';

const FIDDLE_URL = process.env.FIDDLE_URL || 'https://fiddle.luigi-project.io';

export default function addCopyToClipboard() {
  return function transformer(tree) {
    visit(tree, 'element', function(node) {
      modify(node, 'code');
    });
  };

  function modify(node, prop) {
    const notYetProcessed = !node.properties.className || node.properties.className.indexOf('canCopyCode') === -1; // prevent infinite loop
    if (node.tagName === 'pre' && notYetProcessed) {
      // set by rehype-fiddle-preset.js from <!-- fiddle-preset:<presetId> --> above the code block
      // read it before Object.assign below replaces the pre's properties
      const preset = node.properties.dataFiddlePreset;

      // Docu: https://github.com/syntax-tree/hastscript#use
      const children = [
        h('a.copyCode', { onclick: 'copyCode(event, this)' }, [
          h('div', [
            h('img', { src: prependForExport() + '/images/copy-clipboard-default.svg' }),
            h('.popoverCopy', ['Click to copy'])
          ])
        ]),
        h('pre.canCopyCode', node.children)
      ];

      if (preset) {
        children.unshift(
          h(
            'a.openInFiddle',
            {
              href: `${FIDDLE_URL}/?preset=${encodeURIComponent(preset)}`,
              target: '_blank',
              rel: 'noopener noreferrer',
              'aria-label': 'Open in Fiddle'
            },
            [
              // same structure as the copy button, so it reuses its layout and tooltip styles
              h('div', [h('span.fiddleIcon', ['</>']), h('.popoverCopy', ['Open in Fiddle'])])
            ]
          )
        );
      }

      const newNodeData = h('div.copyCodeContainer', children);
      Object.assign(node, newNodeData);
    }
  }
}