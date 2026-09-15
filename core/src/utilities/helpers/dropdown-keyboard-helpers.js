class DropdownKeyboardHelpersClass {
  constructor() {
    this.MENU_ITEM_SELECTOR = 'a.fd-menu__link';
  }

  eventKey(event) {
    if (event.key && event.key !== 'Unidentified') {
      return event.key;
    }
    const code = event.code;
    const which = event.which || event.keyCode;
    if (code === 'Enter' || which === 13) {
      return 'Enter';
    }
    if (code === 'Escape' || code === 'Esc' || which === 27) {
      return 'Escape';
    }
    if (code === 'ArrowDown' || which === 40) {
      return 'ArrowDown';
    }
    if (code === 'ArrowUp' || which === 38) {
      return 'ArrowUp';
    }
    if (code === 'ArrowLeft' || which === 37) {
      return 'ArrowLeft';
    }
    if (code === 'ArrowRight' || which === 39) {
      return 'ArrowRight';
    }
    if (code === 'Home' || which === 36) {
      return 'Home';
    }
    if (code === 'End' || which === 35) {
      return 'End';
    }
    if (code === 'Space' || code === 'Spacebar' || which === 32) {
      return ' ';
    }
    return event.key;
  }

  isSpaceKey(event) {
    const key = this.eventKey(event);
    return key === ' ' || key === 'Spacebar' || event.code === 'Space';
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

  handleMenuKeydown(event, { items = [], onEscape, onActivate } = {}) {
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
