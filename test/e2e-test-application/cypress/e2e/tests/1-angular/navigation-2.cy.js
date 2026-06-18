describe('Navigation', () => {
  beforeEach(() => {
    cy.visitLoggedIn('/');
  });

  describe('Sidenav & Misc', () => {
    it(
      'keepSelectedForChildren',
      {
        retries: {
          runMode: 3,
          openMode: 3
        }
      },
      () => {
        // keep selected for children example
        cy.get('.fd-shellbar').contains('Overview').click();

        // dig into the iframe

        cy.getIframeBody().then(($iframeBody) => {
          cy.wrap($iframeBody).find('.fd-list__item').contains('keepSelectedForChildren').click();
        });

        cy.expectPathToBe('/projects/pr1/avengers');

        //the iframe is has been replaced with another one, we need to "get" it again
        cy.getIframeBody().then(($iframeBody) => {
          // wrap this body with cy so as to do cy actions inside iframe elements
          cy.wrap($iframeBody).find('.fd-list__item').contains('Thor').click();
        });
        cy.expectPathToBe('/projects/pr1/avengers/thor');

        cy.get('.fd-app__sidebar').should('contain', 'Keep Selected Example');
      }
    );

    it('Node with link to another node', () => {
      const goToAnotherNodeFeature = () => {
        cy.get('.fd-shellbar').contains('Overview').click();

        cy.getIframeBody().then(($iframeBody) => {
          cy.wrap($iframeBody).find('.fd-list__item strong').contains('Node with link to another node').click();
        });
      };

      //go to absolute path
      goToAnotherNodeFeature();
      cy.get('.fd-app__sidebar .fd-nested-list__item').contains('Go to absolute path').click();

      cy.expectPathToBe('/settings');

      //go to relative path from the parent node
      goToAnotherNodeFeature();
      cy.get('.fd-app__sidebar .fd-nested-list__item').contains('Go to relative path').click();

      cy.expectPathToBe('/projects/pr2/dps/dps1');

      //go to relative path from node that is a sibiling
      goToAnotherNodeFeature();
      cy.get('.fd-app__sidebar .fd-nested-list__item').contains('Keep Selected Example').click();

      cy.expectPathToBe('/projects/pr2/avengers');

      cy.get('.fd-app__sidebar .fd-nested-list__item').contains('Go to relative path').click();

      cy.expectPathToBe('/projects/pr2/dps/dps1');
    });

    it('Left navigation hidden', () => {
      cy.get('.fd-shellbar').contains('Projects').click();
      cy.get('.fd-app__sidebar .fd-nested-list__item').contains('Project One').click();

      cy.get('.fd-app__sidebar').contains('Hide left navigation').click();

      cy.get('.no-side-nav').should('exist');
      cy.get('.fd-app__sidebar').should('not.exist');
    });

    it('Open navigation node in a modal', () => {
      // projects page
      cy.get('.fd-shellbar').contains('Projects').click();

      //projects page
      cy.get('.fd-app__sidebar').contains('Project Two').click();

      //project two page
      cy.expectPathToBe('/projects/pr2');

      cy.get('.fd-app__sidebar').contains('Miscellaneous2').click();

      cy.get('[data-testid=modal-mf]').should('be.visible');

      cy.get('[data-testid=modal-mf] [aria-label=close]').click();

      cy.get('[data-testid=modal-mf]').should('not.exist');
    });

    it('Open modal with callback from core api', () => {
      // projects page
      cy.get('.fd-shellbar').contains('Projects').click();

      //projects page
      cy.get('.fd-app__sidebar').contains('Project Two').click();

      //project two page
      cy.expectPathToBe('/projects/pr2');

      cy.get('.fd-app__sidebar').contains('Modal with Callback').click();

      cy.get('[data-testid=modal-mf]').should('be.visible');

      cy.get('[data-testid=modal-mf] [aria-label=close]').click();

      cy.on('window:alert', (str) => {
        expect(str).to.equal(`Callback called`);
      });

      cy.get('[data-testid=modal-mf]').should('not.exist');
    });

    it('Define a data-testid for close button on modal', () => {
      cy.window().then((win) => {
        win.Luigi.navigation().openAsModal('/projects/pr1/developers', {
          closebtn_data_testid: 'MyCustomTestId'
        });
      });
      cy.get('[data-testid=MyCustomTestId]').should('be.visible').click();
      cy.window().then((win) => {
        win.Luigi.navigation().openAsModal('/projects/pr1/developers');
      });
      cy.get('[data-testid=lui-modal-index-0]').should('be.visible').click();
    });
  });

  describe('Nav sync', () => {
    beforeEach(() => {
      cy.get('.fd-shellbar').contains('Projects').click();

      cy.get('.fd-app__sidebar').contains('Project Two').click();

      cy.get('.fd-app__sidebar').contains('Nav Sync').click();
    });

    it('Nav sync - click sidenav', () => {
      cy.expectPathToBe('/projects/pr2/nav-sync/one');

      ['four', 'three', 'two', 'three', 'two'].forEach((label) => {
        cy.get('.fd-app__sidebar').contains(label).click();

        cy.expectPathToBe('/projects/pr2/nav-sync/' + label);

        cy.getIframeBody().then(($iframeBody) => {
          cy.wrap($iframeBody)
            .find('.fd-list__item')
            .contains('Current pathsegment: ' + label);
        });
      });
    });

    it('Nav sync - use synched nav', () => {
      ['two', 'three', 'four', 'one'].forEach((label) => {
        cy.getIframeBody().then(($iframeBody) => {
          cy.wrap($iframeBody).contains(label).click();
          cy.wrap($iframeBody).find('[data-testid="curr-path-segment"]').should('contain', label);
        });
      });
    });

    it('Nav sync - flat dynamic parameters', () => {
      ['1', '2'].forEach((label) => {
        cy.getIframeBody().then(($iframeBody) => {
          cy.wrap($iframeBody).contains('one').click();
          const routeToCheck = 'dynamic-parameter-flat/' + label;
          cy.wrap($iframeBody).contains(routeToCheck).click();
          cy.wrap($iframeBody).find('[data-testid="curr-path-segment"]').should('contain', routeToCheck);
        });
      });
    });

    it('Nav sync - stacked dynamic parameters', () => {
      ['1', '2', '1/child', '2/child', '2/child/3'].forEach((label) => {
        cy.getIframeBody().then(($iframeBody) => {
          cy.wrap($iframeBody).contains('one').click();
          const routeToCheck = 'dynamic-parameter-stacked/' + label;
          cy.wrap($iframeBody).contains(routeToCheck).click();
          cy.wrap($iframeBody).find('[data-testid="curr-path-segment"]').should('contain', routeToCheck);
        });
      });
    });

    it('Auto routing in a modal', () => {
      cy.get('.fd-app__sidebar').contains('Auto routing').click();
      cy.getIframeBody().then(($iframeBody) => {
        cy.wrap($iframeBody).contains('Test auto routing in a modal').click();
      });
      cy.location().should((location) => {
        const actualPath = location.pathname + location.search;
        const pathToCheck = '/projects/pr2/nav-sync/auto-routing?modal=%2Fprojects%2Fpr1%2Fsettings';
        expect(actualPath).to.eq(pathToCheck);
      });
    });
  });
});
