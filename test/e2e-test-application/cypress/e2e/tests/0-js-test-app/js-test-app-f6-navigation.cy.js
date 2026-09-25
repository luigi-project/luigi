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
      cy.window().then((win) => win.focus());
      cy.get('body').click();

      // From outside any group, F6 lands in the first group (banner).
      pressF6();
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
      cy.window().then((win) => win.focus());
      cy.get('body').click();

      // From outside any group, Shift+F6 lands in the last group (main).
      pressF6(true);
      assertFocusInGroup('main');

      pressF6(true);
      assertFocusInGroup('navigation');

      pressF6(true);
      assertFocusInGroup('banner');

      // Wraps from the first group back to the last.
      pressF6(true);
      assertFocusInGroup('main');
    });

    it('does not move focus out of an open modal (backdrop traps focus)', () => {
      cy.visitTestApp('/home', newConfig);
      cy.window().then((win) => win.focus());
      cy.get('body').click();

      // Open a modal MF; its backdrop makes the regions behind it inert.
      cy.window().then((win) => {
        win.Luigi.navigation().navigate('/home/modalMf');
      });
      cy.get('.lui-modal-index-0').should('exist');

      // Wait until the backdrop has actually made the background inert: the
      // banner group behind the backdrop must carry tabindex="-1". This guards
      // against pressing F6 before the a11y markers are applied.
      cy.get('[data-luigi-fast-nav-group="banner"]').should('have.attr', 'tabindex', '-1');

      // F6 must be suppressed while the backdrop is up: focus stays out of the
      // banner / navigation / main groups behind the backdrop.
      pressF6();
      cy.focused().should(($el) => {
        const inBackgroundGroup = $el.closest('[data-luigi-fast-nav-group]').length > 0;
        expect(inBackgroundGroup, 'focus did not escape into a background group').to.be.false;
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
