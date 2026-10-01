// Standalone helpers for F6 / Shift+F6 fast (group) navigation.
// Focus is moved between logical page groups marked with the
// `data-luigi-fast-nav-group` attribute (banner, navigation, main).
// These functions are framework-agnostic and operate on the light DOM only.

export const FAST_NAV_GROUP_ATTR = 'data-luigi-fast-nav-group';

// Marker attributes that Luigi's a11y helpers leave on backgrounded elements
// while an overlay with an active backdrop is open. `disableA11YKeyboardExceptClassName`
// (modals / drawers-with-backdrop / confirmation modals) uses `oldtab`;
// `disableA11yOfInactiveIframe` (client-driven `luigi.add-backdrop`) uses `oldTab`.
// Both are removed when the backdrop is torn down, so their presence is a reliable
// runtime signal that the regions behind the backdrop are currently inert.
export const A11Y_INERT_MARKER_SELECTOR = '[oldtab], [oldTab]';

// Elements that can receive focus via keyboard.
export const TABBABLE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])'
].join(',');

class FastNavHelpersClass {
  /**
   * Returns whether an element is currently rendered/visible.
   * @param {Element} el
   * @returns {boolean}
   */
  isVisible(el) {
    return !!el && typeof el.getClientRects === 'function' && el.getClientRects().length > 0;
  }

  /**
   * Returns whether the regions behind an active backdrop are currently inert.
   * Luigi makes the background inert (tabindex="-1") whenever a backdrop-bearing
   * overlay is open — a modal, a confirmation modal, a drawer with backdrop, or a
   * client-driven `luigi.add-backdrop`. Each path leaves an `oldtab`/`oldTab`
   * marker on the backgrounded elements, so their presence is a single reliable
   * signal covering all overlay types. While inert, F6 fast navigation must be
   * suppressed so focus stays trapped in the overlay.
   * @param {Document|Element} root
   * @returns {boolean}
   */
  isBackgroundInert(root = document) {
    return !!root.querySelector(A11Y_INERT_MARKER_SELECTOR);
  }

  /**
   * Collects the fast-navigation group elements in document order,
   * filtered to those that are currently visible.
   * @param {Document|Element} root
   * @returns {HTMLElement[]}
   */
  getGroups(root = document) {
    return Array.from(root.querySelectorAll(`[${FAST_NAV_GROUP_ATTR}]`)).filter((group) => this.isVisible(group));
  }

  /**
   * Moves focus to the first tabbable descendant of the given group.
   * Falls back to focusing the group element itself (it carries a
   * `tabindex="-1"` fallback) when no tabbable descendant exists — e.g.
   * when the group's interactive content lives inside web components.
   * @param {HTMLElement} group
   */
  focusFirstTabbable(group) {
    if (!group) {
      return;
    }
    const target = Array.from(group.querySelectorAll(TABBABLE_SELECTOR)).find(
      (el) => !el.hasAttribute('disabled') && this.isVisible(el)
    );
    (target || group).focus();
  }

  /**
   * Handles an F6 / Shift+F6 keydown by cycling focus to the next
   * (F6) or previous (Shift+F6) group. Focus wraps around the ends.
   * When focus is currently outside any group, F6 targets the first
   * group and Shift+F6 the last.
   *
   * Because the target group is derived from the group that contains
   * the active element and focus is moved out of it (with the event's
   * default prevented and propagation stopped), focus reliably leaves
   * complex widgets such as tables and trees.
   *
   * @param {KeyboardEvent} event
   * @param {Document|Element} root
   */
  handleF6(event, root = document) {
    if (!event || event.key !== 'F6') {
      return;
    }
    const groups = this.getGroups(root);
    if (groups.length === 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const active = document.activeElement;
    const currentIndex = groups.findIndex((group) => group.contains(active));
    const dir = event.shiftKey ? -1 : 1;

    let targetIndex;
    if (currentIndex === -1) {
      targetIndex = dir === 1 ? 0 : groups.length - 1;
    } else {
      targetIndex = (currentIndex + dir + groups.length) % groups.length;
    }

    this.focusFirstTabbable(groups[targetIndex]);
  }
}

export const FastNavHelpers = new FastNavHelpersClass();
