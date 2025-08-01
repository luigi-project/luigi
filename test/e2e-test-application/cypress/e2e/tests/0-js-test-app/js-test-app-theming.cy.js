import defaultLuigiConfig from '../../configs/default';

describe('JS-TEST-APP 2', () => {
  const localRetries = {
    retries: {
      runMode: 4,
      openMode: 4
    }
  };

  describe('Theming', () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.settings.theming = {
        themes: () => [
          { id: 'light', name: 'Fiori3 Light' },
          { id: 'dark', name: 'Fiori3 Dark' }
        ],
        defaultTheme: 'light'
      };
      newConfig.navigation.nodes.push({
        pathSegment: 'theming',
        label: 'Theming Test',
        viewUrl: '/examples/microfrontends/multipurpose.html#',
        context: {
          title: 'Welcome <h2 id="themeText"></h2>',
          content: `<img src="empty.gif" onerror='document.getElementById("themeText").innerHTML = LuigiClient.uxManager().getCurrentTheme();' />`
        }
      });
    });

    it('Client get and set theme', () => {
      cy.visitTestApp('/theming', newConfig);

      cy.getIframeBody().then(($body) => {
        cy.wrap($body).find('h2').contains('light');
      });
    });

    it('Iframe Url should get set with value by default', () => {
      newConfig.settings.theming.nodeViewURLDecorator = {
        queryStringParameter: {
          keyName: 'sap-theme'
        }
      };
      cy.visitTestApp('/', newConfig);

      cy.get('iframe').should((ifr) => {
        const url = new URL(ifr.attr('src'));
        expect(`${url.pathname}${url.search}${url.hash}`).to.equal(
          '/examples/microfrontends/multipurpose.html?sap-theme=light'
        );
      });
    });

    it('Iframe Url should get set with custom value', () => {
      newConfig.settings.theming.nodeViewURLDecorator = {
        queryStringParameter: {
          keyName: 'sap-theme',
          value: (themeId) => {
            return themeId + 'LUIGI';
          }
        }
      };
      cy.visitTestApp('/', newConfig);

      cy.get('iframe').should((ifr) => {
        const url = new URL(ifr.attr('src'));
        expect(`${url.pathname}${url.search}${url.hash}`).to.equal(
          '/examples/microfrontends/multipurpose.html?sap-theme=lightLUIGI'
        );
      });
    });

    it('Get current theme for a webcomponent', () => {
      newConfig.navigation.nodes[0].children.push({
        pathSegment: 'wc',
        label: 'WC',
        viewUrl: '/examples/microfrontends/getCurrentThemeWC.js',
        webcomponent: true
      });
      cy.visitTestApp('/home/wc', newConfig);
      cy.get(
        'luigi-wc-687474703a2f2f6c6f63616c686f73743a343530302f6578616d706c65732f6d6963726f66726f6e74656e64732f67657443757272656e745468656d6557432e6a73'
      )
        .shadow()
        .contains('light')
        .should('not.exist');
      cy.get(
        'luigi-wc-687474703a2f2f6c6f63616c686f73743a343530302f6578616d706c65732f6d6963726f66726f6e74656e64732f67657443757272656e745468656d6557432e6a73'
      )
        .shadow()
        .contains('getCurrentTheme')
        .click();
      cy.get(
        'luigi-wc-687474703a2f2f6c6f63616c686f73743a343530302f6578616d706c65732f6d6963726f66726f6e74656e64732f67657443757272656e745468656d6557432e6a73'
      )
        .shadow()
        .contains('light');
    });
  });

  describe('semiCollapsible settings of Left Side Navigation', () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.settings.responsiveNavigation = 'semiCollapsible';
    });

    it('should check if the btn hide/show left side nav visible', () => {
      cy.visitTestApp('/', newConfig);
      cy.get('[data-testid="semiCollapsibleButton"]').should('be.visible');
    });

    it('should collapse the left side nav on btn click', () => {
      cy.visitTestApp('/', newConfig);
      cy.get('[data-testid="semiCollapsibleButton"]').click();
      cy.get('[data-testid="semiCollapsibleLeftNav"]').should('have.class', 'fd-side-nav--condensed');

      cy.reload();
      cy.window().then((win) => {
        win.Luigi.setConfig(newConfig);
      });
      cy.get('[data-testid="semiCollapsibleLeftNav"]').should('have.class', 'fd-side-nav--condensed');
    });

    it('should execute Core API function collapseLeftSideNav() and open the nav', () => {
      cy.visitTestApp('/', newConfig);
      cy.window().then((win) => {
        win.Luigi.ux().collapseLeftSideNav(false);
      });
      cy.reload();
      cy.get('[data-testid="semiCollapsibleLeftNav"]').should('not.exist');
    });
  });

  describe('Fiori3 settings of Left Side Navigation', () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.settings.responsiveNavigation = 'Fiori3';
      cy.visitTestApp('/', newConfig);
      cy.window().then((win) => {
        win.Luigi.configChanged('settings');
      });
    });

    it('should check if the burger btn exist', () => {
      cy.visitTestApp('/', newConfig);
      cy.get('button.lui-burger').should('be.visible');
    });

    it('should collapse the left side nav on burger click', () => {
      cy.visitTestApp('/', newConfig);
      cy.get('button.lui-burger').click();
      cy.get('[data-testid="semiCollapsibleLeftNav"]').should('have.class', 'fd-side-nav--condensed');

      cy.reload();
      cy.window().then((win) => {
        win.Luigi.setConfig(newConfig);
      });
      cy.get('[data-testid="semiCollapsibleLeftNav"]').should('have.class', 'fd-side-nav--condensed');
    });

    it('should execute Core API function collapseLeftSideNav() and open the nav in Fiori3 settings', () => {
      cy.visitTestApp('/', newConfig);
      cy.window().then((win) => {
        win.Luigi.ux().collapseLeftSideNav(false);
      });
      cy.reload();
      cy.window().then((win) => {
        win.Luigi.setConfig(newConfig);
      });
      cy.get('[data-testid="semiCollapsibleLeftNav"]').should('not.have.class', 'fd-side-nav--condensed');
    });
  });

  describe('User settings dialog', () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.tag = 'user-settings-dialog';
      newConfig.userSettings = {
        userSettingGroups: {
          userAccount: {
            label: 'User Account',
            sublabel: 'username',
            icon: 'settings',
            title: 'User Account',
            settings: {
              name: { type: 'string', label: 'Name', isEditable: true },
              email: { type: 'string', label: 'E-Mail', isEditable: false },
              server: { type: 'string', label: 'Server', isEditable: false }
            }
          },
          language: {
            label: 'Language & Region',
            sublabel: 'EN | Time Format: 12h',
            icon: '/assets/github-logo.png',
            title: 'Language & Region',
            settings: {
              language: {
                type: 'enum',
                label: 'Language and Region',
                options: [
                  { value: 'de', label: 'Deutsch' },
                  { value: 'en', label: 'English' },
                  '简体中文',
                  { value: 'fr', label: 'Français' }
                ],
                description:
                  'After you save your settings, the browser will refresh for the new language to take effect.'
              },
              date: { type: 'string', label: 'Date Format' },
              time: {
                type: 'enum',
                label: 'Time Format',
                options: ['12 h', '24 h']
              }
            }
          },
          theming: {
            label: 'Theme',
            sublabel: 'Theme',
            icon: '/assets/github-logo.png',
            title: 'Theming',
            viewUrl: 'http://localhost:4500/examples/microfrontends/customUserSettingsMf.html',
            settings: {
              theme: {
                type: 'enum',
                label: 'Theme',
                options: ['red', 'green'],
                description: 'Choose a theme'
              }
            }
          }
        }
      };
    });

    it('User settings dialog', () => {
      cy.visitTestApp('/', newConfig);
      cy.get('#app[configversion="user-settings-dialog"]');
      cy.window().then((win) => {
        win.Luigi.ux().openUserSettings();
      });
      cy.get('.lui-usersettings-dialog').should('be.visible');

      cy.get('.lui-usersettings-left-nav .lui-us-navlist__item').eq(1).should('contain', 'Language & Region');
      cy.get('.lui-usersettings-left-nav .lui-us-navlist__item').eq(1).click();

      cy.get('[data-testid="lui-us-enum-0"]').eq(0).click();
      cy.get('[data-testid="lui-us-option0_0"]').click();
      cy.get('[data-testid="lui-us-input0"]').should('contain', 'Deutsch');

      cy.get('[data-testid="lui-us-input0"]').click();
      cy.get('[data-testid="lui-us-option0_1"]').click();
      cy.get('[data-testid="lui-us-input0"]').should('contain', 'English');

      cy.get('[data-testid="lui-us-enum-0"]').eq(0).click();
      cy.get('[data-testid="lui-us-enum-0"]').should('be.visible');
      cy.get('[data-testid="lui-us-enum-0"]').eq(0).click();
      cy.get('[data-testid="lui-us-option0_0"]').should('not.be.visible');

      cy.get('[data-testid="lui-us-dismissBtn"]').click();
      cy.get('.lui-usersettings-dialog').should('not.exist');
    });

    it('Check if external mf is loaded in custom user settings editor', () => {
      cy.visitTestApp('/', newConfig);
      cy.get('#app[configversion="user-settings-dialog"]');
      cy.window().then((win) => {
        win.Luigi.ux().openUserSettings();
      });

      cy.get('.lui-usersettings-left-nav .lui-us-navlist__item').eq(2).should('contain', 'Theme');
      cy.get('.lui-usersettings-left-nav .lui-us-navlist__item').eq(2).click();

      cy.get('.iframeUserSettingsCtn iframe').should((ifr) => {
        expect(ifr[0].src).to.equal('http://localhost:4500/examples/microfrontends/customUserSettingsMf.html');
      });
    });
  });

  describe('Bookmarkable micro frontends', () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
    });

    it('Hash routing with showModalPathInUrl enabled and custom modalPathParam and node params', () => {
      newConfig.routing.showModalPathInUrl = true;
      newConfig.routing.modalPathParam = 'mymodal';
      newConfig.routing.useHashRouting = true;
      newConfig.tag = 'bookmarkable-mf-1';

      cy.visitTestApp('/home', newConfig);
      cy.get('#app[configversion="bookmarkable-mf-1"]');
      cy.window().then((win) => {
        win.Luigi.navigation().withParams({ mp: 'one' }).openAsModal('/home/one');
      });

      cy.expectPathToBe('/home?mymodal=' + encodeURIComponent('/home/one?~mp=one'));
    });

    it('Path routing with showModalPathInUrl enabled and custom modalPathParam and node params', () => {
      newConfig.routing.showModalPathInUrl = true;
      newConfig.routing.modalPathParam = 'mymodal';
      newConfig.routing.useHashRouting = false;
      newConfig.tag = 'bookmarkable-mf-2';

      cy.visitTestApp('/home', newConfig);
      cy.get('#app[configversion="bookmarkable-mf-2"]');
      cy.window().then((win) => {
        win.Luigi.navigation().withParams({ mp: 'one' }).openAsModal('/home/one');
      });

      cy.expectPathToBe('/home');
      cy.location().should((location) => {
        expect(location.search).to.eq('?mymodal=' + encodeURIComponent('/home/one?~mp=one'));
      });
    });
  });

  describe('GlobalSearchCentered', () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.globalSearch = {
        searchFieldCentered: true,
        searchProvider: {}
      };
      newConfig.settings = {
        experimental: {
          globalSearchCentered: true
        }
      };

      cy.visitTestApp('/home', newConfig);
    });

    describe('Desktop', () => {
      it('Search on large viewport', () => {
        cy.get('.lui-global-search-btn').should('not.be.visible');
        cy.get('.lui-global-search-cancel-btn').should('not.exist');
        cy.get('.lui-global-search-input').should('be.visible');
      });
    });

    describe('Mobile', () => {
      it('Search on smaller viewport', () => {
        cy.viewport('iphone-6');
        cy.get('.lui-global-search-btn').should('be.visible');
        cy.get('.lui-global-search-cancel-btn').should('not.exist');
        cy.get('.lui-global-search-input').should('not.be.visible');

        cy.get('.lui-global-search-btn').click();

        cy.get('.lui-global-search-btn').should('not.exist');
        cy.get('.lui-global-search-cancel-btn').should('be.visible');
        cy.get('.lui-global-search-input').should('be.visible');

        cy.get('.lui-global-search-cancel-btn').click();

        cy.get('.lui-global-search-btn').should('be.visible');
        cy.get('.lui-global-search-cancel-btn').should('not.exist');
        cy.get('.lui-global-search-input').should('not.be.visible');
      });
    });
  });

  describe('BreadCrumb and NavHeader', () => {
    let newConfig;
    const breadcrumbsConfig = {
      clearBeforeRender: true,
      renderer: (el, items, clickHandler) => {
        el.classList.add('myBreadcrumb');
        let breadcrumbs = document.createElement('ol');
        breadcrumbs.setAttribute('style', 'top: 0;position: absolute;left: 0;');
        items.forEach((item, index) => {
          if (item.label) {
            let itemCmp = document.createElement('li');
            itemCmp.setAttribute('style', 'display:inline; margin: 0 10px;');
            itemCmp.setAttribute('data-testid', `breadcrumb_${item.label}_index${index}`);
            itemCmp.innerHTML = item.label;
            itemCmp._item = item;
            breadcrumbs.appendChild(itemCmp);
          }
        });
        breadcrumbs.addEventListener('click', (event) => {
          clickHandler(event.detail.item._item);
        });
        el.appendChild(breadcrumbs);
        return breadcrumbs;
      }
    };

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.settings = {
        experimental: {
          navHeader: true,
          breadcrumbs: true
        }
      };
      newConfig.tag = 'breadcrumbs';
      newConfig.navigation = {
        breadcrumbs: breadcrumbsConfig,
        nodes: [
          {
            pathSegment: 'home',
            label: 'Home',
            globalNav: true,
            icon: 'home',
            children: [
              {
                pathSegment: 'dyn',
                label: 'dyn',
                children: [
                  {
                    pathSegment: ':someid',
                    navHeader: {
                      label: ':someid',
                      icon: 'sys-help'
                    },
                    children: [
                      {
                        label: '1',
                        pathSegment: '1',
                        viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html'
                      },
                      {
                        label: '2',
                        pathSegment: '2',
                        viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html'
                      },
                      {
                        label: '3',
                        pathSegment: '3',
                        viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html'
                      },
                      {
                        label: '4',
                        pathSegment: '4',
                        viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html'
                      }
                    ]
                  }
                ]
              },
              {
                label: 'static',
                pathSegment: 'static',
                label: 'static',
                viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html'
              },
              {
                pathSegment: 'virtual-tree',
                label: 'VirtualTree',
                viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
                virtualTree: true
              }
            ]
          }
        ]
      };
    });

    it('Breadcrumb container visible with static nodes', localRetries, () => {
      cy.visitTestApp('/home', newConfig);
      cy.get('#app[configversion="breadcrumbs"]');
      cy.expectPathToBe('/home/static');

      cy.get('.lui-breadcrumb-container').should('be.visible');
      cy.get('[data-testid=breadcrumb_Home_index0]').should('be.visible');
      cy.get('[data-testid=breadcrumb_static_index1]').should('be.visible');
    });

    it('Breadcrumbs with dynamic nodes', localRetries, () => {
      cy.visitTestApp('/home/dyn/dynValue', newConfig);
      cy.get('#app[configversion="breadcrumbs"]');
      cy.expectPathToBe('/home/dyn/dynValue/1');
      cy.get('.lui-breadcrumb-container').should('be.visible');
      cy.get('[data-testid=breadcrumb_Home_index0]').should('be.visible');
      cy.get('[data-testid=breadcrumb_dyn_index1]').should('be.visible');
      cy.get('[data-testid=breadcrumb_dynValue_index2]').should('be.visible');
      cy.get('[data-testid=breadcrumb_1_index3]').should('be.visible');
    });

    it('Breadcrumbs with virtual nodes', localRetries, () => {
      cy.visitTestApp('/home/virtual-tree/virtualValue/test', newConfig);
      cy.get('#app[configversion="breadcrumbs"]');
      cy.expectPathToBe('/home/virtual-tree/virtualValue/test');
      cy.get('.lui-breadcrumb-container').should('be.visible');
      cy.get('[data-testid=breadcrumb_Home_index0]').should('be.visible');
      cy.get('[data-testid=breadcrumb_VirtualTree_index1]').should('be.visible');
      cy.get('[data-testid=breadcrumb_virtualValue_index2]').should('be.visible');
      cy.get('[data-testid=breadcrumb_test_index3]').should('be.visible');
    });

    it('dynamic nav header', localRetries, () => {
      cy.visitTestApp('/home/dyn/dynValue', newConfig);
      cy.get('#app[configversion="breadcrumbs"]');
      cy.expectPathToBe('/home/dyn/dynValue/1');
      cy.get('.lui-nav-title .fd-nested-list__title').should('contain', 'dynValue');
    });

    it('static nav header', localRetries, () => {
      newConfig.navigation.nodes[0].children[0].children[0].navHeader.label = 'test';

      cy.visitTestApp('/home/dyn/dynValue/1', newConfig);
      cy.get('#app[configversion="breadcrumbs"]');
      cy.expectPathToBe('/home/dyn/dynValue/1');

      cy.get('.lui-nav-title .fd-nested-list__title').should('contain', 'test');
    });
  });

  describe('Encoded ViewURL Search Params with Decorators', () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.tag = 'encodeViewURL';
      newConfig.settings.theming = {
        defaultTheme: 'light',
        nodeViewURLDecorator: {
          queryStringParameter: {
            keyName: 'sap-theme',
            value: () => {
              return 'green';
            }
          }
        }
      };
      newConfig.navigation.nodes.push({
        pathSegment: 'nondecodeviewurl',
        label: 'NonDecoded ViewUrl',
        viewUrl:
          'http://localhost:4500/examples/microfrontends/customUserSettingsMf.html?someURL=http://some.url/foo/bar'
      });

      newConfig.navigation.nodes.push({
        pathSegment: 'decodeviewurl',
        label: 'Decoded ViewUrl',
        decodeViewUrl: true,
        viewUrl:
          'http://localhost:4500/examples/microfrontends/customUserSettingsMf.html?someURL=http://some.url/foo/bar'
      });
    });

    it('opens navigation node with decodeViewUrl true', () => {
      cy.visitTestApp('/decodeviewurl', newConfig);
      cy.get('#app[configversion="encodeViewURL"]');
      cy.expectPathToBe('/decodeviewurl');

      cy.getIframe().should(
        'have.attr',
        'src',
        'http://localhost:4500/examples/microfrontends/customUserSettingsMf.html?someURL=http://some.url/foo/bar&sap-theme=green'
      );
    });

    it('opens navigation node with decodeViewUrl false', () => {
      cy.visitTestApp('/nondecodeviewurl', newConfig);
      cy.get('#app[configversion="encodeViewURL"]');
      cy.expectPathToBe('/nondecodeviewurl');

      cy.getIframe().should(
        'have.attr',
        'src',
        'http://localhost:4500/examples/microfrontends/customUserSettingsMf.html?someURL=http%3A%2F%2Fsome.url%2Ffoo%2Fbar&sap-theme=green'
      );
    });
  });

  describe('Transfer theme vars to client', () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.tag = 'transferThemeVars';
      newConfig.settings.theming = {
        defaultTheme: 'light',
        variables: 'fiori'
      };
    });

    it('Tranfer var and override it', () => {
      cy.visitTestApp('/home/one', newConfig);
      cy.get('#app[configversion="transferThemeVars"]');

      cy.getIframeBody().then(($body) => {
        cy.wrap($body).contains('ApplyCSS').should('have.css', 'color').and('eq', 'rgb(0, 0, 0)');
        cy.wrap($body).contains('ApplyCSS').should('have.css', 'color').and('not.equal', 'rgb(255, 0, 0)');
        cy.wrap($body).contains('ApplyCSS').click();
        cy.wrap($body).contains('ApplyCSS').should('have.css', 'color').and('not.equal', 'rgb(0, 0, 0)');
        cy.wrap($body).contains('ApplyCSS').should('have.css', 'color').and('eq', 'rgb(255, 0, 0)');
      });
    });
  });

  describe('SAP Horizon', () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.tag = 'sapHorizon';
      (newConfig.settings.responsiveNavigation = 'Fiori3'),
        (newConfig.settings.profileType = 'Fiori3'),
        (newConfig.settings.experimental = {
          profileMenuFiori3: true
        });
      newConfig.navigation.profile = {
        logout: {
          label: 'Sign Out',
          icon: 'sys-cancel'
        },
        staticUserInfoFn: () => {
          return new Promise((resolve) => {
            resolve({
              name: 'Static User',
              initials: 'LU',
              email: 'other.luigi.user@example.com',
              description: 'Luigi Developer'
            });
          });
        }
      };
    });

    it('Initials background color with sap horizon and Fiori3 with profileType Fiori3', () => {
      cy.visitTestApp('/home/one', newConfig);
      cy.get('#app[configversion="sapHorizon"]');
      cy.get('[data-testid="luigi-topnav-profile-initials"] .fd-avatar').then(($el) => {
        const bgColor = getComputedStyle($el[0]).getPropertyValue('background-color').trim();
        expect(bgColor).to.equal('rgb(40, 110, 180)');
      });
      cy.get('link[href="/node_modules/@luigi-project/core/luigi.css"]').then(($link) => {
        if ($link.length) {
          $link.remove();
        }
      });
      cy.document().then((doc) => {
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/node_modules/@luigi-project/core/luigi_horizon.css';
        doc.head.appendChild(link);
      });
      cy.wait(500);

      cy.get('[data-testid="luigi-topnav-profile-initials"] .fd-avatar').then(($el) => {
        const bgColor = getComputedStyle($el[0]).getPropertyValue('background-color').trim();
        expect(bgColor).to.equal('rgb(209, 239, 255)');
      });

      cy.get('[data-testid="luigi-topnav-profile-initials"]').click();
      cy.get('.lui-user-menu-fiori .fd-user-menu__avatar').should('have.class', 'fd-avatar--l');
      cy.get('.lui-user-menu-fiori .fd-user-menu__avatar').then(($el) => {
        const bgColor = getComputedStyle($el[0]).getPropertyValue('background-color').trim();
        expect(bgColor).to.equal('rgb(209, 239, 255)');
      });
    });
  });
});
