describe('Navigation', () => {
  beforeEach(() => {
    cy.visitLoggedIn('/');
  });

  describe('Core api navigation test', () => {
    it('Core API navigate', () => {
      cy.window().then(win => {
        win.Luigi.navigation().navigate('/projects/pr2');
        cy.expectPathToBe('/projects/pr2');
      });
    });
    it('Core API navigate to root', () => {
      cy.window().then(win => {
        win.Luigi.navigation().navigate('/');
        cy.expectPathToBe('/overview');
      });
    });
    it('Core API prevent open root in modal', () => {
      cy.window().then(win => {
        cy.stub(win.console, 'warn').as('consoleWarn');
        win.Luigi.navigation().openAsModal('/');

        cy.get('div[data-testid="modal-mf"]').should('not.exist');
        cy.get('@consoleWarn').should('be.calledWith', 'Navigation with an absolute path prevented.');
        cy.expectPathToBe('/overview');
      });
    });
    it('Core API prevent open root in drawer', () => {
      cy.window().then(win => {
        cy.stub(win.console, 'warn').as('consoleWarn');
        win.Luigi.navigation().openAsDrawer('/');

        cy.get('div[data-testid="drawer-mf"]').should('not.exist');
        cy.get('@consoleWarn').should('be.calledWith', 'Navigation with an absolute path prevented.');
        cy.expectPathToBe('/overview');
      });
    });
    it('Core API prevent open root in splitview', () => {
      cy.window().then(win => {
        cy.stub(win.console, 'warn').as('consoleWarn');
        const handle = win.Luigi.navigation().openAsSplitView('/', {
          title: 'Preserved Split View',
          size: '40',
          collapsed: false
        });
        setTimeout(() => {
          cy.get('#splitViewContainer').should('not.exist');
          cy.expect(handle.exists()).to.be.true;
        }, 0);
        cy.expectPathToBe('/overview');
        cy.get('@consoleWarn').should('be.calledWith', 'Navigation with an absolute path prevented.');
      });
    });
    it('Core API open in dialog', () => {
      cy.window().then(win => {
        win.Luigi.navigation().openAsModal('/settings', {
          title: 'Preserved View',
          size: 'm'
        });

        cy.get('button[aria-label="close"]')
          .should('exist')
          .click();
        cy.expectPathToBe('/overview');
      });
    });
    it('Core API open and close in SplitView', done => {
      cy.get('.fd-shellbar').should('be.visible');
      cy.window().then(win => {
        const handle = win.Luigi.navigation().openAsSplitView('/ext', {
          title: 'Preserved Split View',
          size: '40',
          collapsed: false
        });
        setTimeout(() => {
          cy.get('#splitViewContainer').should('be.visible');
          cy.expect(handle.exists()).to.be.true;
        }, 0);
        // It is not totally clear why it is not working without timeout, but it seems like a race condition
        // TODO: Check stackoverflow for solution
        // https://stackoverflow.com/questions/60338487/cypress-executes-assertion-immediately-on-function-that-returns-a-handle
        setTimeout(() => {
          handle.close();
          setTimeout(() => {
            cy.expect(handle.exists()).to.be.false;
            cy.get('#splitViewContainer').should('not.exist');
            done();
          }, 50);
        }, 50);
      });
    });
    it('Core API collapse in SplitView', done => {
      cy.window().then(win => {
        const handle = win.Luigi.navigation().openAsSplitView('/ext', {
          title: 'Preserved Split View',
          size: '40',
          collapsed: false
        });
        setTimeout(() => {
          handle.collapse();
          setTimeout(() => {
            cy.expect(handle.isCollapsed()).to.be.true;
            done();
          }, 50);
        }, 50);
      });
    });
    it('Core API expand SplitView', done => {
      cy.window().then(win => {
        const handle = win.Luigi.navigation().openAsSplitView('/ext', {
          title: 'Preserved Split View',
          size: '40',
          collapsed: false
        });
        setTimeout(() => {
          handle.expand();
          setTimeout(() => {
            cy.expect(handle.isExpanded()).to.be.true;
            done();
          }, 50);
        }, 50);
      });
    });
    it('Core API open collapsed splitview and check if expand container will disappear after navigation', () => {
      cy.get('.fd-shellbar').should('be.visible');
      cy.window().then(win => {
        const handle = win.Luigi.navigation().openAsSplitView('/overview', {
          title: 'Preserved Split View',
          size: '40',
          collapsed: true
        });
        setTimeout(() => {
          cy.get('#splitViewContainer').should('be.visible');
          cy.get('.fd-shellbar')
            .contains('Projects')
            .click();
          cy.expectPathToBe('/projects');
          cy.get('#splitViewContainer').should('not.exist');
        }, 0);
      });
    });
    it('Core API navigate with params', () => {
      cy.window().then(win => {
        win.Luigi.navigation()
          .withParams({ test: true })
          .navigate('/settings');
        cy.expectPathToBe('/settings');
        cy.expectSearchToBe('?~test=true');
        cy.getIframeBody().then($iframeBody => {
          cy.wrap($iframeBody).should('contain', '"test": "true"');
        });
      });
    });
    it('Core API navigate back & forth from node w/ params to node w/o params', () => {
      cy.window().then(win => {
        win.Luigi.navigation()
          .withParams({ test: true })
          .navigate('/settings');
        cy.expectPathToBe('/settings');
        cy.expectSearchToBe('?~test=true');
        cy.getIframeBody().then($iframeBody => {
          cy.wrap($iframeBody).should('contain', '"test": "true"');
        });
      });
      cy.window().then(win => {
        win.Luigi.navigation().navigate('/settings');
        cy.expectPathToBe('/settings');
        cy.expectSearchToBe('');
        cy.getIframeBody().then($iframeBody => {
          cy.wrap($iframeBody).should('not.contain', '"test": "true"');
        });
      });
      cy.window().then(win => {
        win.Luigi.navigation()
          .withParams({ test: true })
          .navigate('/settings');
        cy.expectPathToBe('/settings');
        cy.expectSearchToBe('?~test=true');
        cy.getIframeBody().then($iframeBody => {
          cy.wrap($iframeBody).should('contain', '"test": "true"');
        });
      });
    });
  });

  describe('Normal navigating', () => {
    it('Click around using navigation', () => {
      // projects page
      cy.get('.fd-shellbar')
        .contains('Projects')
        .click();

      //projects page
      cy.get('.fd-app__sidebar').should('contain', 'Project One');
      cy.get('.fd-app__sidebar').should('contain', 'Project Two');
      cy.get('.fd-app__sidebar')
        .contains('Project One')
        .click();

      //project one page
      cy.expectPathToBe('/projects/pr1');

      cy.get('.fd-app__sidebar').should('not.contain', 'Project One');
      cy.get('.fd-app__sidebar').should('contain', 'Miscellaneous2');
      cy.get('.fd-app__sidebar')
        .contains('Default Child node Example')
        .click();

      //default child node example
      cy.expectPathToBe('/projects/pr1/dps/dps2');

      cy.get('.fd-app__sidebar').should('contain', 'First Child');
      cy.get('.fd-app__sidebar').should('contain', 'Second Child');
    });

    it('Find configured testid on navigation node', () => {
      cy.visit('/projects/pr1/settings');
      cy.get('a[data-testid="myTestId"]').should('exist');
    });

    it('Set default testid on navigation node', () => {
      cy.visit('/projects/pr1/developers');
      cy.get('a[data-testid="developers_developers"]').should('exist');
    });

    it('Check if active node is selected', () => {
      cy.visit('/projects');
      cy.get('.fd-shellbar')
        .contains('Projects')
        .should('have.class', 'is-selected');

      cy.visit('projects/pr1');
      cy.get('.fd-nested-list')
        .contains('Project Settings')
        .click()
        .should('have.class', 'is-selected');
    });

    it('Check if status badge is rendered', () => {
      cy.visit('/projects/pr2/');
      cy.get('a[data-testid="myTestId"] .fd-object-status--informative').should('exist');
      cy.get('a[data-testid="myTestId"] .fd-object-status__text').should('contain', 'Project');
    });

    it('Check if status badge on User Settings is rendered right aligned', () => {
      cy.visit('/projects/pr2/');
      cy.get('a[data-testid="myTestId"] .badge-align-right').should('exist');
      cy.get('a[data-testid="myTestId"] .badge-align-right').should('contain', 'User Settings');
    });

    it('Check if active node reloads page', () => {
      cy.visit('/projects/pr1/developers');
      cy.getIframeBody().then($iframeBody => {
        cy.wrap($iframeBody)
          .should('contain', 'Developers content')
          .find('.fd-layout-panel').should('have.attr', 'title').and('match', /^visitors/);
        cy.get('.fd-app__sidebar')
          .contains('Project Settings')
          .click();
        cy.wrap($iframeBody).find('.fd-layout-panel').should('not.have.attr', 'title');
        cy.get('.fd-app__sidebar')
          .contains('Developers')
          .click();
        cy.wrap($iframeBody).find('.fd-layout-panel').should('have.attr', 'title').and('match', /^visitors/);
      });
      cy.get('.fd-app__sidebar')
        .contains('Developers')
        .click();
      cy.getIframeBody().then($iframeBody => {
        cy.wrap($iframeBody)
          .should('contain', 'Developers content')
          .find('.fd-layout-panel').should('have.attr', 'title').and('match', /^visitors/);
      });
    });

    it('Browser back works with Default Child mechanism', () => {
      cy.getIframeBody().then($iframeBody => {
        cy.wrap($iframeBody)
          .contains('defaultChildNode')
          .click();
        cy.expectPathToBe('/projects/pr1/dps/dps2');
        cy.window().historyBack();
        cy.expectPathToBe('/overview');
      });
    });

    it('Icon instead of label in TopNav', () => {
      cy.get('[data-testid="settings_settings"]>.fd-top-nav__icon').should('exist');
      cy.get('[data-testid="settings_settings"]').should('contain', '');
    });

    it('Icon with label label in TopNav', () => {
      cy.get('[data-testid="icon-and-label"]>.fd-top-nav__icon').should('exist');
      cy.get('[data-testid="icon-and-label"]').should('contain', 'Git');
      cy.get('[data-testid="icon-and-label"] .fd-object-status--negative').should('exist');
      cy.get('a[data-testid="icon-and-label"] .fd-object-status__text').should('contain', 'Git');
    });

    it('Icon with label in LeftNav', () => {
      cy.get('.fd-shellbar')
        .contains('Projects')
        .click();
      cy.get('.fd-app__sidebar .fd-nested-list__item')
        .contains('Project One')
        .click();

      cy.get('.fd-nested-list__item')
        .contains('Project Settings')
        .find('.fd-nested-list__icon')
        .should('exist');
    });

    it('Shows Luigi version in LeftNav', () => {
      // projects page
      cy.get('.fd-shellbar')
        .contains('Projects')
        .click();

      cy.get('.fd-app__sidebar .lui-side-nav__footer')
        .contains('Luigi Client:')
        .should('be.visible');

      cy.window().then(win => {
        const config = win.Luigi.getConfig();
        config.settings.sideNavFooterText = 'Hello from tets.';
        win.Luigi.configChanged('settings.footer');

        cy.get('.fd-app__sidebar .lui-side-nav__footer')
          .contains('Hello from tets.')
          .should('be.visible');
      });
    });

    it('Side nav does not broken while clicking empty viewUrl node', () => {
      cy.get('.fd-shellbar')
        .contains('Projects')
        .click();

      cy.get('.fd-app__sidebar .fd-nested-list__item')
        .contains('Project One')
        .click();

      cy.get('.fd-side-nav')
        .contains('Empty viewUrl node')
        .click();

      cy.get('.fd-side-nav').should('contain', 'Empty viewUrl node');
    });

    it('Redirect to root path while reaching empty viewUrl node directly', () => {
      cy.visit('/projects/pr2/emptyViewUrl');

      cy.get('[data-testid=luigi-alert]').should('have.class', 'fd-message-strip--error');
      cy.get('[data-testid=luigi-alert]')
        .find('.fd-message-strip__icon-container span')
        .should('have.class', 'sap-icon--message-error');
      cy.expectPathToBe('/overview');
    });
  });

  describe('Node activation hook', () => {
    const nodeActivationPath = '/projects/pr1/on-node-activation';
    it('does not navigate - synchronously', () => {
      cy.visitLoggedIn(nodeActivationPath);

      cy.getIframeBody().then($iframeBody => {
        cy.wrap($iframeBody)
          .find('[data-testid="node-activation-no-navigation"]')
          .click();

        cy.expectPathToBe(nodeActivationPath);
        cy.get('[data-testid="luigi-alert"]').contains('Showing an alert instead of navigating');
      });
    });

    it('does not navigate - asynchronously (from left navigation)', () => {
      cy.visitLoggedIn(nodeActivationPath);

      cy.get('.sap-icon--question-mark').click();

      cy.get('[data-testid=luigi-modal-dismiss]').click();

      cy.expectPathToBe(nodeActivationPath);
    });

    it('navigates - asynchronously', () => {
      cy.visitLoggedIn(nodeActivationPath);

      cy.getIframeBody().then($iframeBody => {
        // wrap the body of your iframe with cy so as to do cy actions inside iframe elements
        cy.wrap($iframeBody)
          .find('[data-testid="node-activation-conditional-navigation"]')
          .click();

        cy.get('[data-testid=luigi-modal-confirm]').click();

        cy.expectPathToBe(`${nodeActivationPath}/navigated`);
      });
    });
  });

  // Disabled, since it only works if autologin is false
  /*
  it('Anonymous content', () => {
    cy.get('.fd-shellbar')
      .contains('Visible for all users')
      .should('exist');

    cy.get('.fd-shellbar')
      .contains('Visible for anonymous users only')
      .should('not.exist');
  });
  */
});
