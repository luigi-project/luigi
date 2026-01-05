describe('Web Container Test', () => {
  describe('LuigiClient API LuigiContainer', () => {
    const containerSelector = '[data-test-id="luigi-client-api-test-01"]';
    let consoleLog;
    let stub;

    beforeEach(() => {
      cy.visit('http://localhost:8080/wc/clientAPI.html', {
        onBeforeLoad(win) {
          // Clear logs in window console
          if (Object.prototype.toString.call(win.console.clear) === '[object Function]') {
            win.console.clear();
          }

          // Set up a spy on console.log
          cy.stub(win.console, 'log', (value) => {
            consoleLog = value;
          });
        }
      });
      stub = cy.stub();
    });

    it('getCurrentLocale, getActiveFeatureToggles, getCurrentTheme', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('Click me')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.getCurrentLocale()=en');
          expect(stub.getCall(1)).to.be.calledWith('LuigiClient.getActiveFeatureToggles()=ft1,ft2,2');
          expect(stub.getCall(2)).to.be.calledWith('LuigiClient.uxManager().getCurrentTheme()=sap_fiori_3');
        });
    });

    it('setDirtyStatus', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('setDirtyStatus')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.uxManager().setDirtyStatus()=true');
        });
    });

    it('setCurrentLocale', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('setCurrentLocale')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.uxManager().setCurrentLocale()=de');
        });
    });

    it('getCoreSearchParams', () => {
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

      const expectedPayload = {
        data: { luigi: 'rocks' },
        keepBrowserHistory: true
      };
      cy.get(containerSelector)
        .shadow()
        .get('#addCoreSearchParams')
        .click()
        .then(() => {
          if (consoleLog) {
            expect(consoleLog).to.equal(JSON.stringify(expectedPayload));
          }
        });
    });

    it('getPathParams', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getPathParams')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('{"path":"param"}');
        });
    });

    it('getClientPermissions', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getClientPermissions')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('{"permission":"testPermission"}');
        });
    });

    it('LuigiClient API getUserSettings for LuigiContainer', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getUserSettings')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.getUserSettings()={"language":"de","date":""}');
        });
    });

    it('LuigiClient API getAnchor for LuigiContainer', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getAnchor')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.getAnchor()="testanchor"');
        });
    });

    it('defer-init flag for webcomponent container', () => {
      // the initialized webcomponent has id="defer-init-flag"
      cy.get('#defer-init-flag').should('not.exist');
      // click button that calls container.init()
      cy.get('#defer-init-button').click();

      cy.get('#defer-init-flag').should('exist');
    });

    it('LuigiClient API getCurrentRoute for LuigiContainer', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('getCurrentRoute')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('current route: /wc/clientAPI.html');
        });
    });

    it('LuigiClient API navigateToIntent for LuigiContainer', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('navigateToIntent')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('navigated to: #?intent=Sales-settings');
        });
    });

    it('updateContext', () => {
      cy.on('window:alert', stub);

      cy.wait(500);
      cy.get('#luigi-update-context')
        .click()
        .then(() => {
          cy.get(containerSelector)
            .shadow()
            .contains('updateContext')
            .click()
            .then(() => {
              expect(stub.getCall(0)).to.be.calledWith('WC.ctx={"newContextData":"some data"}');
            });
        });
    });

    it('sendCustomMessage', () => {
      cy.get(containerSelector).shadow().find('#customMessageDiv').should('have.text', 'Received Custom Message: ');

      cy.get('#sendCustomMessageBtn').click();
      cy.get(containerSelector)
        .shadow()
        .find('#customMessageDiv')
        .should('have.text', 'Received Custom Message: cool custom Message');
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

    it('Update modal settings in wc mf', () => {
      cy.on('window:alert', stub);

      const expectedPayload = {
        updatedModalSettings: {
          title: 'Updated Modal Title',
          size: 'l'
        },
        addHistoryEntry: false
      };
      cy.get(containerSelector)
        .shadow()
        .get('#updateModalSettingsBtn')
        .click()
        .then(() => {
          if (consoleLog) {
            expect(consoleLog).to.equal(JSON.stringify(expectedPayload));
          }
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

    it('pathExists, goBack, updateTopNavigation', () => {
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

    it('updateModalPathInternalNavigation', () => {
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

    it('showAlert', () => {
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
    });

    it('closeAlert via xButton', () => {
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

    it('closeAlert via xButton after navigate away', () => {
      //expectation promise will not fullfilled
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .get('#showAlert')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            'This is an alert message {goToHome} with a {relativePath}. You can go to {goToOtherProject}. {neverShowItAgain}'
          );
          // Simulate navigate away and luigi-container is not in dom anymore
          cy.get('luigi-container').invoke('remove');

          cy.get('#closeAlert').click();

          // Expect
          // Callback is not fullfilled which means luigi-container isn't connected to dom
          cy.get('#callbackCloseAlert').should('not.exist');
        });
    });

    it('closeAlert via dismissButton', () => {
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

    it('showConfirmationModal', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('showConfirmationModal')
        .click()
        .then(() => {
          cy.on('window:confirm', (str) => {
            expect(str).to.equal('Are you sure you want to do this?');
          });
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.uxManager().showConfirmationModal() - confirmed');
        });
    });

    it('receive custom message from WC', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('Publish event')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('My Custom Message from Microfrontend');
        });
    });

    it('LuigiClient API uxManagerChainRequests', () => {
      const alertMessages = [
        'LuigiClient.uxManager().openUserSettings()',
        'LuigiClient.uxManager().closeUserSettings()',
        'LuigiClient.uxManager().removeBackdrop()',
        'LuigiClient.uxManager().collapseLeftSideNav()',
        'LuigiClient.uxManager() -> Hide Loading Indicator Request',
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

    it('LuigiClient API uxManager showLoadingIndicator', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('uxManager.showLoadingIndicator()')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.uxManager() -> Show Loading Indicator Request');
        });
    });

    it('LuigiClient API uxManager hideLoadingIndicator', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .contains('uxManager.hideLoadingIndicator()')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.uxManager() -> Hide Loading Indicator Request');
        });
    });

    it('closeCurrentModal', () => {
      cy.on('window:alert', stub);

      cy.get(containerSelector)
        .shadow()
        .get('#closeCurrentModalBtn')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith('LuigiClient.uxManager().closeCurrentModal()');
        });
    });
  });
});
