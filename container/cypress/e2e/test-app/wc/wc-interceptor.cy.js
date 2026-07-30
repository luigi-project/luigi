describe('webcomponentCreationInterceptor', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/wc/wc-interceptor.html');
  });

  it('should call interceptor and set custom attributes on web component (no defer-init)', () => {
    cy.get('#interceptor-test-no-defer')
      .shadow()
      .find('[lui_web_component]')
      .should('exist')
      .and('have.attr', 'data-intercepted', 'true')
      .and('have.attr', 'data-is-special-mf', 'false');
  });

  it('should call interceptor and set custom attributes on web component (defer-init)', () => {
    cy.get('#init-with-interceptor').click();

    cy.get('#interceptor-test-deferred')
      .shadow()
      .find('[lui_web_component]')
      .should('exist')
      .and('have.attr', 'data-intercepted', 'true')
      .and('have.attr', 'data-is-special-mf', 'false');
  });

  it('should not break container when interceptor throws an error', () => {
    cy.get('#init-with-error-interceptor').click();

    cy.get('#interceptor-test-error')
      .shadow()
      .find('[lui_web_component]')
      .should('exist');
  });
});
