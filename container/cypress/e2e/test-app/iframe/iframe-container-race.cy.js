// Regression test for luigi-project/luigi#5403
//
// createIframe() is scheduled via setTimeout at the end of initialize().
// If the <luigi-container> is removed from the DOM before that deferred
// callback fires (e.g. a navigation re-sync in path routing mode), Svelte
// resets the `bind:this` reference (`mainComponent`) to null, which used to
// crash with "TypeError: Cannot read properties of null (reading 'appendChild')".
//
// The container now guards against a null `mainComponent` and bails out.
describe('Iframe Container removed before deferred iframe creation (#5403)', () => {
  it('does not throw when the container is removed before createIframe runs', () => {
    let raceError = null;

    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Cannot read properties of null') && err.message.includes('appendChild')) {
        // Capture the regression error and assert on it below instead of
        // letting Cypress fail immediately, so the assertion message is clear.
        raceError = err;
        return false;
      }
      // Let unrelated exceptions fail the test as usual.
      return undefined;
    });

    cy.visit('http://localhost:8080/iframe/iframeContainerRace.html');

    cy.get('#content').then(($content) => {
      cy.window().then((win) => {
        const container = win.document.createElement('luigi-container');
        container.viewurl = './microfrontend.html';
        $content[0].appendChild(container);

        // Remove the container before the deferred createIframe() setTimeout
        // fires. A microtask always runs before the next macrotask (the
        // setTimeout), so Svelte nulls `mainComponent` first and the guard is
        // exercised on the exact code path reported in the issue.
        win.queueMicrotask(() => container.remove());
      });
    });

    // Give the deferred setTimeout enough time to fire.
    cy.wait(300);

    cy.then(() => {
      expect(raceError, 'null appendChild TypeError should not be thrown').to.equal(null);
    });
  });
});
