import { DropdownKeyboardHelpers } from '../../../src/utilities/helpers';
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

describe('Dropdown-keyboard-helpers', () => {
  let root;

  const createMenu = (count) => {
    root = document.createElement('div');
    for (let i = 0; i < count; i++) {
      const a = document.createElement('a');
      a.classList.add('fd-menu__link');
      a.setAttribute('href', `#${i}`);
      root.appendChild(a);
    }
    document.body.appendChild(root);
    return Array.from(root.querySelectorAll('a.fd-menu__link'));
  };

  const keydownEvent = (key, extra = {}) => {
    const event = { key, preventDefault: sinon.spy(), stopPropagation: sinon.spy(), ...extra };
    return event;
  };

  afterEach(() => {
    if (root && root.parentNode) {
      root.parentNode.removeChild(root);
    }
    root = undefined;
    sinon.restore();
  });

  describe('eventKey', () => {
    it('normalizes the legacy Spacebar value', () => {
      assert.equal(DropdownKeyboardHelpers.eventKey({ key: 'Spacebar' }), ' ');
      assert.equal(DropdownKeyboardHelpers.eventKey({ key: 'Enter' }), 'Enter');
    });
  });

  describe('getMenuItems', () => {
    it('returns an empty array without a root', () => {
      assert.deepEqual(DropdownKeyboardHelpers.getMenuItems(null), []);
    });

    it('skips disabled items', () => {
      const items = createMenu(3);
      items[1].setAttribute('aria-disabled', 'true');
      items[2].setAttribute('disabled', '');
      const result = DropdownKeyboardHelpers.getMenuItems(root);
      assert.equal(result.length, 1);
      assert.equal(result[0], items[0]);
    });
  });

  describe('nextIndex', () => {
    it('wraps forward and backward', () => {
      assert.equal(DropdownKeyboardHelpers.nextIndex(2, 3, 1), 0);
      assert.equal(DropdownKeyboardHelpers.nextIndex(0, 3, -1), 2);
    });

    it('starts at an edge when nothing is focused', () => {
      assert.equal(DropdownKeyboardHelpers.nextIndex(-1, 3, 1), 0);
      assert.equal(DropdownKeyboardHelpers.nextIndex(-1, 3, -1), 2);
    });

    it('returns -1 for an empty menu', () => {
      assert.equal(DropdownKeyboardHelpers.nextIndex(0, 0, 1), -1);
    });
  });

  describe('applyRovingTabindex', () => {
    it('puts exactly one item in the tab order', () => {
      const items = createMenu(3);
      DropdownKeyboardHelpers.applyRovingTabindex(items, 1);
      assert.equal(items[0].getAttribute('tabindex'), '-1');
      assert.equal(items[1].getAttribute('tabindex'), '0');
      assert.equal(items[2].getAttribute('tabindex'), '-1');
      assert.equal(document.activeElement, items[1]);
    });
  });

  describe('handleMenuKeydown', () => {
    it('moves focus down and up with arrow keys', () => {
      const items = createMenu(3);
      items[0].focus();
      DropdownKeyboardHelpers.handleMenuKeydown(keydownEvent('ArrowDown'), { items });
      assert.equal(document.activeElement, items[1]);
      DropdownKeyboardHelpers.handleMenuKeydown(keydownEvent('ArrowUp'), { items });
      assert.equal(document.activeElement, items[0]);
    });

    it('jumps to first and last with Home and End', () => {
      const items = createMenu(3);
      items[1].focus();
      DropdownKeyboardHelpers.handleMenuKeydown(keydownEvent('End'), { items });
      assert.equal(document.activeElement, items[2]);
      DropdownKeyboardHelpers.handleMenuKeydown(keydownEvent('Home'), { items });
      assert.equal(document.activeElement, items[0]);
    });

    it('moves within the menu on Tab and keeps roving', () => {
      const items = createMenu(3);
      items[0].focus();
      const event = keydownEvent('Tab');
      DropdownKeyboardHelpers.handleMenuKeydown(event, { items });
      assert.isTrue(event.preventDefault.called);
      assert.equal(document.activeElement, items[1]);
    });

    it('leaves the menu on Tab at the last item and does not default-tab', () => {
      const items = createMenu(2);
      items[1].focus();
      const onLeave = sinon.spy();
      const event = keydownEvent('Tab');
      DropdownKeyboardHelpers.handleMenuKeydown(event, { items, onLeave });
      assert.isTrue(event.preventDefault.called);
      assert.isTrue(onLeave.calledWith(1));
    });

    it('leaves the menu on Shift+Tab at the first item', () => {
      const items = createMenu(2);
      items[0].focus();
      const onLeave = sinon.spy();
      const event = keydownEvent('Tab', { shiftKey: true });
      DropdownKeyboardHelpers.handleMenuKeydown(event, { items, onLeave });
      assert.isTrue(onLeave.calledWith(-1));
    });

    it('lets Tab fall through at the edge when no onLeave is supplied', () => {
      const items = createMenu(2);
      items[1].focus();
      const event = keydownEvent('Tab');
      DropdownKeyboardHelpers.handleMenuKeydown(event, { items });
      assert.isFalse(event.preventDefault.called);
    });

    it('calls onEscape on Escape and onActivate on Space', () => {
      const items = createMenu(2);
      items[0].focus();
      const onEscape = sinon.spy();
      const onActivate = sinon.spy();
      DropdownKeyboardHelpers.handleMenuKeydown(keydownEvent('Escape'), { items, onEscape });
      assert.isTrue(onEscape.called);
      DropdownKeyboardHelpers.handleMenuKeydown(keydownEvent(' '), { items, onActivate });
      assert.isTrue(onActivate.calledWith(items[0]));
    });
  });

  describe('handleTriggerKeydown', () => {
    it('opens focusing the first item on ArrowDown when closed', () => {
      const onToggle = sinon.spy();
      DropdownKeyboardHelpers.handleTriggerKeydown(keydownEvent('ArrowDown'), { isOpen: false, onToggle });
      assert.isTrue(onToggle.calledWith('first'));
    });

    it('opens focusing the last item on ArrowUp when closed', () => {
      const onToggle = sinon.spy();
      DropdownKeyboardHelpers.handleTriggerKeydown(keydownEvent('ArrowUp'), { isOpen: false, onToggle });
      assert.isTrue(onToggle.calledWith('last'));
    });

    it('focuses first/last within an open menu instead of toggling', () => {
      const onToggle = sinon.spy();
      const onFocusFirst = sinon.spy();
      const onFocusLast = sinon.spy();
      DropdownKeyboardHelpers.handleTriggerKeydown(keydownEvent('ArrowDown'), {
        isOpen: true,
        onToggle,
        onFocusFirst,
        onFocusLast
      });
      assert.isTrue(onFocusFirst.called);
      assert.isFalse(onToggle.called);
    });

    it('toggles on Enter and Space', () => {
      const onToggle = sinon.spy();
      DropdownKeyboardHelpers.handleTriggerKeydown(keydownEvent('Enter'), { onToggle });
      DropdownKeyboardHelpers.handleTriggerKeydown(keydownEvent(' '), { onToggle });
      assert.equal(onToggle.callCount, 2);
    });

    it('closes on Escape only when open', () => {
      const onClose = sinon.spy();
      DropdownKeyboardHelpers.handleTriggerKeydown(keydownEvent('Escape'), { isOpen: false, onClose });
      assert.isFalse(onClose.called);
      DropdownKeyboardHelpers.handleTriggerKeydown(keydownEvent('Escape'), { isOpen: true, onClose });
      assert.isTrue(onClose.called);
    });

    it('does nothing but block activation keys when disabled', () => {
      const onToggle = sinon.spy();
      const event = keydownEvent('Enter');
      DropdownKeyboardHelpers.handleTriggerKeydown(event, { isDisabled: true, onToggle });
      assert.isFalse(onToggle.called);
      assert.isTrue(event.preventDefault.called);
    });

    it('ignores held activation keys (repeat)', () => {
      const onToggle = sinon.spy();
      DropdownKeyboardHelpers.handleTriggerKeydown(keydownEvent('Enter', { repeat: true }), { onToggle });
      assert.isFalse(onToggle.called);
    });
  });
});
