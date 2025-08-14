describe('Nested Compound Container Tests', () => {
  const testPage = 'http://localhost:8080/compound/nested.html';
  const containerSelector = '#nested-wc-compound-container';
  let consoleInfo;
  let stub;

  beforeEach(() => {
    cy.visit(testPage, {
      onBeforeLoad(win) {
        // Clear logs in window console
        if (Object.prototype.toString.call(win.console.clear) === '[object Function]') {
          win.console.clear();
        }

        // Set up a spy on console.info
        cy.stub(win.console, 'info', (value) => {
          consoleInfo = value;
        });
      }
    });
    stub = cy.stub();
  });

  describe('Luigi Client API - showAlert', () => {
    it('should emit notifyAlertClosed in direct WC', () => {
      let notifySpy;

      cy.on('window:alert', stub);
      cy.get(containerSelector).then((container) => {
        notifySpy = cy.spy(container[0], 'notifyAlertClosed');
      });

      cy.get(containerSelector)
        .shadow()
        .contains('showAlert')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('Direct WC - alert message');

          if (notifySpy) {
            expect(notifySpy).to.be.calledWith(0);
          }
        });
    });

    it('should emit notifyAlertClosed in nested WC', () => {
      let notifySpy;

      cy.on('window:alert', stub);
      cy.get(containerSelector).then((container) => {
        notifySpy = cy.spy(container[0], 'notifyAlertClosed');
      });

      cy.get(containerSelector)
        .shadow()
        .find(
          'luigi-wc-687474703a2f2f6c6f63616c686f73743a383038302f636f6d706f756e642f68656c6c6f576f726c64574353656c66526567697374657265642e6a73'
        )
        .shadow()
        .contains('showAlert')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('Nested WC - alert message');

          if (notifySpy) {
            expect(notifySpy).to.be.calledWith(0);
          }
        });
    });
  });

  describe('Luigi Client API - showConfirmationModal', () => {
    it('should emit notifyConfirmationModalClosed in direct WC', () => {
      let notifySpy;

      cy.on('window:alert', stub);
      cy.get(containerSelector).then((container) => {
        notifySpy = cy.spy(container[0], 'notifyConfirmationModalClosed');
      });

      cy.get(containerSelector)
        .shadow()
        .contains('showConfirmationModal')
        .click()
        .then(() => {
          cy.on('window:confirm', (str) => {
            expect(str).to.equal('Are you sure you want to do this?');
          });
          expect(consoleInfo).to.equal('Direct WC - modal confirmed');

          if (notifySpy) {
            expect(notifySpy).to.be.calledWith(true);
          }
        });
    });

    it('should emit notifyConfirmationModalClosed in nested WC', () => {
      let notifySpy;

      cy.on('window:alert', stub);
      cy.get(containerSelector).then((container) => {
        notifySpy = cy.spy(container[0], 'notifyConfirmationModalClosed');
      });

      cy.get(containerSelector)
        .shadow()
        .find(
          'luigi-wc-687474703a2f2f6c6f63616c686f73743a383038302f636f6d706f756e642f68656c6c6f576f726c64574353656c66526567697374657265642e6a73'
        )
        .shadow()
        .contains('showConfirmationModal')
        .click()
        .then(() => {
          cy.on('window:confirm', (str) => {
            expect(str).to.equal('Are you sure you want to do this?');
          });
          expect(consoleInfo).to.equal('Nested WC - modal confirmed');

          if (notifySpy) {
            expect(notifySpy).to.be.calledWith(true);
          }
        });
    });
  });
});
