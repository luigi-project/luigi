import { assert } from 'chai';
import { DropdownKeyboardHelpers } from '../../../src/utilities/helpers';

const dispatchKey = (target, key, extra = {}) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...extra
  });
  target.dispatchEvent(event);
  return event;
};

describe('Dropdown-keyboard-helpers', () => {
  let root;
  let items;

  const renderMenu = (labels = ['Env 1', 'Env 2', 'Env 3']) => {
    root = document.createElement('nav');
    root.innerHTML = labels.map((label) => `<a class="fd-menu__link" href="#">${label}</a>`).join('');
    document.body.appendChild(root);
    items = DropdownKeyboardHelpers.getMenuItems(root);
    return items;
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getMenuItems', () => {
    it('returns menu links and skips disabled items', () => {
      root = document.createElement('nav');
      root.innerHTML = `
        <a class="fd-menu__link" href="#">One</a>
        <a class="fd-menu__link" href="#" aria-disabled="true">Disabled</a>
        <a class="fd-menu__link" href="#" disabled>Also disabled</a>
        <span class="fd-menu__link">Not a link</span>
      `;
      document.body.appendChild(root);

      const result = DropdownKeyboardHelpers.getMenuItems(root);

      assert.equal(result.length, 1);
      assert.equal(result[0].textContent, 'One');
    });

    it('returns an empty array when root is missing', () => {
      assert.deepEqual(DropdownKeyboardHelpers.getMenuItems(null), []);
    });
  });

  describe('nextIndex', () => {
    it('wraps forward and backward', () => {
      assert.equal(DropdownKeyboardHelpers.nextIndex(0, 3, 1), 1);
      assert.equal(DropdownKeyboardHelpers.nextIndex(2, 3, 1), 0);
      assert.equal(DropdownKeyboardHelpers.nextIndex(0, 3, -1), 2);
    });

    it('starts at first or last when nothing is focused', () => {
      assert.equal(DropdownKeyboardHelpers.nextIndex(-1, 3, 1), 0);
      assert.equal(DropdownKeyboardHelpers.nextIndex(-1, 3, -1), 2);
      assert.equal(DropdownKeyboardHelpers.nextIndex(-1, 0, 1), -1);
    });
  });

  describe('applyRovingTabindex', () => {
    it('does not throw when the focused index is out of range', () => {
      renderMenu();

      DropdownKeyboardHelpers.applyRovingTabindex(items, -1);

      items.forEach((item) => {
        assert.equal(item.getAttribute('tabindex'), '-1');
      });
    });
  });

  describe('handleMenuKeydown', () => {
    it('moves focus with ArrowDown and ArrowUp', () => {
      renderMenu();
      items[0].focus();

      DropdownKeyboardHelpers.handleMenuKeydown(dispatchKey(items[0], 'ArrowDown'), { items });
      assert.equal(document.activeElement, items[1]);

      DropdownKeyboardHelpers.handleMenuKeydown(dispatchKey(items[1], 'ArrowUp'), { items });
      assert.equal(document.activeElement, items[0]);
    });

    it('moves to last item on ArrowUp when nothing is focused', () => {
      renderMenu();

      DropdownKeyboardHelpers.handleMenuKeydown(dispatchKey(root, 'ArrowUp'), {
        items
      });

      assert.equal(document.activeElement, items[2]);
    });

    it('moves to first and last items with Home and End', () => {
      renderMenu();
      items[1].focus();

      DropdownKeyboardHelpers.handleMenuKeydown(dispatchKey(items[1], 'End'), {
        items
      });
      assert.equal(document.activeElement, items[2]);

      DropdownKeyboardHelpers.handleMenuKeydown(dispatchKey(items[2], 'Home'), {
        items
      });
      assert.equal(document.activeElement, items[0]);
    });

    it('calls onEscape on Escape', () => {
      renderMenu();
      let called = false;

      DropdownKeyboardHelpers.handleMenuKeydown(dispatchKey(items[0], 'Escape'), {
        items,
        onEscape: () => {
          called = true;
        }
      });

      assert.isTrue(called);
    });

    it('does not throw on Escape when onEscape is omitted', () => {
      renderMenu();

      DropdownKeyboardHelpers.handleMenuKeydown(dispatchKey(items[0], 'Escape'), { items });
    });

    it('accepts a missing options object', () => {
      renderMenu();

      DropdownKeyboardHelpers.handleMenuKeydown(dispatchKey(root, 'ArrowDown'));
    });

    it('activates the focused item on Space', () => {
      renderMenu();
      items[1].focus();
      let activated = null;

      DropdownKeyboardHelpers.handleMenuKeydown(dispatchKey(items[1], ' '), {
        items,
        onActivate: (item) => {
          activated = item;
        }
      });

      assert.equal(activated, items[1]);
    });

    it('does not activate when Space is pressed and no item is focused', () => {
      renderMenu();
      let activated = false;

      DropdownKeyboardHelpers.handleMenuKeydown(dispatchKey(root, ' '), {
        items,
        onActivate: () => {
          activated = true;
        }
      });

      assert.isFalse(activated);
    });

    it('recognizes Space via event.code', () => {
      renderMenu();
      items[0].focus();
      let activated = false;
      const event = new KeyboardEvent('keydown', {
        key: 'Unidentified',
        code: 'Space',
        bubbles: true,
        cancelable: true
      });

      DropdownKeyboardHelpers.handleMenuKeydown(event, {
        items,
        onActivate: () => {
          activated = true;
        }
      });

      assert.isTrue(activated);
    });
  });

  describe('handleTriggerKeydown', () => {
    it('does not toggle a disabled trigger', () => {
      const trigger = document.createElement('a');
      document.body.appendChild(trigger);
      let toggled = false;

      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, ' '), {
        isDisabled: true,
        isAnchor: true,
        onToggle: () => {
          toggled = true;
        }
      });

      assert.isFalse(toggled);
    });

    it('ignores repeated activation keys', () => {
      const trigger = document.createElement('a');
      document.body.appendChild(trigger);
      let toggled = false;

      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, ' ', { repeat: true }), {
        isAnchor: true,
        onToggle: () => {
          toggled = true;
        }
      });

      assert.isFalse(toggled);
    });

    it('toggles an anchor trigger on Space', () => {
      const trigger = document.createElement('a');
      document.body.appendChild(trigger);
      let toggled = false;

      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, ' '), {
        isAnchor: true,
        onToggle: () => {
          toggled = true;
        }
      });

      assert.isTrue(toggled);
    });

    it('toggles a button trigger on Space', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      let toggled = false;

      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, ' '), {
        isAnchor: false,
        onToggle: () => {
          toggled = true;
        }
      });

      assert.isTrue(toggled);
    });

    it('opens to the first item on ArrowDown and last item on ArrowUp', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      const calls = [];

      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, 'ArrowDown'), {
        isOpen: false,
        onToggle: (focus) => calls.push(focus)
      });
      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, 'ArrowUp'), {
        isOpen: false,
        onToggle: (focus) => calls.push(focus)
      });

      assert.deepEqual(calls, ['first', 'last']);
    });

    it('focuses first and last items with arrows when already open', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      let first = false;
      let last = false;

      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, 'ArrowDown'), {
        isOpen: true,
        onFocusFirst: () => {
          first = true;
        }
      });
      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, 'ArrowUp'), {
        isOpen: true,
        onFocusLast: () => {
          last = true;
        }
      });

      assert.isTrue(first);
      assert.isTrue(last);
    });

    it('closes an open menu on Escape', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      let closed = false;

      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, 'Escape'), {
        isOpen: true,
        onClose: () => {
          closed = true;
        }
      });

      assert.isTrue(closed);
    });

    it('toggles an anchor trigger on Enter', () => {
      const trigger = document.createElement('a');
      document.body.appendChild(trigger);
      let toggled = false;

      const event = dispatchKey(trigger, 'Enter');
      DropdownKeyboardHelpers.handleTriggerKeydown(event, {
        isAnchor: true,
        onToggle: () => {
          toggled = true;
        }
      });

      assert.isTrue(toggled);
      assert.isTrue(event.defaultPrevented);
      assert.isTrue(event.cancelBubble);
    });

    it('toggles a button trigger on Enter', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      let toggled = false;
      const event = dispatchKey(trigger, 'Enter');

      DropdownKeyboardHelpers.handleTriggerKeydown(event, {
        isAnchor: false,
        onToggle: () => {
          toggled = true;
        }
      });

      assert.isTrue(toggled);
      assert.isTrue(event.defaultPrevented);
    });

    it('toggles a button trigger on Enter when only keyCode is set', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      let toggled = false;
      const event = new KeyboardEvent('keydown', {
        key: 'Unidentified',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });

      DropdownKeyboardHelpers.handleTriggerKeydown(event, {
        onToggle: () => {
          toggled = true;
        }
      });

      assert.isTrue(toggled);
      assert.isTrue(event.defaultPrevented);
    });

    it('prevents activation keys on a disabled trigger', () => {
      const trigger = document.createElement('a');
      document.body.appendChild(trigger);
      const event = dispatchKey(trigger, 'Enter');

      DropdownKeyboardHelpers.handleTriggerKeydown(event, {
        isDisabled: true,
        isAnchor: true,
        onToggle: () => {}
      });

      assert.isTrue(event.defaultPrevented);
    });

    it('does not close on Escape when the menu is already closed', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      let closed = false;

      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, 'Escape'), {
        isOpen: false,
        onClose: () => {
          closed = true;
        }
      });

      assert.isFalse(closed);
    });

    it('prevents arrow keys on a disabled trigger', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      const down = dispatchKey(trigger, 'ArrowDown');
      const up = dispatchKey(trigger, 'ArrowUp');

      DropdownKeyboardHelpers.handleTriggerKeydown(down, { isDisabled: true });
      DropdownKeyboardHelpers.handleTriggerKeydown(up, { isDisabled: true });

      assert.isTrue(down.defaultPrevented);
      assert.isTrue(up.defaultPrevented);
    });

    it('does not throw when open-arrow callbacks are omitted', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);

      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, 'ArrowDown'), { isOpen: true });
      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, 'ArrowUp'), { isOpen: true });
      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, 'ArrowDown'), { isOpen: false });
      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, 'ArrowUp'), { isOpen: false });
      DropdownKeyboardHelpers.handleTriggerKeydown(dispatchKey(trigger, 'Tab'));
    });
  });
});
