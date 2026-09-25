import defaultLuigiConfig from '../../configs/default';
require('cypress-plugin-tab');

describe('JS-TEST-APP F6 fast navigation', () => {
  // Pressing F6 dispatches a keydown on the window; Luigi's handler moves focus
  // to the first focusable element of the next fast-nav group (banner ->
  // navigation -> main), Shift+F6 to the previous, cycling around the ends.
  const pressF6 = (shiftKey = false) => {
    cy.get('body').trigger('keydown', { key: 'F6', shiftKey });
  };

  // Asserts the currently focused element lives inside the group with the given
  // fast-nav name (or is the group container itself, which is the focus fallback).
  const assertFocusInGroup = (groupName) => {
    cy.focused().should(($el) => {
      const group = $el.closest(`[data-luigi-fast-nav-group="${groupName}"]`);
      expect(group.length, `focus is inside the "${groupName}" group`).to.be.greaterThan(0);
    });
  };

  describe('with F6Navigation enabled', () => {
    let newConfig;
    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.settings.F6Navigation = true;
      newConfig.navigation.nodes[0].children.push({
        pathSegment: 'modalMf',
        label: 'Modal MF',
        loadingIndicator: { enabled: false },
        viewUrl: '/examples/microfrontends/multipurpose.html',
        openNodeInModal: true
      });
    });

    it('marks the three page regions as fast-nav groups', () => {
      cy.visitTestApp('/home', newConfig);
      cy.get('[data-luigi-fast-nav-group="banner"]').should('exist');
      cy.get('[data-luigi-fast-nav-group="navigation"]').should('exist');
      cy.get('[data-luigi-fast-nav-group="main"]').should('exist');
    });

    it('cycles focus forward through the groups with F6', () => {
      cy.visitTestApp('/home', newConfig);
      // Luigi focuses the iframe / active nav link on load, so "focus is outside every
      // group" is not a state we can reliably start from. Instead establish a known
      // origin by focusing the banner group container (it carries tabindex="0"), then
      // assert the deterministic forward cycle banner -> navigation -> main -> banner.
      cy.waitForLuigiHandshake();
      cy.get('[data-luigi-fast-nav-group="banner"]').focus();
      assertFocusInGroup('banner');

      pressF6();
      assertFocusInGroup('navigation');

      pressF6();
      assertFocusInGroup('main');

      // Wraps from the last group back to the first.
      pressF6();
      assertFocusInGroup('banner');
    });

    it('cycles focus backward through the groups with Shift+F6', () => {
      cy.visitTestApp('/home', newConfig);
      cy.waitForLuigiHandshake();
      // Start from a known origin (banner), then assert the reverse cycle
      // banner -> main -> navigation -> banner (Shift+F6 wraps the other way).
      cy.get('[data-luigi-fast-nav-group="banner"]').focus();
      assertFocusInGroup('banner');

      pressF6(true);
      assertFocusInGroup('main');

      pressF6(true);
      assertFocusInGroup('navigation');

      pressF6(true);
      assertFocusInGroup('banner');
    });

    it('does not move focus out of an open modal (backdrop traps focus)', () => {
      cy.visitTestApp('/home', newConfig);
      cy.waitForLuigiHandshake();
      cy.window().then((win) => win.focus());
      cy.get('body').click();

      // Open a modal MF; its backdrop makes the regions behind it inert. Clicking
      // the nav entry is the proven way to open an `openNodeInModal` node (calling
      // navigate('/home/modalMf') would route to it as a page, not as a modal).
      cy.get('.fd-app__sidebar').contains('Modal MF').click({ force: true });
      cy.get('.lui-modal-index-0').should('exist');

      // Wait until the backdrop has actually made the background inert: the
      // banner group behind the backdrop must carry tabindex="-1". This guards
      // against pressing F6 before the a11y markers are applied.
      cy.get('[data-luigi-fast-nav-group="banner"]').should('have.attr', 'tabindex', '-1');

      // Move focus onto the modal's close button (a focusable element that is NOT
      // inside any background fast-nav group), then press F6. Because the background
      // is inert, Luigi suppresses fast navigation, so focus must stay exactly where
      // it was and must not jump into the banner / navigation / main groups.
      cy.get('[data-testid="lui-modal-index-0"]').focus();
      cy.focused().then(($before) => {
        pressF6();
        cy.focused().should(($after) => {
          expect($after[0], 'focus stayed on the same element (F6 suppressed)').to.equal($before[0]);
          const inBackgroundGroup = $after.closest('[data-luigi-fast-nav-group]').length > 0;
          expect(inBackgroundGroup, 'focus did not escape into a background group').to.be.false;
        });
      });
    });
  });

  describe('with F6Navigation disabled', () => {
    let newConfig;
    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      // F6Navigation not set -> defaults to disabled.
    });

    it('does not mark any fast-nav groups', () => {
      cy.visitTestApp('/home', newConfig);
      cy.get('[data-luigi-fast-nav-group]').should('not.exist');
    });

    it('does not move focus on F6', () => {
      cy.visitTestApp('/home', newConfig);
      cy.waitForLuigiHandshake();
      cy.window().then((win) => win.focus());
      cy.get('body').click();
      cy.tab();
      // Remember the focused element, press F6, assert focus is unchanged.
      cy.focused().then(($before) => {
        pressF6();
        cy.focused().then(($after) => {
          expect($after[0]).to.equal($before[0]);
        });
      });
    });
  });
});
