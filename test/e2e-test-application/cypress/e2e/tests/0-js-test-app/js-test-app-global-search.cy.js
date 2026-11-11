import defaultLuigiConfig from '../../configs/default';

describe('JS-TEST-APP', () => {
  describe('Global Search', () => {
    let newConfig;
    let onSearchBtnClickStub;
    let onEnterStub;
    let onInputStub;

    beforeEach(() => {
      onSearchBtnClickStub = cy.stub().as('onSearchBtnClick');
      onEnterStub = cy.stub().as('onEnter');
      onInputStub = cy.stub().as('onInput');
    });

    function buildConfig(tag, extraGlobalSearch = {}) {
      const cfg = structuredClone(defaultLuigiConfig);
      cfg.tag = tag;
      cfg.globalSearch = {
        searchProvider: {
          inputPlaceholder: 'Search...'
        },
        ...extraGlobalSearch
      };
      // Stubs cannot be cloned, so attach after structuredClone.
      cfg.globalSearch.searchProvider.onSearchBtnClick = onSearchBtnClickStub;
      cfg.globalSearch.searchProvider.onEnter = onEnterStub;
      cfg.globalSearch.searchProvider.onInput = onInputStub;
      return cfg;
    }

    describe('Default style (no style option)', () => {
      beforeEach(() => {
        newConfig = buildConfig('js-test-app-global-search-default');
      });

      it('renders the desktop toggle button and no in-pill addons', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('#app[configversion="js-test-app-global-search-default"]');

        // outside toggle button visible
        cy.get('[data-testid="luigi-search-btn-desktop"]').should('be.visible');

        // in-pill submit/cancel addons do NOT exist in default layout
        cy.get('[data-testid="luigi-search-submit"]').should('not.exist');
        cy.get('[data-testid="luigi-search-cancel"]').should('not.exist');

        // root container should NOT have the vega modifier class
        cy.get('.luigi-search').should('not.have.class', 'luigi-search--vega');
      });

      it('toggle button stays visible when the field is expanded', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('#app[configversion="js-test-app-global-search-default"]');

        cy.get('[data-testid="luigi-search-btn-desktop"]').click();
        cy.get('[data-testid="luigi-search-input"]').should('be.visible');
        cy.get('[data-testid="luigi-search-btn-desktop"]').should('be.visible');
      });
    });

    describe('Vega style', () => {
      beforeEach(() => {
        newConfig = buildConfig('js-test-app-global-search-vega', { style: 'vega' });
      });

      it('adds the vega modifier class and renders both in-pill addons', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('#app[configversion="js-test-app-global-search-vega"]');

        cy.get('.luigi-search').should('have.class', 'luigi-search--vega');

        // in-pill submit (magnifier) and cancel (X) buttons exist
        cy.get('[data-testid="luigi-search-submit"]').should('exist');
        cy.get('[data-testid="luigi-search-cancel"]').should('exist');
      });

      it('hides the outside toggle while the field is expanded and shows it again on collapse', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('#app[configversion="js-test-app-global-search-vega"]');

        // initially: field collapsed, outside toggle visible
        cy.get('[data-testid="luigi-search-btn-desktop"]').should('be.visible');

        // expand
        cy.get('[data-testid="luigi-search-btn-desktop"]').click();
        cy.get('[data-testid="luigi-search-input"]').should('be.visible');

        // outside toggle wrapper now hidden via the --hidden modifier (display:none)
        cy.get('.luigi-search-btn-toggle').should('have.class', 'luigi-search-btn-toggle--hidden');
        cy.get('[data-testid="luigi-search-btn-desktop"]').should('not.be.visible');

        // collapse via in-pill magnifier (input is empty → toggleSearch is invoked)
        cy.get('[data-testid="luigi-search-submit"]').click();
        cy.get('.luigi-search-btn-toggle').should('not.have.class', 'luigi-search-btn-toggle--hidden');
        cy.get('[data-testid="luigi-search-btn-desktop"]').should('be.visible');
      });

      it('clicking the in-pill magnifier with a value calls searchProvider.onSearchBtnClick', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('#app[configversion="js-test-app-global-search-vega"]');

        cy.get('[data-testid="luigi-search-btn-desktop"]').click();
        cy.get('[data-testid="luigi-search-input"]').type('hello');

        cy.get('[data-testid="luigi-search-submit"]').click();

        cy.get('@onSearchBtnClick').should('have.been.calledOnce');
        cy.get('@onEnter').should('not.have.been.called');
        // field stays expanded — submit must not collapse when input has text
        cy.get('[data-testid="luigi-search-input"]').should('be.visible');
      });

      it('clicking the in-pill magnifier with an empty input collapses the field', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('#app[configversion="js-test-app-global-search-vega"]');

        cy.get('[data-testid="luigi-search-btn-desktop"]').click();
        cy.get('[data-testid="luigi-search-input"]').should('be.visible');

        // empty input → click acts as collapse, not submit
        cy.get('[data-testid="luigi-search-submit"]').click();
        cy.get('@onSearchBtnClick').should('not.have.been.called');
        cy.get('[data-testid="luigi-search-btn-desktop"]').should('be.visible');
      });

      it('clicking the in-pill cancel button clears the input and notifies onInput', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('#app[configversion="js-test-app-global-search-vega"]');

        cy.get('[data-testid="luigi-search-btn-desktop"]').click();
        cy.get('[data-testid="luigi-search-input"]').type('something');
        cy.get('[data-testid="luigi-search-input"]').should('have.value', 'something');

        // typing already triggered onInput — reset so we only assert the post-clear call
        cy.get('@onInput').invoke('resetHistory');

        cy.get('[data-testid="luigi-search-cancel"]').click();

        cy.get('[data-testid="luigi-search-input"]').should('have.value', '');
        cy.get('@onInput').should('have.been.calledOnce');
      });

      it('falls back to searchProvider.onEnter when onSearchBtnClick is not defined', () => {
        const cfg = structuredClone(defaultLuigiConfig);
        cfg.tag = 'js-test-app-global-search-vega-fallback';
        cfg.globalSearch = {
          style: 'vega',
          searchProvider: { inputPlaceholder: 'Search...' }
        };
        // only onEnter, no onSearchBtnClick
        cfg.globalSearch.searchProvider.onEnter = onEnterStub;

        cy.visitTestApp('/home/one', cfg);
        cy.get('#app[configversion="js-test-app-global-search-vega-fallback"]');

        cy.get('[data-testid="luigi-search-btn-desktop"]').click();
        cy.get('[data-testid="luigi-search-input"]').type('query');
        cy.get('[data-testid="luigi-search-submit"]').click();

        cy.get('@onEnter').should('have.been.calledOnce');
      });
    });
  });
});
