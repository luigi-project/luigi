describe('Nested Compound Container Tests', () => {
  const testPage = 'http://localhost:8080/compound/nested.html';
  const containerSelector = '#nested-wc-compound-container';

  beforeEach(() => {
    cy.visit(testPage, {
      onBeforeLoad(win) {
        // Clear logs in window console
        if (Object.prototype.toString.call(win.console.clear) === '[object Function]') {
          win.console.clear();
        }

        // Stub console.info and alias it for assertions later (no closure vars)
        cy.stub(win.console, 'info').as('consoleInfo');
      }
    });
  });

  describe('Luigi Client API - showAlert', () => {
    it('should emit notifyAlertClosed in direct WC', () => {
      // create a stub for window.alert and attach it as the handler BEFORE the action
      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      // set the spy on the DOM element method BEFORE the action and alias it
      cy.get(containerSelector).then((container) => {
        cy.spy(container[0], 'notifyAlertClosed').as('notifySpy');
      });

      // perform the action that should trigger alert and notifyAlertClosed
      cy.get(containerSelector).shadow().contains('showAlert').click();

      // assert the alert was called with the correct message
      cy.then(() => {
        expect(alertStub).to.have.been.calledWith('Direct WC - alert message');
      });

      // assert notifyAlertClosed was called with 0
      cy.get('@notifySpy').should('have.been.calledWith', 0);
    });

    it('should emit notifyAlertClosed in nested WC', () => {
      // create and register alert stub BEFORE the action
      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      // spy the outer container's notifyAlertClosed BEFORE the action
      cy.get(containerSelector).then((container) => {
        cy.spy(container[0], 'notifyAlertClosed').as('notifySpy');
      });

      // find the nested webcomponent and click its showAlert
      cy.get(containerSelector)
        .shadow()
        .find(
          'luigi-wc-687474703a2f2f6c6f63616c686f73743a383038302f636f6d706f756e642f68656c6c6f576f726c64574353656c66526567697374657265642e6a73'
        )
        .shadow()
        .contains('showAlert')
        .click();

      // assertions
      cy.then(() => {
        expect(alertStub).to.have.been.calledWith('Nested WC - alert message');
      });

      cy.get('@notifySpy').should('have.been.calledWith', 0);
    });
  });

  describe('Luigi Client API - showConfirmationModal', () => {
    it('should emit notifyConfirmationModalClosed in direct WC', () => {
      // register confirm handler BEFORE click; assert incoming text and return true to accept
      const confirmStub = cy.stub().callsFake((str) => {
        expect(str).to.equal('Are you sure you want to do this?');
        return true;
      });
      cy.on('window:confirm', confirmStub);

      // spy the method BEFORE the action
      cy.get(containerSelector).then((container) => {
        cy.spy(container[0], 'notifyConfirmationModalClosed').as('notifySpy');
      });

      // click the button that opens the confirmation modal
      cy.get(containerSelector).shadow().contains('showConfirmationModal').click();

      // console.info was aliased in beforeEach; assert it was called with expected text
      cy.get('@consoleInfo').should('have.been.calledWith', 'Direct WC - modal confirmed');

      // ensure the spy was called with true
      cy.get('@notifySpy').should('have.been.calledWith', true);
    });

    it('should emit notifyConfirmationModalClosed in nested WC', () => {
      // register confirm handler BEFORE click for nested modal
      const confirmStub = cy.stub().callsFake((str) => {
        expect(str).to.equal('Are you sure you want to do this?');
        return true;
      });
      cy.on('window:confirm', confirmStub);

      // spy the outer container's notifyConfirmationModalClosed BEFORE the action
      cy.get(containerSelector).then((container) => {
        cy.spy(container[0], 'notifyConfirmationModalClosed').as('notifySpy');
      });

      // find nested wc and click
      cy.get(containerSelector)
        .shadow()
        .find(
          'luigi-wc-687474703a2f2f6c6f63616c686f73743a383038302f636f6d706f756e642f68656c6c6f576f726c64574353656c66526567697374657265642e6a73'
        )
        .shadow()
        .contains('showConfirmationModal')
        .click();

      // assert console info called with nested message
      cy.get('@consoleInfo').should('have.been.calledWith', 'Nested WC - modal confirmed');

      // ensure the spy was called with true
      cy.get('@notifySpy').should('have.been.calledWith', true);
    });
  });
});
