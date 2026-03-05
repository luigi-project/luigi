describe('create luigi-compound-container dynamically', () => {
  const tetsPage = 'http://localhost:8080/compound/dynamic.html';

  it('luigi compound container webcomponent object selfRegistered', () => {
    const scriptCode = `
        <script>
            const content = document.querySelector('.content');
            const wc = document.createElement('luigi-compound-container');
            wc.context = { title: 'Nested' }
            wc.viewurl = 'http://localhost:8080/assets/nested2.js';

            wc.compoundConfig = {
                eventListeners: [
                    {
                        source: "*",
                        name: 'buttonPressed',
                        action: 'changeColor',
                        dataConverter: (data) => {
                            var rd = () => {
                                return Math.round(Math.random() * 255);
                            };

                            return {
                                color1: "251,244,199",
                                color2: "255,149,219"
                            }
                        }
                    }
                ],
                children: [{
                    viewUrl: 'http://localhost:8080/assets/panelHeader.js',
                    context: {
                        title: 'My Awesome Grid',
                        description: 'Really awesome'
                    },
                    layoutConfig: {
                        slot: "header"
                    },
                    eventListeners: [{
                        source: 'input1',
                        name: 'sendInput',
                        action: 'update',
                        dataConverter: (data) => {
                            return 'new text: ' + data;
                        }
                    }]
                }, {
                    viewUrl: 'http://localhost:8080/assets/panelFooter.js',
                    context: {
                        footer: 'This is the end of awesomeness'
                    },
                    layoutConfig: {
                        slot: "footer"
                    }
                }, {
                    viewUrl: 'http://localhost:8080/assets/main.js',
                    layoutConfig: {
                        slot: "content"
                    },
                    context: {
                        label: 'I am nested!'
                    }
                }, {
                    viewUrl: 'http://localhost:8080/assets/mfeMain.js',
                    context: {
                        label: 'Update Joke',
                        showAlert: false
                    }
                }]
            };
            content.appendChild(wc);
        </script>
    `;
    const stub = cy.stub();

    cy.on('window:alert', stub);
    cy.visit(tetsPage);
    cy.get('.content').invoke('append', scriptCode);
    cy.get('luigi-compound-container')
      .shadow()
      .then(($container) => {
        return cy
          .wrap($container)
          .find('luigi-wc-687474703a2f2f6c6f63616c686f73743a383038302f6173736574732f6e6573746564322e6a73')
          .shadow();
      })
      .then(($innerContainer) => {
        cy.wrap($innerContainer)
          .get('luigi-wc-687474703a2f2f6c6f63616c686f73743a383038302f6173736574732f6d61696e2e6a73')
          .should('exist')
          .shadow()
          .find('section')
          .should('contain.text', 'This is a luigi micro frontend, based on web components.');
      });
  });

  it('luigi compound container invalid JSON in context property', () => {
    const scriptCode = `
        <script>
            const content = document.querySelector('.content');
            const wc = document.createElement('luigi-compound-container');
            wc.context = '{"invalid": "JSON}'
            wc.viewurl = 'http://localhost:8080/assets/nested2.js';

            wc.compoundConfig = {
                eventListeners: [
                    {
                        source: "*",
                        name: 'buttonPressed',
                        action: 'changeColor',
                        dataConverter: (data) => {
                            var rd = () => {
                                return Math.round(Math.random() * 255);
                            };

                            return {
                                color1: "251,244,199",
                                color2: "255,149,219"
                            }
                        }
                    }
                ],
                children: [{
                    viewUrl: 'http://localhost:8080/assets/panelHeader.js',
                    context: {
                        title: 'My Awesome Grid',
                        description: 'Really awesome'
                    },
                    layoutConfig: {
                        slot: "header"
                    },
                    eventListeners: [{
                        source: 'input1',
                        name: 'sendInput',
                        action: 'update',
                        dataConverter: (data) => {
                            return 'new text: ' + data;
                        }
                    }]
                }, {
                    viewUrl: 'http://localhost:8080/assets/panelFooter.js',
                    context: {
                        footer: 'This is the end of awesomeness'
                    },
                    layoutConfig: {
                        slot: "footer"
                    }
                }, {
                    viewUrl: 'http://localhost:8080/assets/main.js',
                    layoutConfig: {
                        slot: "content"
                    },
                    context: {
                        label: 'I am nested!'
                    }
                }, {
                    viewUrl: 'http://localhost:8080/assets/mfeMain.js',
                    context: {
                        label: 'Update Joke',
                        showAlert: false
                    }
                }]
            };
            content.appendChild(wc);
            </script>
       `;
    const stub = cy.stub();

    cy.on('window:alert', stub);
    cy.visit(tetsPage);
    cy.get('.content').invoke('append', scriptCode);
    cy.get('luigi-compound-container').shadow().should('not.exist');
  });

  it('luigi compound container with no shadow dom', () => {
    const scriptCode = `
        <script>
            const content = document.querySelector('.content');
            const wc = document.createElement('luigi-compound-container');
            wc.context = { title: 'Nested' }
            wc.viewurl = 'http://localhost:8080/assets/nested2.js';
            wc.noShadow = true;
            wc.compoundConfig = {
                eventListeners: [
                    {
                        source: "*",
                        name: 'buttonPressed',
                        action: 'changeColor',
                        dataConverter: (data) => {
                            var rd = () => {
                                return Math.round(Math.random() * 255);
                            };

                            return {
                                color1: "251,244,199",
                                color2: "255,149,219"
                            }
                        }
                    }
                ],
                children: [{
                    viewUrl: 'http://localhost:8080/assets/panelHeader.js',
                    context: {
                        title: 'My Awesome Grid',
                        description: 'Really awesome'
                    },
                    layoutConfig: {
                        slot: "header"
                    },
                    eventListeners: [{
                        source: 'input1',
                        name: 'sendInput',
                        action: 'update',
                        dataConverter: (data) => {
                            return 'new text: ' + data;
                        }
                    }]
                }, {
                    viewUrl: 'http://localhost:8080/assets/panelFooter.js',
                    context: {
                        footer: 'This is the end of awesomeness'
                    },
                    layoutConfig: {
                        slot: "footer"
                    }
                }, {
                    viewUrl: 'http://localhost:8080/assets/main.js',
                    layoutConfig: {
                        slot: "content"
                    },
                    context: {
                        label: 'I am nested!'
                    }
                }, {
                    viewUrl: 'http://localhost:8080/assets/mfeMain.js',
                    context: {
                        label: 'Update Joke',
                        showAlert: false
                    }
                }]
            };
            content.appendChild(wc);
            </script>
       `;
    const stub = cy.stub();

    cy.on('window:alert', stub);
    cy.visit(tetsPage);
    cy.get('.content').invoke('append', scriptCode);
    cy.get('luigi-compound-container').shadow().should('not.exist');
  });
});
