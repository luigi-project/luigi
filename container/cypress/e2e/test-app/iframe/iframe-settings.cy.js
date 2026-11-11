describe('Iframe Settings Test', () => {
  let stub;

  beforeEach(() => {
    cy.visit('http://localhost:8080/iframe/iframe-settings.html');
    stub = cy.stub();
  });

  it('defer-init flag for iframe container', () => {
    cy.get('#defer-init-test').then((iframe) => {
      const $body = iframe.contents().find('main');
      expect($body.children()).to.have.length(0);

      // click button that calls container.init()
      cy.get('#defer-init-button').click();

      cy.get('#defer-init-test')
        .shadow()
        .get('iframe')
        .then((iframe) => {
          const $body = iframe.contents().find('body');
          cy.wrap($body).contains('defer-init test for iframes').should('exist');
        });
    });
  });

  it('set sandbox rules by property', () => {
    cy.get('button[id="sandbox-rules"]').click();
    cy.get('#defer-init-button').click();

    cy.get('#defer-init-test')
      .shadow()
      .get('iframe')
      .then((elements) => {
        cy.get(elements.first()).invoke('attr', 'sandbox').should('eq', 'allow-modals allow-popups');
      });
  });

  it('set sandbox rules by attribute', () => {
    cy.get('#sandbox-rules-test')
      .shadow()
      .find('iframe')
      .then((elements) => {
        cy.get(elements.last()).invoke('attr', 'sandbox').should('eq', 'allow-scripts allow-same-origin');
      });
  });

  describe('Allow Rules Test', () => {
    it('set allow rules by property', () => {
      cy.get('#set-allow-rules-button').click();
      cy.get('#defer-init-button').click();
      cy.get('#defer-init-test')
        .find('iframe')
        .last()
        .invoke('attr', 'allow')
        .should('eq', "microphone; camera 'none'; geolocation 'self' https://a.example.com https://b.example.com;");
    });

    it('set allow rules by attribute', () => {
      cy.get('#allow-rules-test')
        .shadow()
        .find('iframe')
        .last()
        .invoke('attr', 'allow')
        .should('eq', 'fullscreen; microphone;');
    });
  });

  describe('Luigi Client Initialization', () => {
    it('should initialize Luigi Client', () => {
      cy.get('iframe').then(($iframe) => {
        const iframeBody = $iframe.contents().find('body');

        const checkLuigiClientStatus = (expectedStatus) => {
          cy.wrap(iframeBody).find('#luigiClientStatus').should('exist').invoke('text').should('eq', expectedStatus);
        };

        checkLuigiClientStatus('Luigi Client Initialized: Unknown');
        cy.wait(2000);
        checkLuigiClientStatus('Luigi Client Initialized: true');
      });
    });
  });
});
