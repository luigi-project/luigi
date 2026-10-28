import { h } from 'hastscript';
import { visit } from 'unist-util-visit';
import { prependForExport } from './helpers.js';

export default function addFiddlePreset() {
  return (tree) => {
    let pending = null;
    visit(tree, ['comment', 'element'], (node) => {
      const m = node.type === 'comment' && node.value.trim().match(/^fiddle-preset:([\w-]+)$/);
      if (m) pending = m[1];
      else if (pending && node.tagName === 'pre') {
        node.properties.dataFiddlePreset = pending;
        pending = null;
      }
    });
  };
}