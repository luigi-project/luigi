import { FastNavHelpers, FAST_NAV_GROUP_ATTR } from '../../../src/utilities/helpers';
const chai = require('chai');
const assert = chai.assert;

describe('Fast-nav-helpers', () => {
  let group0, group1, group2;
  let btn0, btn1, btn2;

  const makeGroup = (name) => {
    const group = document.createElement('div');
    group.setAttribute(FAST_NAV_GROUP_ATTR, name);
    group.setAttribute('tabindex', '-1');
    const btn = document.createElement('button');
    btn.textContent = name;
    group.appendChild(btn);
    document.body.appendChild(group);
    return { group, btn };
  };

  const f6 = (opts = {}) => {
    const event = new KeyboardEvent('keydown', { key: 'F6', ...opts });
    // stub preventDefault so we can assert it was called
    event.preventDefault = () => {
      event.defaultPrevented_ = true;
    };
    FastNavHelpers.handleF6(event, document);
    return event;
  };

  beforeEach(() => {
    const g0 = makeGroup('banner');
    const g1 = makeGroup('navigation');
    const g2 = makeGroup('main');
    group0 = g0.group;
    btn0 = g0.btn;
    group1 = g1.group;
    btn1 = g1.btn;
    group2 = g2.group;
    btn2 = g2.btn;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getGroups', () => {
    it('returns all group elements in document order', () => {
      const groups = FastNavHelpers.getGroups(document);
      assert.deepEqual(groups, [group0, group1, group2]);
    });
  });

  describe('isBackgroundInert', () => {
    it('returns false when no backdrop inert markers are present', () => {
      assert.isFalse(FastNavHelpers.isBackgroundInert(document));
    });

    it('returns true when a modal/drawer inert marker (oldtab) is present', () => {
      // disableA11YKeyboardExceptClassName leaves `oldtab` on backgrounded elements.
      group0.setAttribute('oldtab', '0');
      assert.isTrue(FastNavHelpers.isBackgroundInert(document));
    });

    it('returns true when a client-backdrop inert marker (oldTab) is present', () => {
      // disableA11yOfInactiveIframe (luigi.add-backdrop) leaves `oldTab`.
      group1.setAttribute('oldTab', 'null');
      assert.isTrue(FastNavHelpers.isBackgroundInert(document));
    });
  });

  describe('focusFirstTabbable', () => {
    it('focuses the first tabbable descendant', () => {
      FastNavHelpers.focusFirstTabbable(group1);
      assert.strictEqual(document.activeElement, btn1);
    });

    it('falls back to focusing the group itself when there is no tabbable child', () => {
      const empty = document.createElement('div');
      empty.setAttribute(FAST_NAV_GROUP_ATTR, 'empty');
      empty.setAttribute('tabindex', '-1');
      document.body.appendChild(empty);
      FastNavHelpers.focusFirstTabbable(empty);
      assert.strictEqual(document.activeElement, empty);
    });
  });

  describe('handleF6', () => {
    it('moves focus to the first group when focus is outside any group', () => {
      f6();
      assert.strictEqual(document.activeElement, btn0);
    });

    it('moves focus to the last group with Shift+F6 when focus is outside any group', () => {
      f6({ shiftKey: true });
      assert.strictEqual(document.activeElement, btn2);
    });

    it('cycles forward through groups', () => {
      btn0.focus();
      f6();
      assert.strictEqual(document.activeElement, btn1);
      f6();
      assert.strictEqual(document.activeElement, btn2);
    });

    it('wraps forward from the last group to the first', () => {
      btn2.focus();
      f6();
      assert.strictEqual(document.activeElement, btn0);
    });

    it('cycles backward through groups with Shift+F6', () => {
      btn2.focus();
      f6({ shiftKey: true });
      assert.strictEqual(document.activeElement, btn1);
    });

    it('wraps backward from the first group to the last', () => {
      btn0.focus();
      f6({ shiftKey: true });
      assert.strictEqual(document.activeElement, btn2);
    });

    it('exits a complex widget: focus deep inside a group moves out to the next group', () => {
      const tree = document.createElement('div');
      tree.setAttribute('role', 'tree');
      const treeItem = document.createElement('button');
      treeItem.textContent = 'tree item';
      tree.appendChild(treeItem);
      group1.appendChild(tree);
      treeItem.focus();
      assert.strictEqual(document.activeElement, treeItem);

      f6();
      assert.strictEqual(document.activeElement, btn2);
    });

    it('moves focus out when the active element is an iframe inside a group (forwarded F6)', () => {
      const iframe = document.createElement('iframe');
      group2.appendChild(iframe);
      iframe.focus();
      assert.strictEqual(document.activeElement, iframe);

      // Simulates the synthetic event core builds when a micro frontend forwards
      // its F6 keydown via the `luigi.fast-nav` postMessage.
      FastNavHelpers.handleF6(
        { key: 'F6', shiftKey: false, preventDefault: () => {}, stopPropagation: () => {} },
        document
      );
      assert.strictEqual(document.activeElement, btn0);
    });

    it('prevents default when handling F6', () => {
      const event = f6();
      assert.isTrue(event.defaultPrevented_);
    });

    it('ignores non-F6 keys', () => {
      btn0.focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      FastNavHelpers.handleF6(event, document);
      assert.strictEqual(document.activeElement, btn0);
    });

    it('is a no-op when there are no groups', () => {
      document.body.innerHTML = '';
      const stray = document.createElement('button');
      document.body.appendChild(stray);
      stray.focus();
      f6();
      assert.strictEqual(document.activeElement, stray);
    });
  });
});
