describe('Create luigi-container dynamically', () => {
  const tetsPage = 'http://localhost:8080/wc/dynamic.html';

  it('luigi container webcomponent object selfRegistered', () => {
    cy.once('uncaught:exception', () => false);
    const scriptCode = `
            const lc = document.querySelector('#lc');
            lc.viewurl = "./helloWorldWCSelfRegistered.js";
            lc.webcomponent = { "selfRegistered": "true" };
            lc.context = { title: 'Nested' }
            `;

    const htmlCode = `
            <luigi-container id="lc" data-test-id="luigi-container"></luigi-container>
              <script>${scriptCode}</script>
            `;

    const stub = cy.stub();
    cy.on('window:alert', stub);
    cy.visit(tetsPage);
    cy.get('.content').invoke('append', htmlCode);
    cy.get('[data-test-id="luigi-container"]')
      .shadow()
      .find(
        'luigi-wc-687474703a2f2f6c6f63616c686f73743a383038302f77632f68656c6c6f576f726c64574353656c66526567697374657265642e6a73'
      )
      .shadow()
      .find('section')
      .should('contain.text', 'Hello World (self registered)!');
  });

  it('luigi container webcomponent is true', () => {
    cy.once('uncaught:exception', () => false);
    const scriptCode = `
            const lc = document.querySelector('#lc');
            lc.viewurl = "./wc/helloWorldWC.js";
            lc.webcomponent = true;
            lc.context = { title: 'Nested' }
            `;

    const htmlCode = `
            <luigi-container id="lc" data-test-id="luigi-container"></luigi-container>
              <script>${scriptCode}</script>
            `;

    const stub = cy.stub();
    cy.on('window:alert', stub);
    cy.visit(tetsPage);
    cy.get('.content').invoke('append', htmlCode);
    cy.get('[data-test-id="luigi-container"]')
      .shadow()
      .find('luigi-wc-687474703a2f2f6c6f63616c686f73743a383038302f77632f77632f68656c6c6f576f726c6457432e6a73')
      .shadow()
      .find('section')
      .should('contain.text', 'Nested');
  });

  it('luigi container webcomponent invalid value for attributes e.g. client-permissions ', () => {
    const scriptCode = `
            const lc = document.querySelector('#lc');
            lc.viewurl = "./helloWorldWCSelfRegistered.js";
            lc.webcomponent = { "selfRegistered": "true" };
            `;

    const htmlCode = `
            <luigi-container id="lc" data-test-id="luigi-container" client-permissions='value should be an object'></luigi-container>
              <script>${scriptCode}</script>
            `;

    const stub = cy.stub();
    cy.on('window:alert', stub);
    cy.visit(tetsPage);
    cy.get('.content').invoke('append', htmlCode);
    cy.get('[data-test-id="luigi-container"]')
      .shadow()
      .should('not.exist');
  });
  
  it('no shadow dom for LuigiContainer', () => {
    cy.once('uncaught:exception', () => false);
    const scriptCode = `
      const lc = document.querySelector('#lc');
      lc.viewurl = "./wc/helloWorldWC.js";
      lc.webcomponent = true;
      lc.noShadow = true;
    `;
    
    const htmlCode = `
      <luigi-container data-test-id="luigi-container" id="lc"></luigi-container>
      <script>${scriptCode}</script>
    `;
    const stub = cy.stub();
    cy.on('window:alert', stub);
    cy.visit(tetsPage);
    cy.get('.content').invoke('append', htmlCode);
    cy.get('[data-test-id="luigi-container"]')
      .shadow()
      .should('not.exist');
  });
  it('no viewurl for LuigiContainer', () => {
    const scriptCode = `
      const lc = document.querySelector('#lc');
      lc.webcomponent = true;
      function setViewUrl(){
        lc.viewurl = "./wc/helloWorldWC.js";
        lc.init();
      }
      `;
     const htmlCode = `
      <button class="setViewUrl" onclick="setViewUrl()">Set View URL</button>
      <luigi-container data-test-id="luigi-container" id="lc"></luigi-container>
      <script>${scriptCode}</script>
    `;
    cy.visit(tetsPage);
    cy.get('.content').invoke('append', htmlCode);
    cy.get('[data-test-id="luigi-container"]')
      .shadow()
      .should('not.exist');
    cy.get('.setViewUrl').click();
      cy.get('[data-test-id="luigi-container"]')
      .shadow().find('luigi-wc-687474703a2f2f6c6f63616c686f73743a383038302f77632f77632f68656c6c6f576f726c6457432e6a73').shadow()
      .should('contain.text', 'WC based Container');
  });
});