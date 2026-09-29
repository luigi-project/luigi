class DropdownKeyboardHelpersClass {
  constructor() {
    this.MENU_ITEM_SELECTOR = 'a.fd-menu__link';
  }

  eventKey(event) {
    // Legacy browsers emit 'Spacebar' instead of ' ' for the space key.
    return event.key === 'Spacebar' ? ' ' : event.key;
  }

  isSpaceKey(event) {
    return this.eventKey(event) === ' ' || event.code === 'Space';
  }

  isActivationKey(event) {
    return this.eventKey(event) === 'Enter' || this.isSpaceKey(event);
  }

  getMenuItems(root) {
    if (!root) {
      return [];
    }
    return Array.from(root.querySelectorAll(this.MENU_ITEM_SELECTOR)).filter((item) => {
      return item.getAttribute('aria-disabled') !== 'true' && !item.hasAttribute('disabled');
    });
  }

  applyRovingTabindex(items, focusedIndex) {
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === focusedIndex ? '0' : '-1');
    });
    if (items[focusedIndex]) {
      items[focusedIndex].focus({ preventScroll: true });
    }
  }

  nextIndex(currentIndex, length, direction) {
    if (!length) {
      return -1;
    }
    if (currentIndex < 0) {
      return direction > 0 ? 0 : length - 1;
    }
    return (currentIndex + direction + length) % length;
  }

  handleMenuKeydown(event, { items = [], onEscape, onActivate, onLeave } = {}) {
    const currentIndex = items.indexOf(document.activeElement);
    const key = this.eventKey(event);

    if (key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      this.applyRovingTabindex(items, this.nextIndex(currentIndex, items.length, 1));
      return;
    }

    if (key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      this.applyRovingTabindex(items, this.nextIndex(currentIndex, items.length, -1));
      return;
    }

    if (key === 'Tab') {
      if (!items.length || currentIndex < 0) {
        return;
      }
      const direction = event.shiftKey ? -1 : 1;
      const leavingMenu = (direction > 0 && currentIndex === items.length - 1) || (direction < 0 && currentIndex === 0);
      if (leavingMenu) {
        if (onLeave) {
          event.preventDefault();
          event.stopPropagation();
          onLeave(direction);
        }
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.applyRovingTabindex(items, currentIndex + direction);
      return;
    }

    if (key === 'Home') {
      event.preventDefault();
      this.applyRovingTabindex(items, 0);
      return;
    }

    if (key === 'End') {
      event.preventDefault();
      this.applyRovingTabindex(items, items.length - 1);
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      if (onEscape) {
        onEscape();
      }
      return;
    }

    if (this.isSpaceKey(event) && currentIndex >= 0 && onActivate) {
      event.preventDefault();
      onActivate(items[currentIndex]);
    }
  }

  handleTriggerKeydown(event, { isOpen, isDisabled, onToggle, onFocusFirst, onFocusLast, onClose } = {}) {
    const key = this.eventKey(event);

    if (isDisabled) {
      if (this.isActivationKey(event) || key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
      }
      return;
    }

    if (event.repeat && this.isActivationKey(event)) {
      event.preventDefault();
      return;
    }

    if (key === 'Escape') {
      if (isOpen && onClose) {
        event.preventDefault();
        onClose();
      }
      return;
    }

    if (key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      if (isOpen) {
        if (onFocusFirst) {
          onFocusFirst();
        }
      } else if (onToggle) {
        onToggle('first');
      }
      return;
    }

    if (key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      if (isOpen) {
        if (onFocusLast) {
          onFocusLast();
        }
      } else if (onToggle) {
        onToggle('last');
      }
      return;
    }

    if (this.isActivationKey(event) && onToggle) {
      event.preventDefault();
      event.stopPropagation();
      onToggle();
    }
  }
}

export const DropdownKeyboardHelpers = new DropdownKeyboardHelpersClass();
