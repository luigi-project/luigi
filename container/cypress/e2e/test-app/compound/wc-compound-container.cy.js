describe('Compound Container Tests', () => {
  describe('LuigiClient API - LuigiCompoundContainer', () => {
    const containerSelector = '[data-test-id="luigi-client-api-test-compound-01"]';
    let consoleInfo;
    let stub;

    beforeEach(() => {
      cy.visit('http://localhost:8080/compound/compoundClientAPI.html', {
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

    it('LuigiClient API - getUserSettings', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getUserSettings')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.getUserSettings()={"language":"it","date":""}');
        });
    });

    it('LuigiClient API - getAnchor', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getAnchor')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.getAnchor()="testAnchorCompound"');
        });
    });

    it('LuigiClient API - getCurrentLocale', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getCurrentLocale')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.getCurrentLocale()=en');
        });
    });

    it('LuigiClient API - setCurrentLocale', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('setCurrentLocale')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.uxManager().setCurrentLocale()=de');
        });
    });

    it('LuigiClient API - getDirtyStatus', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getDirtyStatus')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.uxManager().getDirtyStatus()=false');
        });
    });

    it('LuigiClient API - setDirtyStatus', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('setDirtyStatus')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.uxManager().setDirtyStatus()=true');
        });
    });

    it('LuigiClient API - getClientPermissions', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getClientPermissions')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('{"permission":"testPermission"}');
        });
    });

    it('LuigiClient API - getNodeParams', () => {
      cy.on('window:alert', stub);

      // getNodeParams is not available for compound children, so default behavior should be to return empty {}
      cy.get(containerSelector)
        .shadow()
        .contains('get node params')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.getNodeParams()={}');
        });
    });

    it('LuigiClient API - getPathParams', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getPathParams')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('{"path":"param"}');
        });
    });

    it('LuigiClient API - setViewGroupData', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('setViewGroupData')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('{"vg":"some data"}');
        });
    });

    it('LuigiClient API - getCoreSearchParams', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getCoreSearchParams')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('{"test":"searchParam1"}');
        });
    });

    it('Add core search params', () => {
      cy.on('window:alert', stub);
      cy.window().then((win) => {
        cy.spy(win.console, 'log').as('consoleLog');
      });

      const expectedPayload = {
        data: { luigi: 'rocks' },
        keepBrowserHistory: true
      };
      cy.get(containerSelector)
        .shadow()
        .get('#addCoreSearchParams')
        .click()
        .then(() => {
          cy.get('@consoleLog').should('be.calledWith', expectedPayload);
        });
    });

    it('LuigiClient API - getSkipInitCheck', () => {
      cy.get(containerSelector).invoke('attr', 'skip-init-check').should('eq', 'true');
    });

    it('LuigiClient API - getActiveFeatureToggles', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getFeatureToggleList')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.getActiveFeatureToggles()=["ft1","ft2"]');
        });
    });

    it('LuigiClient API - getCurrentTheme', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getTheme')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.getCurrentTheme()="sap_fiori_3"');
        });
    });

    it('LuigiClient API - updateContext', () => {
      cy.on('window:alert', stub);

      cy.wait(500);
      cy.get('#luigi-update-context')
        .click()
        .then(() => {
          cy.get(containerSelector)
            .shadow()
            .contains('retrieveContextValue')
            .click()
            .then(() => {
              expect(stub.getCall(0)).to.be.calledWith(
                'compoundWC.ctx={"label":"Dashboard","title":"Some input","instant":true,"newContextData":"some data"}'
              );
              //Test if context property on luigi compound container is also updated
              cy.get('#cc-ctx')
                .invoke('html')
                .then((innerHtml) => {
                  expect(innerHtml).to.include('{"newContextData":"some data"}');
                });
            });
        });
    });

    it('LuigiClient API - pathExists, goBack, updateTopNavigation', () => {
      cy.on('window:alert', stub);

      const alertMessages = [
        'UPDATE_TOP_NAVIGATION_REQUEST event received',
        'some goBackValue',
        'LuigiClient.linkManager().pathExists()=true\nthis.LuigiClient.linkManager().hasBack()=false'
      ];

      cy.get(containerSelector)
        .shadow()
        .get('#linkManagerUpdateTopPathExistsBack')
        .click()
        .then(() => {
          alertMessages.forEach((msg, index) => {
            expect(stub.getCall(index)).to.be.calledWith(msg);
          });
        });
    });

    it('LuigiClient API - updateModalPathInternalNavigation', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .get('#updateModalPathBtn')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            'LuigiClient.linkManager().updateModalPathInternalNavigation("/test/route")'
          );
        });
    });

    it('LuigiClient API - showAlert closeAlert via xButton', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .get('#showAlert')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            'This is an alert message {goToHome} with a {relativePath}. You can go to {goToOtherProject}. {neverShowItAgain}'
          );
        });

      cy.get('#closeAlert')
        .click()
        .then(() => {
          cy.get(containerSelector)
            .shadow()
            .get('#closeAlertResponse')
            .should('have.text', 'Callback called on wc true');
        });
    });

    it('LuigiClient API - showAlert closeAlert via dismiss', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .get('#showAlert')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            'This is an alert message {goToHome} with a {relativePath}. You can go to {goToOtherProject}. {neverShowItAgain}'
          );
        });

      cy.get('#dismissAlert')
        .click()
        .then(() => {
          cy.get(containerSelector)
            .shadow()
            .get('#closeAlertResponse')
            .should('have.text', 'Callback called on wc neverShowItAgain from wc');
        });
    });

    it('LuigiClient API - showConfirmationModal', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('showConfirmationModal')
        .click()
        .then(() => {
          cy.on('window:confirm', (str) => {
            expect(str).to.equal('Are you sure you want to do this?');
          });
        });
      cy.get(containerSelector).shadow().get('#confirmationModalResponse').should('have.text', 'Modal confirmed');
    });

    it('defer-init flag for LuigiCompoundContainer', () => {
      // the initialized webcomponent has id="defer-init-flag"
      cy.get('#defer-init-flag').should('not.exist');
      // click button that calls container.init()
      cy.get('#defer-init-button').click();

      cy.get('#defer-init-flag').should('exist');
    });

    it('linkManagerChainRequests for navigation', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .get('#linkManagerChainRequests')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.linkManager().navigate()');
          cy.hash().should('eq', '#hello-world-wc');
        });
    });

    it('openAsModal webcomponent container', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .get('#openAsModalBtn')
        .click()
        .then(() => {
          cy.hash().should('eq', '#openAsModal-wc');
        });
    });

    it('openAsDrawer webcomponent container', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .get('#openAsDrawerBtn')
        .click()
        .then(() => {
          cy.hash().should('eq', '#openAsDrawer-wc');
        });
    });

    it('openAsSplitview webcomponent container', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .get('#openAsSplitviewBtn')
        .click()
        .then(() => {
          cy.hash().should('eq', '#openAsSplitview-wc');
        });
    });

    it('LuigiClient API publishEvent', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector).shadow().contains('Publish event').click({ force: true });

      cy.should(() => {
        if (consoleInfo) {
          expect(consoleInfo).to.equal('dataConverter(): Received Custom Message from "input1" MF My own event data');
        }

        expect(stub.getCall(0)).to.be.calledWith('custom-message: sendInput');
      });
    });

    it('LuigiClient API uxManagerChainRequests', () => {
      const alertMessages = [
        'LuigiClient.uxManager().openUserSettings()',
        'LuigiClient.uxManager().closeUserSettings()',
        'LuigiClient.uxManager().removeBackdrop()',
        'LuigiClient.uxManager().collapseLeftSideNav()',
        'LuigiClient.uxManager().hideAppLoadingIndicator()',
        'LuigiClient.uxManager().getDocumentTitle()=my-title'
      ];

      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .get('#uxManagerManyRequests')
        .click()
        .then(() => {
          alertMessages.forEach((msg, index) => {
            expect(stub.getCall(index)).to.be.calledWith(msg);
          });
        });
    });
  });

  describe('LuigiClient API - LuigiElement (compound child)', () => {
    const buttonSelector = '[id="luigi-client-init-button"]';
    const containerSelector = '[id="luigi-client-init-test"]';
    let stub;

    beforeEach(() => {
      cy.visit('http://localhost:8080/compound/compoundClientAPI.html', {
        onBeforeLoad(win) {
          // Clear logs in window console if available
          if (Object.prototype.toString.call(win.console.clear) === '[object Function]') {
            win.console.clear();
          }

          // create a stub for console.log and alias it for later assertions
          // use .as so wir können später mit cy.get('@consoleLog') darauf zugreifen
          cy.stub(win.console, 'log').as('consoleLog');
        }
      });

      // open UI / initialize app
      cy.get(buttonSelector).click();
    });

    it('LuigiClient API - addNodeParams', () => {
      cy.get(containerSelector)
        .shadow()
        .contains('addNodeParams')
        .click()
        .then(() => {
          cy.get('@consoleLog').then((logStub) => {
            expect(logStub.called, 'console.log was called').to.be.true;

            // take first argument in third call
            const firstArg = logStub.getCall(2).args[0];
            expect(firstArg).to.equal('addNodeParams has been called with no effect');
          });
        });
    });

    it('LuigiClient API - getNodeParams', () => {
      cy.get(containerSelector)
        .shadow()
        .contains('getNodeParams')
        .click()
        .then(() => {
          cy.get('@consoleLog').then((logStub) => {
            expect(logStub.called, 'console.log was called').to.be.true;

            const firstArg = logStub.getCall(2).args[0];
            expect(firstArg).to.equal('getNodeParams: {}');
          });
        });
    });

    it('LuigiClient API - getCurrentTheme', () => {
      cy.get(containerSelector)
        .shadow()
        .contains('getCurrentTheme')
        .click()
        .then(() => {
          cy.get('@consoleLog').then((logStub) => {
            expect(logStub.called, 'console.log was called').to.be.true;

            const firstArg = logStub.getCall(2).args[0];
            expect(firstArg).to.equal('getCurrentTheme: sap_fiori_3');
          });
        });
    });

    it('LuigiClient API - getDirtyStatus', () => {
      cy.get(containerSelector)
        .shadow()
        .contains('getDirtyStatus')
        .click()
        .then(() => {
          cy.get('@consoleLog').then((logStub) => {
            expect(logStub.called, 'console.log was called').to.be.true;

            const firstArg = logStub.getCall(2).args[0];
            expect(firstArg).to.equal('getDirtyStatus: false');
          });
        });
    });

    it('LuigiClient API - removeBackdrop', () => {
      cy.get(containerSelector)
        .shadow()
        .contains('removeBackdrop')
        .click()
        .then(() => {
          cy.get('@consoleLog').then((logStub) => {
            expect(logStub.called, 'console.log was called').to.be.true;

            const firstArg = logStub.getCall(2).args[0];
            expect(firstArg).to.equal('removeBackdrop has been called');
          });
        });
    });

    it('LuigiClient API - getAnchor', () => {
      cy.get(containerSelector)
        .shadow()
        .contains('getAnchor')
        .click()
        .then(() => {
          cy.get('@consoleLog').then((logStub) => {
            expect(logStub.called, 'console.log was called').to.be.true;

            const firstArg = logStub.getCall(2).args[0];
            expect(firstArg).to.equal('getAnchor: testAnchorCompound');
          });
        });
    });

    it('LuigiClient API - getUserSettings', () => {
      cy.get(containerSelector)
        .shadow()
        .contains('getUserSettings')
        .click()
        .then(() => {
          cy.get('@consoleLog').then((logStub) => {
            expect(logStub.called, 'console.log was called').to.be.true;

            const firstArg = logStub.getCall(2).args[0];
            expect(firstArg).to.equal('getUserSettings: {"language":"it","date":""}');
          });
        });
    });

    it('LuigiClient API - setViewGroupData', () => {
      cy.get(containerSelector)
        .shadow()
        .contains('setViewGroupData')
        .click()
        .then(() => {
          cy.get('@consoleLog').then((logStub) => {
            expect(logStub.called, 'console.log was called').to.be.true;

            const firstArg = logStub.getCall(2).args[0];
            expect(firstArg).to.equal('setViewGroupData has been called with {"vg":"some data"}');
          });
        });
    });

    it('LuigiClient API - navigateToIntent', () => {
      cy.get(containerSelector)
        .shadow()
        .contains('navigateToIntent')
        .click()
        .then(() => {
          cy.get('@consoleLog').then((logStub) => {
            expect(logStub.called, 'console.log was called').to.be.true;

            const firstArg = logStub.getCall(2).args[0];
            expect(firstArg).to.equal('navigateToIntent has been called with "sales-setting"');
          });
        });
    });

    it('LuigiClient API - fromParent', () => {
      cy.get(containerSelector)
        .shadow()
        .contains('fromParent')
        .click()
        .then(() => {
          cy.get('@consoleLog').then((logStub) => {
            expect(logStub.called, 'console.log was called').to.be.true;

            const firstArg = logStub.getCall(2).args[0];
            expect(firstArg).to.equal('fromParent has been called');
          });
        });
    });
  });
});
