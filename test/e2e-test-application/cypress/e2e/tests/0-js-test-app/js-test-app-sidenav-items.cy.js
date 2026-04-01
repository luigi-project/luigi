import defaultLuigiConfig from '../../configs/default';

describe('JS-TEST-APP', () => {
  const localRetries = {
    retries: {
      runMode: 4,
      openMode: 4
    }
  };

  describe('SideNav Footer Items', () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.settings.sideNav = {
        style: 'vega',
        footerItems: [
          {
            label: 'Legal Information',
            icon: 'sys-help',
            link: '/home/one'
          },
          {
            label: 'Resources',
            icon: 'folder',
            children: [
              { label: 'Documentation', link: '/home/two' },
              {
                label: 'GitHub',
                externalLink: {
                  url: 'https://github.com/luigi-project/luigi',
                  sameWindow: false
                }
              }
            ]
          },
          {
            label: 'External Docs',
            icon: 'world',
            externalLink: {
              url: 'https://docs.luigi-project.io',
              sameWindow: false
            },
            testId: 'external-docs-footer'
          }
        ]
      };
    });

    it('Should render footer items in Vega layout', localRetries, () => {
      cy.visitTestApp('/home/one', newConfig);

      cy.get('[data-testid="lui-sidenav-footer-items"]').should('exist');
      cy.get('[data-testid="lui-sidenav-footer-items"]').find('.lui-footer-nav-entry').should('have.length', 3);
    });

    it('Should render separator before footer items', localRetries, () => {
      cy.visitTestApp('/home/one', newConfig);

      cy.get('.fd-side-nav__separator').should('exist');
    });

    it('Should display correct labels and icons', localRetries, () => {
      cy.visitTestApp('/home/one', newConfig);

      cy.get('[data-testid="lui-sidenav-footer-items"]').within(() => {
        cy.contains('Legal Information').should('be.visible');
        cy.contains('Resources').should('be.visible');
        cy.contains('External Docs').should('be.visible');
      });
    });

    it('Should use custom testId when provided', localRetries, () => {
      cy.visitTestApp('/home/one', newConfig);

      cy.get('[data-testid="external-docs-footer"]').should('exist');
    });

    it('Should navigate to internal link on leaf item click', localRetries, () => {
      cy.visitTestApp('/home/two', newConfig);

      cy.get('[data-testid="lui-sidenav-footer-items"]').contains('Legal Information').click();

      cy.expectPathToBe('/home/one');
    });

    it('Should show expand arrow on collapsible items', localRetries, () => {
      cy.visitTestApp('/home/one', newConfig);

      cy.get('[data-testid="lui-sidenav-footer-items"]')
        .contains('Resources')
        .closest('.lui-footer-nav-entry')
        .find('.fd-navigation-list__navigation-indicator')
        .should('exist');
    });

    it('Should expand children on collapsible item click', localRetries, () => {
      cy.visitTestApp('/home/one', newConfig);

      // Children should not be visible initially
      cy.get('[data-testid="lui-sidenav-footer-items"]').find('.fd-navigation-list.level-2').should('not.exist');

      // Click the collapsible parent
      cy.get('[data-testid="lui-sidenav-footer-items"]').contains('Resources').click();

      // Children should now be visible
      cy.get('[data-testid="lui-sidenav-footer-items"]').find('.fd-navigation-list.level-2').should('exist');
      cy.get('[data-testid="lui-sidenav-footer-items"]').contains('Documentation').should('be.visible');
      cy.get('[data-testid="lui-sidenav-footer-items"]').contains('GitHub').should('be.visible');
    });

    it('Should collapse children on second click', localRetries, () => {
      cy.visitTestApp('/home/one', newConfig);

      // Expand
      cy.get('[data-testid="lui-sidenav-footer-items"]').contains('Resources').click();
      cy.get('[data-testid="lui-sidenav-footer-items"]').find('.fd-navigation-list.level-2').should('exist');

      // Collapse
      cy.get('[data-testid="lui-sidenav-footer-items"]').contains('Resources').click();
      cy.get('[data-testid="lui-sidenav-footer-items"]').find('.fd-navigation-list.level-2').should('not.exist');
    });

    it('Should navigate when clicking a child item', localRetries, () => {
      cy.visitTestApp('/home/one', newConfig);

      // Expand
      cy.get('[data-testid="lui-sidenav-footer-items"]').contains('Resources').click();

      // Click child
      cy.get('[data-testid="lui-sidenav-footer-items"]').contains('Documentation').click();

      cy.expectPathToBe('/home/two');
    });

    it('Should not render footer items without Vega style', localRetries, () => {
      delete newConfig.settings.sideNav.style;
      cy.visitTestApp('/home/one', newConfig);

      cy.get('[data-testid="lui-sidenav-footer-items"]').should('not.exist');
    });

    it('Should not render footer items when items array is empty', localRetries, () => {
      newConfig.settings.sideNav.footerItems = [];
      cy.visitTestApp('/home/one', newConfig);

      cy.get('[data-testid="lui-sidenav-footer-items"]').should('not.exist');
    });
  });
});
