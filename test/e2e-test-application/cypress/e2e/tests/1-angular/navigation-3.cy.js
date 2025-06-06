describe('Navigation', () => {
  beforeEach(() => {
    cy.visitLoggedIn('/');
  });

  describe('Node navigation title', () => {
    it('Node navigation title attr exist', () => {
      cy.get('.fd-shellbar').contains('Projects').click();
      cy.get('.fd-app__sidebar .fd-nested-list__item').contains('Project One').click();
      cy.get('.fd-nested-list__link')
        .contains('Miscellaneous2')
        .parent()
        .should('have.attr', 'title', 'Miscellaneous2');
    });

    it('Node navigation title attr tooltipText text', () => {
      cy.get('.fd-shellbar').contains('Projects').click();
      cy.get('.fd-app__sidebar .fd-nested-list__item').contains('Project One').click();
      cy.get('.fd-nested-list__link')
        .contains('Webcomponent')
        .parent()
        .should('have.attr', 'title', 'Webcomponent tooltipText');
    });

    it('Node navigation title attr tooltipText not exist', () => {
      cy.get('.fd-shellbar').contains('Projects').click();
      cy.get('.fd-app__sidebar .fd-nested-list__item').contains('Project One').click();
      cy.get('.fd-nested-list__link')
        .contains('Miscellaneous2 (Isolated View)')
        .parent()
        .should('have.attr', 'title', 'Miscellaneous2 (Isolated View)');
    });

    it('Node navigation title attr default.tooltipText text', () => {
      cy.window().then((win) => {
        const config = win.Luigi.getConfig();
        config.navigation.defaults = {
          tooltipText: 'Defaults tooltipText'
        };
        win.Luigi.configChanged('settings.navigation');
        cy.get('.fd-shellbar').contains('Projects').click();
        cy.get('.fd-app__sidebar .fd-nested-list__item').contains('Project One').click();
        cy.get('.fd-nested-list__link')
          .contains('Default Child node Example')
          .parent()
          .should('have.attr', 'title', 'Defaults tooltipText');
      });
    });

    it('Node navigation title attr default.tooltipText set false', () => {
      cy.window().then((win) => {
        const config = win.Luigi.getConfig();
        config.navigation.defaults = {
          tooltipText: false
        };
        win.Luigi.configChanged('settings.navigation');
        cy.get('.fd-shellbar').contains('Projects').click();
        cy.get('.fd-app__sidebar .fd-nested-list__item').contains('Project One').click();
        cy.get('.fd-nested-list__link').contains('Miscellaneous2').parent().should('have.attr', 'title', '');
        cy.get('.fd-nested-list__link')
          .contains('Webcomponent')
          .parent()
          .should('have.attr', 'title', 'Webcomponent tooltipText');
      });
    });
  });

  describe('Horizontal Tab Navigation', () => {
    context('Desktop', () => {
      it('Open horizontal navigation', () => {
        cy.get('.fd-shellbar').contains('Projects').click();

        cy.get('.fd-app__sidebar').contains('Horizontal Navigation Example').click();

        cy.expectPathToBe('/projects/tabNav');

        cy.get('.fd-icon-tab-bar').contains('Node with node activation hook').click();
        cy.expectPathToBe('/projects/tabNav/on-node-activation');

        cy.get('.fd-icon-tab-bar').contains('Settings').click();
        cy.get('.fd-icon-tab-bar').contains('Project Settings').click();
        cy.expectPathToBe('/projects/tabNav/settings');

        cy.get('.fd-icon-tab-bar').contains('More').click();

        cy.get('.fd-nested-list').contains('Default Child node Example').click();

        cy.get('.fd-nested-list__item').contains('First Child').click();
        cy.expectPathToBe('/projects/tabNav/dps1');
      });

      it('open horizontal tab nav header microfrontend', () => {
        cy.get('[data-testid="tabnavheader_tabnavheader"]').click();
        cy.get('.lui-tab-header>').shadow().find('p').contains('Hello World from a TabNav Header microfrontend!');
        cy.getIframeBody().then((result) => {
          cy.wrap(result).contains('Global Settings');
        });
      });
      it('scrollable dropdown in tabNav', () => {
        cy.viewport(1000, 300);
        cy.get('[data-testid="tabnavheader_tabnavheader"]').click();
        cy.get('.tabsContainerHeader').contains('Header 3').click();
        cy.get('.tabsContainerHeader .fd-icon-tab-bar__item--single-click .fd-popover__body').as('popoverBody');
        cy.get('@popoverBody').then(($div) => {
          const hasScrollbar = $div[0].scrollHeight > $div[0].clientHeight;
          expect(hasScrollbar).to.be.true;
        });
        cy.get('@popoverBody').contains('TabNav 8').should('be.not.visible');

        cy.get('@popoverBody').scrollTo('bottom');
        cy.get('@popoverBody').contains('TabNav 8').should('be.visible');
      });
    });

    context('Mobile', () => {
      beforeEach(() => {
        cy.viewport('iphone-6');
      });

      it('Horizontal Navigation on mobile', () => {
        cy.get('[data-testid="mobile-menu"]').click();
        cy.get('[data-testid="projects_projects-mobile"]').click();

        cy.get('.lui-burger').click();
        cy.get('.fd-side-nav').contains('Horizontal Navigation Example');
        cy.get('[data-testid="tabnav_horizontalnavigationexample"]').click();
        cy.get('[data-testid="tabnav_horizontalnavigationexample"]').should('have.class', 'is-selected');
        cy.get('.fd-icon-tab-bar').contains('User Management');
        cy.get('.fd-icon-tab-bar__item').contains('Node with node activation hook').should('not.visible');
        cy.get('.fd-icon-tab-bar').contains('More');
      });

      it('Test activated node on moible with keep selected context', () => {
        cy.visit('/projects/tabNav/avengers/captain-america/super-power');
        cy.get('.fd-icon-tab-bar__overflow').should('have.class', 'is-active');
        cy.get('.fd-icon-tab-bar__overflow').click();
        cy.get('.fd-nested-list__title')
          .contains('Keep Selected Example')
          .parent()
          .should('have.attr', 'aria-selected', 'true');
      });

      it('recalc of tab nav by using resizing', () => {
        cy.visit('/projects/tabNav');
        cy.get('.luigi-tabsContainerHeader').within(() => {
          cy.get('.fd-icon-tab-bar__item').contains('User Management').should('be.visible');
          cy.get('.fd-icon-tab-bar__item').contains('Node with node activation hook').should('not.be.visible');
          cy.get('.fd-icon-tab-bar__item').contains('Settings').should('not.be.visible');
        });
        cy.viewport(900, 750);
        cy.get('.luigi-tabsContainerHeader').within(() => {
          cy.get('.fd-icon-tab-bar__item').contains('Settings').should('be.visible');
          cy.get('.fd-icon-tab-bar__item').contains('Settings').click();
          cy.get('.fd-popover').contains('Project Settings').click();
          cy.expectPathToBe('/projects/tabNav/settings');
          cy.get('.fd-icon-tab-bar__item').contains('Settings').should('have.attr', 'aria-selected', 'true');
        });
      });

      it('ResponsiveNavigation Semicollapsed', () => {
        cy.viewport(890, 600);
        cy.window().then((win) => {
          const config = win.Luigi.getConfig();
          config.settings.responsiveNavigation = 'semiCollapsible';
          win.Luigi.configChanged('settings');
          cy.get('[data-testid="mobile-menu"]').click();
          cy.get('[data-testid="projects_projects-mobile"]').click();
          cy.get('.fd-side-nav').contains('Horizontal Navigation Example');
          cy.get('[data-testid="tabnav_horizontalnavigationexample"]').click();
          cy.get('.fd-icon-tab-bar__item').contains('Miscellaneous 2').should('not.exist');
          cy.get('[data-testid="semiCollapsibleButton"]').click();
          cy.get('.fd-icon-tab-bar__item').contains('Miscellaneous2').should('be.visible');
        });
      });

      it('open horizontal tab nav header microfrontend', () => {
        cy.get('[data-testid="mobile-menu"]').click();
        cy.get('[data-testid="tabnavheader_tabnavheader-mobile"]').click();
        cy.get('.lui-tab-header>').shadow().find('p').contains('Hello World from a TabNav Header microfrontend!');
        cy.getIframeBody().then((result) => {
          cy.wrap(result).contains('Global Settings');
        });
      });
    });
  });

  describe('GlobalSearch', () => {
    context('Desktop', () => {
      it('GlobalSearch Desktop', () => {
        cy.get('.luigi-search__input').should('not.be.visible');
        cy.get('[data-testid=luigi-search-btn-desktop]').click();
        cy.get('.luigi-search__input').should('be.visible');
        cy.get('.luigi-search__input').type('Luigi');
        cy.get('[data-testid=luigi-search-btn-desktop]').click();
        cy.get('.luigi-search__input').should('not.be.visible');
        cy.get('[data-testid=luigi-search-btn-desktop]').click();
        cy.get('.luigi-search__input').should('not.have.value', 'Luigi');
      });
    });
    context('Mobile', () => {
      beforeEach(() => {
        cy.viewport('iphone-6');
      });
      it('GlobalSearch Mobile', () => {
        cy.get('.luigi-search-shell__mobile .luigi-search__input').should('not.exist');
        cy.get('[data-testid=mobile-menu]').click();
        cy.get('[data-testid=luigi-search-btn-mobile]').click();
        cy.get('.luigi-search-shell__mobile .luigi-search__input').should('be.visible');
        cy.get('.luigi-search-shell__mobile .luigi-search__input').type('Luigi');

        cy.get('[data-testid=mobile-menu]').click();
        cy.get('[data-testid=luigi-search-btn-mobile]').click();
        cy.get('.luigi-search-shell__mobile .luigi-search__input').should('not.exist');

        cy.get('[data-testid=mobile-menu]').click();
        cy.get('[data-testid=luigi-search-btn-mobile]').click();
        cy.get('.luigi-search-shell__mobile .luigi-search__input').should('not.have.value', 'Luigi');
      });
    });
  });

  describe('Global Navigation', () => {
    context('Desktop', () => {
      it('not render global side navigation when globalSideNavigation is false', () => {
        cy.window().then((win) => {
          const config = win.Luigi.getConfig();
          config.settings.globalSideNavigation = false;
          config.settings.experimental = { globalNav: true };
          win.Luigi.configChanged();

          cy.get('.lui-global-nav-visible').should('not.exist');
          cy.get('.lui-globalnav .fd-side-nav').should('not.exist');
        });
      });

      it('not render global side navigation when experimental globalNav is false', () => {
        cy.window().then((win) => {
          const config = win.Luigi.getConfig();
          config.settings.globalSideNavigation = true;
          config.settings.experimental = { globalNav: false };
          win.Luigi.configChanged();

          cy.get('.lui-global-nav-visible').should('not.exist');
          cy.get('.lui-globalnav .fd-side-nav').should('not.exist');
        });
      });

      it('render global side navigation', () => {
        cy.window().then((win) => {
          const config = win.Luigi.getConfig();
          config.settings.globalSideNavigation = true;
          config.settings.experimental = { globalNav: true };
          win.Luigi.configChanged();

          // render global nav tool bar
          cy.get('.lui-global-nav-visible').should('be.visible');
          cy.get('.lui-globalnav .fd-side-nav__main-navigation .fd-nested-list')
            .should('be.visible')
            .children()
            .should('have.length', 2);

          // select global nav node
          cy.get('[data-testid="settings_settings"]').should('exist').not('.is-selected').click();

          // select global nav node again to wait for the rerendering of the element
          cy.get('[data-testid="settings_settings"]').should('have.class', 'is-selected');

          cy.expectPathToBe('/settings');
        });
      });
    });
    context('Mobile', () => {
      beforeEach(() => {
        cy.viewport('iphone-6');
      });

      it('Responsive Global Side Navigation', () => {
        cy.viewport(800, 600);
        cy.window().then((win) => {
          const config = win.Luigi.getConfig();
          config.settings.globalSideNavigation = true;
          config.settings.experimental = { globalNav: true };
          win.Luigi.configChanged();

          cy.get('.lui-globalnav').should('be.visible');
          cy.get('.lui-globalnav .fd-side-nav__main-navigation .fd-nested-list')
            .should('be.visible')
            .children()
            .should('have.length', 2);
        });
      });
    });
  });

  describe('Feature toggles', () => {
    it('Node visibility with feature toggles via url', () => {
      cy.window().then((win) => {
        win.Luigi.navigation().navigate('/projects/pr1/settings_ft');
        cy.expectPathToBe('/projects/pr1');
      });
      cy.window().then((win) => {
        win.Luigi.navigation().navigate('/projects/pr1/settings_ft?ft=ft1');
        cy.expectPathToBe('/projects/pr1/settings_ft');
      });
      cy.get('.fd-app__sidebar').should('contain', 'Project Settings 2');
      cy.get('.fd-app__sidebar').should('not.contain', 'Project Settings 3');
      cy.getIframeBody().then(($iframeBody) => {
        cy.wrap($iframeBody).should('contain', 'This is a feature toggle test and only visible if ft1 is active.');
      });
    });

    it('Negate featuretoggle for node visibility', () => {
      cy.visit('/projects/pr1/settings_ft3?ft=ft2');
      cy.get('.fd-app__sidebar').should('not.contain', 'Project Settings 2');
      cy.get('.fd-app__sidebar').should('contain', 'Project Settings 3');
    });
  });
});
