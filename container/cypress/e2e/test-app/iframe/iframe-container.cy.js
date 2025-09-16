describe('Iframe Container Test', () => {
  const containerSelector = '[data-test-id="iframe-based-container-test"]';
  let stub;

  beforeEach(() => {
    cy.visit('http://localhost:8080/iframe/iframeContainer.html');
    stub = cy.stub();
  });

  it('should sent third party cookies request', () => {
    cy.on('window:alert', stub);

    cy.get(containerSelector).should('not.have.attr', 'skip-cookie-check');
    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then(() => {
        cy.wrap(stub).should('have.been.calledWith', 'set-third-party-cookies-request');
        cy.getCookie('luigiCookie').should('not.exist');
      });
  });

  it('navigation sent', () => {
    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body).contains('test navigate').click();

        cy.location().should((loc) => {
          expect(loc.href).to.eq('http://localhost:8080/');
        });
      });
  });

  it('updateModalPathInternalNavigation', () => {
    cy.on('window:alert', stub);

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body)
          .contains('test update modal path internal navigation')
          .click()
          .then(() => {
            expect(stub.getCall(1)).to.be.calledWith(
              'LuigiClient.linkManager().updateModalPathInternalNavigation("/test/route")'
            );
          });
      });
  });

  it('showConfirmationModal callback', () => {
    cy.get(containerSelector).then((targetCnt) => {
      cy.spy(targetCnt[0], 'notifyConfirmationModalClosed').as('notifyConfirmationModalClosed');

      cy.get(targetCnt)
        .shadow()
        .get('iframe')
        .then((iframe) => {
          const $body = iframe.contents().find('body');

          cy.wrap($body)
            .contains('test confirmation modal callback')
            .click()
            .then(() => {
              cy.get('@notifyConfirmationModalClosed').should('have.been.called');
              cy.wrap($body).contains('showConfirmationModal: true');
            });
        });
    });
  });

  it('showAlert callback', () => {
    cy.get(containerSelector).then((targetCnt) => {
      cy.spy(targetCnt[0], 'notifyAlertClosed').as('notifyAlertClosed');

      cy.get(targetCnt)
        .shadow()
        .get('iframe')
        .then((iframe) => {
          const $body = iframe.contents().find('body');

          cy.wrap($body)
            .contains('test alert callback')
            .click()
            .then(() => {
              cy.get('@notifyAlertClosed').should('have.been.called');
              cy.wrap($body).contains('showAlert: true');
            });
        });
    });
  });

  it('showAlert with notifyAlertClosed', () => {
    cy.on('window:alert', stub);

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body)
          .contains('test showAlert with notifyAlertClosed')
          .click()
          .then(() => {
            cy.wrap(stub).should('have.been.calledWith', 'show-alert-request message received: {"isTrusted":true}');
          });
      });

    cy.contains('Close Alert using notifyAlertClosed').click();
    cy.wait(500);
    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body).contains('Callback called on iframe neverShowItAgain');
      });
  });

  it('goBack', () => {
    cy.on('window:alert', stub);

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body)
          .contains('test goBack')
          .click()
          .then(() => {
            console.log(cy.wrap(stub));
            cy.wrap(stub).should('have.been.calledWith', 'navigate-back-request');
          });
      });
  });

  it('sendCustomMessage', () => {
    cy.get('#btn-1').click();
    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body).find('#content').should('have.text', 'Received Custom Message: some data');
      });
  });

  it('custom message sent', () => {
    cy.on('window:alert', stub);

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body)
          .contains('test custom message')
          .click()
          .then(() => {
            cy.wrap(stub).should(
              'have.been.calledWith',
              'Custom message received: {"id":"my.customMessage","_metaData":{},"data":{"bar":"foo"}}'
            );
          });
      });
  });

  it('update context', () => {
    cy.on('window:alert', stub);

    cy.get('#update-ctx')
      .click()
      .then(() => {
        cy.get(containerSelector)
          .shadow()
          .get('iframe')
          .then((iframe) => {
            const $body = iframe.contents().find('body');

            cy.wrap($body)
              .contains('Get Context')
              .click()
              .then(() => {
                cy.wrap(stub).should(
                  'have.been.calledWith',
                  'Custom message received: {"id":"my.contextMessage","_metaData":{},"data":{"myContext":"some context data","pathParams":{"path":"param"}}}'
                );

                //Test if context property on luigi container is also updated
                cy.get('#container-ctx')
                  .invoke('html')
                  .then((innerHtml) => {
                    expect(innerHtml).to.include('{"myContext":"some context data"}');
                  });
              });
          });
      });
  });

  it('update viewUrl', () => {
    cy.on('window:alert', stub);

    cy.get('#update-view-url')
      .click()
      .then(() => {
        cy.get(containerSelector)
          .shadow()
          .get('iframe')
          .then((iframe) => {
            const $body = iframe.contents().find('body');

            cy.wrap($body)
              .contains('test history state')
              .click()
              .then(() => {
                cy.wrap(stub).should(
                  'have.been.calledWith',
                  'Custom message received: {"id":"my.historyMessage","_metaData":{},"data":{"state":{"luigiInduced":true}}}'
                );
              });
          });
      });
  });

  it('set auth token', () => {
    cy.on('window:alert', stub);

    cy.get('button[id="update-token"]').click();

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body)
          .contains('test get token')
          .click()
          .then(() => {
            cy.wrap(stub).should(
              'have.been.calledWith',
              'Custom message received: {"id":"token.updated","_metaData":{},"data":{"value":"updated token"}}'
            );
          });
      });
  });

  it('openAsModal', () => {
    cy.on('window:confirm', () => false);

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body).contains('test openAsModal()').click();

        cy.location().should((loc) => {
          expect(loc.hash).to.eq('#openAsModal-iframe');
        });
      });
  });

  it('openAsDrawer', () => {
    cy.on('window:confirm', () => false);

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body).contains('test openAsDrawer').click();

        cy.location().should((loc) => {
          expect(loc.hash).to.eq('#openAsDrawer-iframe');
        });
      });
  });

  it('openAsSplitview', () => {
    cy.on('window:confirm', () => false);

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body).contains('test openAsSplitview').click();

        cy.location().should((loc) => {
          expect(loc.hash).to.eq('#openAsSplitview-iframe');
        });
      });
  });

  it('getNodeParams', () => {
    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body)
          .contains('Test get node params')
          .click()
          .then(() => {
            cy.wrap($body).contains('nodeParams: {"node":"params"}');
          });
      });
  });

  it('getPathParams', () => {
    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body)
          .contains('test get path params')
          .click()
          .then(() => {
            cy.wrap($body).contains('pathParams: {"path":"param"}');
          });
      });
  });

  it('getCoreSearchParams', () => {
    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body)
          .contains('test get core search params')
          .click()
          .then(() => {
            cy.wrap($body).contains('searchParams: {"search":"param"}');
          });
      });
  });

  it('getCurrentRoute', () => {
    const getIframeWindow = (iframe) => {
      return cy.get(iframe).its('0.contentWindow').should('exist');
    };

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');

        getIframeWindow(iframe).then((win) => {
          cy.spy(win, 'postMessage').as('postMessage');

          cy.wrap($body)
            .contains('test get current route')
            .click()
            .then(() => {
              cy.get('@postMessage')
                .should('be.calledWith', Cypress.sinon.match.object, 'http://localhost:8080')
                .its('firstCall.args.0')
                .should('deep.include', { msg: 'luigi.navigation.currentRoute.answer' });
              cy.wrap($body).contains('getCurrentRoute: /test/route');
            });
        });
      });
  });

  it('getPathExists', () => {
    const getIframeWindow = (iframe) => {
      return cy.get(iframe).its('0.contentWindow').should('exist');
    };

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');

        getIframeWindow(iframe).then((win) => {
          cy.spy(win, 'postMessage').as('postMessage');

          cy.wrap($body)
            .contains('test check path exists')
            .click()
            .then(() => {
              cy.get('@postMessage')
                .should('be.calledWith', Cypress.sinon.match.object, 'http://localhost:8080')
                .its('firstCall.args.0')
                .should('deep.include', { msg: 'luigi.navigation.pathExists.answer' });
              cy.wrap($body).contains('pathExists: true');
            });
        });
      });
  });

  it('getCurrentTheme + update currentTheme', () => {
    const getIframeWindow = (iframe) => {
      return cy.get(iframe).its('0.contentWindow').should('exist');
    };

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');

        getIframeWindow(iframe).then((win) => {
          cy.spy(win, 'postMessage').as('postMessage');

          cy.wrap($body)
            .contains('get current theme')
            .click()
            .then(() => {
              cy.wrap($body).contains('currentTheme: "sap_horizon_dark"');
            });
        });
      });

    cy.get('button[id="change-theme"]').click();

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');

        getIframeWindow(iframe).then((win) => {
          // cy.spy(win, 'postMessage').as('postMessage');

          cy.wrap($body)
            .contains('get current theme')
            .click()
            .then(() => {
              cy.wrap($body).contains('currentTheme: "sap_horizon_light"');
            });
        });
      });
  });

  it('getCurrentLocale + update current locale', () => {
    const getIframeWindow = (iframe) => {
      return cy.get(iframe).its('0.contentWindow').should('exist');
    };

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');

        getIframeWindow(iframe).then((win) => {
          cy.spy(win, 'postMessage').as('postMessage');

          cy.wrap($body)
            .contains('get current locale')
            .click()
            .then(() => {
              cy.wrap($body).contains('currentLocale: "en"');
            });
        });
      });

    cy.get('button[id="change-locale"]').click();

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');

        getIframeWindow(iframe).then((win) => {
          // cy.spy(win, 'postMessage').as('postMessage');

          cy.wrap($body)
            .contains('get current locale')
            .click()
            .then(() => {
              cy.wrap($body).contains('currentLocale: "de"');
            });
        });
      });
  });

  it('getActiveFeatureToggleList + change featureToggleList', () => {
    const getIframeWindow = (iframe) => {
      return cy.get(iframe).its('0.contentWindow').should('exist');
    };

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');

        getIframeWindow(iframe).then((win) => {
          cy.spy(win, 'postMessage').as('postMessage');

          cy.wrap($body)
            .contains('get active feature toggle list')
            .click()
            .then(() => {
              cy.wrap($body).contains('activeFeatureToggleList: ["feature1","feature2"]');
            });
        });
      });
    cy.get('button[id="change-feature-toggle-list"]').click();

    cy.get(containerSelector)
      .shadow()
      .get('iframe')
      .then((iframe) => {
        const $body = iframe.contents().find('body');

        getIframeWindow(iframe).then((win) => {
          // cy.spy(win, 'postMessage').as('postMessage');

          cy.wrap($body)
            .contains('get active feature toggle list')
            .click()
            .then(() => {
              cy.wrap($body).contains('activeFeatureToggleList: ["feature3"]');
            });
        });
      });
  });
});
