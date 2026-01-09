describe('Client-support-angular-lib', () => {
  describe('context', () => {
    it('getContextAsync', () => {
      cy.visitLoggedIn('/projects/pr1/developers');
      cy.getIframeBody().then(($iframeBody) => {
        cy.wrap($iframeBody).find('.contextAsyncBtn').click();
        cy.wrap($iframeBody).find('.contextAsync').contains('pr1');
      });
    });

    it('contextObservable', () => {
      cy.visitLoggedIn('/projects/pr1/developers');
      cy.getIframeBody().then(($iframeBody) => {
        cy.wrap($iframeBody).find('.contextObservableBtn').click();
        cy.wrap($iframeBody).find('.contextObservable').contains('pr1');
      });
    });

    it('contextSignal', () => {
      cy.visitLoggedIn('/projects/pr1/developers');
      cy.getIframeBody().then(($iframeBody) => {
        cy.wrap($iframeBody).find('.contextSignalBtn').click();
        cy.wrap($iframeBody).find('.contextSignal').contains('pr1');
        cy.wrap($iframeBody).find('.contextSignalEffect').contains('pr11');
        cy.wrap($iframeBody).find('.contextSignalComputed').contains('pr111');
      });
    });
  });
});
