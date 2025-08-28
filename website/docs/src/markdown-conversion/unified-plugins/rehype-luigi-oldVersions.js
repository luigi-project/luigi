import { visit } from 'unist-util-visit';
import { h } from 'hastscript';
import * as fs from 'fs';

import path from 'path';
const __dirname = path.resolve();
const versionsFilePath = __dirname + '/public/versions.json';

const versions = JSON.parse(fs.readFileSync(versionsFilePath).toString());

export default function oldVersion() {
  return function transformer(tree) {
    visit(tree, ['comment'], function(node, index, parent) {
      if (node.type === 'comment' && node.value.trim() === 'oldVersionsDropdown') {
        const wrapper = h('div.custom-select');
        const oldVerDropdown = h('select.oldverdrop');
        oldVerDropdown.properties.onchange =
          "window.open('https://github.com/luigi-project/luigi/blob/' + event.target.value + '/docs/README.md', '_blank'); event.target.value=0;";
        wrapper.children.push(oldVerDropdown);
        parent.children.splice(index + 1, 0, wrapper);
        const tagLinks = [];
        const minors = {};
        versions.forEach(tag => {
          if (tag.name.indexOf('v') === 0 && tag.name.indexOf('-') < 0) {
            const vInfo = tag.name.split('.');
            if (vInfo && vInfo.length === 3) {
              const minor = vInfo[0] + '.' + vInfo[1];
              if (!minors[minor]) {
                minors[minor] = tag;
                tagLinks.push(tag);
              }
            }
          }
        });
        const chooseOption = h('option', 'Choose a version');
        chooseOption.properties.value = '0';
        chooseOption.properties.style = 'display:none;';
        oldVerDropdown.children.push(chooseOption);
        tagLinks.slice(1).forEach(tag => {
          const tagOption = h('option', tag.name);
          oldVerDropdown.children.push(tagOption);
        });
      }
    });
  };
}
