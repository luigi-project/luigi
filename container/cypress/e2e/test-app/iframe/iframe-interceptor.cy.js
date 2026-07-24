describe('iframeCreationInterceptor', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/iframe/iframe-interceptor.html');
  });

  it('should call interceptor and set custom attributes on iframe', () => {
    cy.get('#init-with-interceptor').click();

    cy.get('#interceptor-test')
      .shadow()
      .find('iframe')
      .should('exist')
      .and('have.attr', 'data-intercepted', 'true')
      .and('have.attr', 'data-mfe-type', 'main')
      .and('have.attr', 'name', 'intercepted-iframe');
  });

  it('should not break container when interceptor throws an error', () => {
    cy.get('#init-with-error-interceptor').click();

    cy.get('#interceptor-test')
      .shadow()
      .find('iframe')
      .should('exist')
      .then((iframe) => {
        const $body = iframe.contents().find('body');
        cy.wrap($body).contains('iframeCreationInterceptor test microfrontend').should('exist');
      });
  });
});
