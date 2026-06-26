describe('Luigi Client linkManager Webcomponent, Drawer', () => {
  describe('Drawer', () => {
    let $iframeBody;

    beforeEach(() => {
      cy.visitLoggedIn('/projects/pr2');
      cy.getIframeBody().then((result) => {
        $iframeBody = result;
        cy.goToLinkManagerMethods($iframeBody);
        cy.get('.drawer').should('not.exist');
      });
    });

    it('Open and close drawer component with default settings', () => {
      cy.wrap($iframeBody).contains('Open drawer with default settings').click();

      cy.get('.drawer').should('exist');
      cy.expectPathToBe('/projects/pr2');

      cy.get('.drawer-dialog button[aria-label="close"]').click();
      cy.get('.drawer-dialog button[aria-label="close"]').should('not.exist');
      cy.get('.drawer').should('not.exist');
    });

    it('Open and close drawer component with go back button', () => {
      cy.wrap($iframeBody).contains('Open view in drawer component').click();
      cy.get('.drawer').should('exist');
      cy.expectPathToBe('/projects/pr2');
      cy.get('.drawer .fd-dialog__close').should('not.exist');
      cy.wrap($iframeBody).contains('go back: single iframe, standard history back').click();
      cy.get('.drawer').should('not.exist');
    });

    it('Open and close drawer component with webcomponent', () => {
      cy.window().then((win) => {
        win.Luigi.navigation().openAsDrawer('/projects/pr1/webcomponent');
        cy.get('.drawer').should('exist');
        cy.expectPathToBe('/projects/pr2');

        cy.get('.drawer-dialog button[aria-label="close"]').click();
        cy.get('.drawer').should('not.exist');
      });
    });

    it('Check main iframe width after Open and close drawer component with default settings', () => {
      cy.window().then((win) => {
        cy.get('.fd-page.iframeContainer iframe').then(($container) => {
          cy.get('#app').then(($page) => {
            const containerWidth = parseFloat(win.getComputedStyle($container[0]).width);
            const pageWidth = parseFloat(win.getComputedStyle($page[0]).width);

            cy.get('.iframeContainer iframe').invoke('width').should('eq', containerWidth);

            cy.wrap($iframeBody).contains('Open drawer with no overlap').click();

            cy.get('.drawer-dialog')
              .invoke('width')
              .should('eq', pageWidth * 0.25);

            cy.get('.iframeContainer iframe')
              .invoke('width')
              .should('eq', containerWidth - pageWidth * 0.25);
            cy.expectPathToBe('/projects/pr2');
          });
        });
      });
    });

    it('Check main iframe width after Open and close drawer component with webcomponent', () => {
      cy.window().then((win) => {
        cy.get('.fd-page.iframeContainer iframe').then(($container) => {
          cy.get('#app').then(($page) => {
            const containerWidth = parseFloat(win.getComputedStyle($container[0]).width);
            const pageWidth = parseFloat(win.getComputedStyle($page[0]).width);

            cy.get('.iframeContainer iframe').invoke('width').should('eq', containerWidth);

            win.Luigi.navigation().openAsDrawer('/projects/pr1/webcomponent', { overlap: false });

            cy.get('.drawer-dialog')
              .invoke('width')
              .should('eq', pageWidth * 0.25);

            cy.get('.iframeContainer iframe')
              .invoke('width')
              .should('eq', containerWidth - pageWidth * 0.25);
            cy.expectPathToBe('/projects/pr2');

            cy.get('.drawer-dialog button[aria-label="close"]').click();

            cy.get('.iframeContainer iframe').invoke('width').should('eq', containerWidth);
          });
        });
      });
    });
  });

  describe('Split View', () => {
    let $iframeBody;

    beforeEach(() => {
      cy.visitLoggedIn('/projects/pr2');
      cy.getIframeBody().then((result) => {
        $iframeBody = result;
        cy.goToLinkManagerMethods($iframeBody);
        cy.get('.lui-split-view').should('not.exist');
      });
    });

    it('Open Split View component with default settings', () => {
      cy.wrap($iframeBody).contains('open view in split view with params').click();

      cy.get('.lui-split-view').should('exist');
      cy.expectPathToBe('/projects/pr2');
    });

    it('Check main iframe height after open Split View component with default settings', () => {
      cy.window().then((win) => {
        cy.get('.fd-page.iframeContainer').then(($iframe) => {
          const iframeHeight = parseFloat(win.getComputedStyle($iframe[0]).height);

          cy.get('.iframeContainer').invoke('height').should('eq', iframeHeight);

          cy.wrap($iframeBody).contains('open view in split view with params').click();

          cy.get('.splitViewContainer').then(($splitViewContainer) => {
            const splitViewHeight = parseFloat(win.getComputedStyle($splitViewContainer[0]).height);

            cy.get('.splitViewContainer').invoke('height').should('eq', splitViewHeight);

            expect(`${splitViewHeight}px`).to.equal(win.getComputedStyle($iframe[0]).marginBottom);

            cy.expectPathToBe('/projects/pr2');
          });
        });
      });
    });

    it('Check main iframe height after open and close Split View component with default settings', () => {
      cy.window().then((win) => {
        cy.get('.fd-page.iframeContainer').then(($iframe) => {
          const iframeHeight = parseFloat(win.getComputedStyle($iframe[0]).height);

          cy.get('.iframeContainer').invoke('height').should('eq', iframeHeight);

          cy.wrap($iframeBody).contains('open view in split view with params').click();

          cy.get('.lui-collapse-btn').click();
          cy.get('.splitViewContainer').should(($splitViewContainer) => {
            const splitViewHeight = parseFloat(win.getComputedStyle($splitViewContainer[0]).height);

            expect(`${splitViewHeight}px`).to.equal(win.getComputedStyle($iframe[0]).marginBottom);
          });
          cy.expectPathToBe('/projects/pr2');
        });
      });
    });
  });

  describe('Webcomponent visibleForFeatureToggles test', () => {
    beforeEach(() => {
      cy.visitLoggedIn('/projects/pr1/wc_grid');
    });

    it('open webcomponent with visibleForFeatureToggles', () => {
      cy.get('.wcContainer>div>div>[nodeid="input1"]').shadow().contains('p', 'Some input text !ft').should('exist');
    });
  });

  describe('Webcomponent compound view test', () => {
    beforeEach(() => {
      cy.visitLoggedIn('/projects/pr1/wc_grid_compound');
      cy.get('.wcContainer>div>div>[nodeid="btn"]').shadow().find('button').as('btn');
      cy.get('.wcContainer>div>div>[nodeid="timer"]').shadow().find('p').as('timer');
    });

    it('open webcomponent btn', () => {
      cy.get('@btn').should('have.text', 'Start');
    });

    it('open webcomponent timer', () => {
      cy.get('@timer').should('have.text', '0');
    });

    it('click on webcomponent btn', () => {
      cy.get('@btn').click();
      cy.get('@btn').should('have.text', 'Stop');
    });

    it('listener on webcomponent timer', () => {
      cy.get('@btn').click();
      cy.get('@timer').should('have.text', '1');
    });

    it('click start timer on  webcomponent btn and reaction in webcomponent timer', () => {
      cy.get('@timer').should('have.text', '0');
      cy.get('@btn').click();
      cy.get('@timer').should('have.text', '1');
    });

    it('click start and stop timer on webcomponent btn and reaction in webcomponent timer', () => {
      cy.get('@btn').click();
      cy.get('@timer').should('have.text', '1');
      cy.get('@btn').click();
      cy.get('@btn').should('have.text', 'Start');
      cy.get('@timer').should('have.text', '2');
    });
  });

  describe('Compound web components, lazy loading', () => {
    beforeEach(() => {
      cy.visitLoggedIn('/projects/pr1/lazygrid');
    });

    it('should lazily open items of a grid compound', () => {
      cy.get('[nodeid="compoundItem1"]').should('exist');
      cy.get('[nodeid="compoundItem2"]').should('exist');
    });
  });

  describe('getCurrentRoute', () => {
    let $iframeBody;

    beforeEach(() => {
      // "clear" variables to make sure they are not reused and throw error in case something goes wrong
      $iframeBody = undefined;
      cy.visitLoggedIn('/');
    });

    it('with fromContext option', () => {
      const routeToCheck = '/projects/pr1/users/groups/avengers';
      const routeFromContext = '/users/groups/avengers';
      cy.visitLoggedIn(routeToCheck);

      cy.expectPathToBe(routeToCheck);

      cy.getIframeBody().then((result) => {
        $iframeBody = result;
        cy.wrap($iframeBody).contains('This is a dynamic node with');

        cy.wrap($iframeBody).find('[data-testid="curr-button"]').click();

        cy.wrap($iframeBody).find('[data-testid="curr-button"]').click();

        cy.wrap($iframeBody).find('[data-testid="curr-text"]').should('contain', routeFromContext);
      });
    });

    it('with fromVirtualTree option', () => {
      const routeToCheck = '/projects/pr1/developers';
      const routeVirtual = '/internal/virtualTree';
      cy.visitLoggedIn(routeToCheck);
      cy.expectPathToBe(routeToCheck);

      cy.getIframeBody().then((result) => {
        $iframeBody = result;
        cy.wrap($iframeBody).contains('Developers content.');

        cy.wrap($iframeBody).find('[data-testid="goToVirtualTree"]').click();

        cy.expectPathToBe(routeToCheck + routeVirtual);

        cy.wrap($iframeBody).find('[data-testid="curr-link-virtualtree"]').click();

        cy.wrap($iframeBody).find('[data-testid="curr-text-virtualtree"]').should('contain', routeVirtual);
      });
    });

    it('with no option', () => {
      const routeToCheck = '/projects/pr2/settings';
      cy.visitLoggedIn(routeToCheck);
      cy.expectPathToBe(routeToCheck);

      cy.getIframeBody().then((result) => {
        $iframeBody = result;

        cy.wrap($iframeBody).find('[data-testid="curr-link-no-option"]').click();

        cy.wrap($iframeBody).find('[data-testid="curr-link-no-option"]').click();

        cy.wrap($iframeBody).find('[data-testid="curr-text-no-option"]').should('contain', routeToCheck);
      });
    });

    it('with fromParent option', () => {
      const routeToCheck = '/projects/pr1/users/groups/avengers';
      cy.visitLoggedIn(routeToCheck);
      cy.expectPathToBe(routeToCheck);

      cy.getIframeBody().then((result) => {
        $iframeBody = result;

        cy.wrap($iframeBody).find('[data-testid="curr-link-from-parent"]').click();

        cy.wrap($iframeBody).find('[data-testid="curr-link-from-parent"]').click();

        cy.wrap($iframeBody).find('[data-testid="curr-text-from-parent"]').should('contain', '/avengers');
      });
    });

    it('with fromClosestContext option', () => {
      const routeToCheck = '/projects/pr1/users/groups/avengers';
      cy.visitLoggedIn(routeToCheck);
      cy.expectPathToBe(routeToCheck);

      cy.getIframeBody().then((result) => {
        $iframeBody = result;
        cy.wrap($iframeBody).find('[data-testid="curr-link-from-closest-context"]').click();

        cy.wrap($iframeBody).find('[data-testid="curr-link-from-closest-context"]').click();

        cy.wrap($iframeBody)
          .find('[data-testid="curr-text-from-closest-context"]')
          .should('contain', '/users/groups/avengers');
      });
    });
  });

  describe('Drawer Resizing', () => {
    let $iframeBody;
    const openDrawerButtonText = 'Open Drawer';
    const openSplitviewButtonText = 'Open Splitview';
    const drawerSelector = '.drawer';
    const mfIframeSelector = 'div.iframeContainerTabNav';
    const tabNavSelector = '#tabsContainer';
    const splitViewSelector = '#splitViewContainer';

    function isResizedStatus($element, isResized) {
      const resizedWidthRegex = /^calc\(/;
      const elementWidth = $element[0].style.width;

      if (isResized) {
        expect(elementWidth).to.match(resizedWidthRegex);
      } else {
        expect(elementWidth).to.not.match(resizedWidthRegex);
      }
      return elementWidth;
    }

    function expectToBeResized($element) {
      return isResizedStatus($element, true);
    }

    function expectToNotBeResized($element) {
      return isResizedStatus($element, false);
    }

    beforeEach(() => {
      cy.visitLoggedIn('/projects/tabNav');
      cy.getIframeBody().then((result) => {
        $iframeBody = result;
        cy.expectPathToBe('/projects/tabNav');
        cy.get(drawerSelector).should('not.exist');
      });
    });

    it('does not resize elements before opening the drawer', () => {
      cy.wrap($iframeBody).contains(openDrawerButtonText);

      cy.get(drawerSelector).should('not.exist');

      cy.get(mfIframeSelector).should(($element) => {
        expectToNotBeResized($element);
      });

      cy.get(tabNavSelector).should(($element) => {
        expectToNotBeResized($element);
      });
    });

    it('resizes the microfrontend and tab navigation when opening the drawer', () => {
      cy.wrap($iframeBody).contains(openDrawerButtonText).click();

      cy.get(drawerSelector).should('exist');

      cy.get(mfIframeSelector).should(($element) => {
        expectToBeResized($element);
      });

      cy.get(tabNavSelector).should(($element) => {
        expectToBeResized($element);
      });
    });

    it('resizes the split view when opening the drawer after the split view', () => {
      cy.wrap($iframeBody).contains(openSplitviewButtonText).click();

      cy.wrap($iframeBody).contains(openDrawerButtonText).click();

      cy.get(drawerSelector).should('exist');

      cy.get(splitViewSelector).should(($element) => {
        expectToBeResized($element);
      });
    });

    it('resizes the split view when opening the drawer before the split view', () => {
      cy.wrap($iframeBody).contains(openDrawerButtonText).click();

      cy.wrap($iframeBody).contains(openSplitviewButtonText).click();

      cy.get(drawerSelector).should('exist');

      cy.get(splitViewSelector).should(($element) => {
        expectToBeResized($element);
      });
    });

    it('does not resize several times if the drawer is opened several times', () => {
      let mfIframeWidthAfterFirstResize;

      cy.wrap($iframeBody).contains(openDrawerButtonText).click();

      cy.get(drawerSelector).should('exist');

      cy.get(mfIframeSelector).should(($element) => {
        mfIframeWidthAfterFirstResize = expectToBeResized($element);
      });

      cy.wrap($iframeBody).contains(openDrawerButtonText).click();

      cy.get(mfIframeSelector).should(($element) => {
        expect(mfIframeWidthAfterFirstResize).to.equal(expectToBeResized($element));
      });
    });
  });
});
