import defaultLuigiConfig from '../../configs/default';

describe('JS-TEST-APP', () => {
  const localRetries = {
    retries: {
      runMode: 4,
      openMode: 4
    }
  };

  describe('Navigation', () => {
    describe('Core api navigation test', () => {
      let newConfig;

      beforeEach(() => {
        newConfig = structuredClone(defaultLuigiConfig);
        newConfig.tag = 'js-test-app-core-api-nav-test';
      });

      it('Core API navigate and open and close modal', () => {
        cy.visitTestApp('/', newConfig);
        cy.get('#app[configversion="js-test-app-core-api-nav-test"]');
        cy.window().then((win) => {
          win.Luigi.navigation().navigate('/home/two');
        });
        cy.expectPathToBe('/home/two');

        cy.window().then((win) => {
          win.Luigi.navigation().openAsModal('/settings', {
            title: 'Preserved View',
            size: 'm'
          });
        });

        cy.contains('Preserved View');
        cy.get('body').find('[aria-label="close"]', { timeout: 5000 }).click();
        cy.expectPathToBe('/home/two');
      });

      it('Open modal via core api with "fullscreen"', () => {
        cy.visitTestApp('/', newConfig);
        cy.get('[configversion="js-test-app-core-api-nav-test"]');
        cy.window().then((win) => {
          win.Luigi.navigation().openAsModal('/home/two', { size: 'fullscreen' });
        });
        cy.get('.lui-modal-mf')
          .should('have.class', 'lui-modal-fullscreen')
          .and('have.attr', 'style', 'width:100vw;height:100vh;');
        cy.get('[aria-label="close"]').click();
      });

      it('Open modal via core api with "px"', () => {
        cy.visitTestApp('/', newConfig);
        cy.get('[configversion="js-test-app-core-api-nav-test"]');
        cy.window().then((win) => {
          win.Luigi.navigation().openAsModal('/home/two', { width: '500px', height: '500px' });
        });
        cy.get('.lui-modal-mf').should('have.css', 'width', '500px').and('have.css', 'height', '500px');
        cy.get('[aria-label="close"]').click();
      });

      it('Open modal via core api with "%"', () => {
        cy.visitTestApp('/', newConfig);
        cy.get('[configversion="js-test-app-core-api-nav-test"]');
        cy.window().then((win) => {
          win.Luigi.navigation().openAsModal('/home/two', { width: '20%', height: '40%' });
        });
        cy.get('.lui-modal-mf').should('have.attr', 'style', 'width:20%;height:40%;');
        cy.get('[aria-label="close"]').click();
      });

      it('Open modal via core api with "rem"', localRetries, () => {
        cy.visitTestApp('/', newConfig);
        cy.get('[configversion="js-test-app-core-api-nav-test"]');
        cy.window().then((win) => {
          win.Luigi.navigation().openAsModal('/home/two', { width: '50rem', height: '70rem' });
        });
        cy.get('.lui-modal-mf').should('have.attr', 'style', 'width:50rem;height:70rem;');
        cy.get('[aria-label="close"]').click();
      });

      it('Open modal via core api with "rem" and  "non existent unit"', localRetries, () => {
        cy.visitTestApp('/', newConfig);
        cy.get('[configversion="js-test-app-core-api-nav-test"]');
        cy.window().then((win) => {
          win.Luigi.navigation().openAsModal('/home/two', { width: '34psx', height: '70rm' });
        });
        cy.get('.lui-modal-mf').should('have.attr', 'style', 'width:80%;height:80%;');
        cy.get('[aria-label="close"]').click();
      });

      it('Update modal settings', () => {
        newConfig.routing.showModalPathInUrl = true;
        cy.visitTestApp('/', newConfig);
        cy.get('[configversion="js-test-app-core-api-nav-test"]');
        cy.window().then((win) => {
          win.Luigi.navigation().openAsModal('/home/two', { width: '50rem', height: '70rem' });
        });
        cy.get('.lui-modal-mf').should('have.attr', 'style', 'width:50rem;height:70rem;');
        cy.url()
          .should('include', 'width%22%3A%2250rem')
          .and('include', 'height%22%3A%2270rem')
          .and('not.contain', '/title%22%3A%22test/');
        cy.getIframeBody({}, 0, '.iframeModalCtn').then((result) => {
          cy.wrap(result).contains('updateModalSettings').click();
          cy.url()
            .should('include', 'width%22%3A%2250rem')
            .and('include', 'height%22%3A%2270rem')
            .and('include', 'title%22%3A%22test');
        });
      });
    });

    describe('Normal navigation', () => {
      let newConfig;

      beforeEach(() => {
        newConfig = structuredClone(defaultLuigiConfig);
        newConfig.navigation.nodes[0].viewUrl = null;
        newConfig.tag = 'normal-navigation';
      });

      it('defaultChildNode', () => {
        cy.visitTestApp('/', newConfig);
        cy.get('#app[configversion="normal-navigation"]');
        cy.window().then((win) => {
          win.Luigi.navigation().navigate('/home');
          cy.expectPathToBe('/home/two');
        });
      });

      it('navigateToIntent', () => {
        cy.visitTestApp('/', newConfig);
        cy.get('#app[configversion="normal-navigation"]');
        cy.window().then((win) => {
          win.Luigi.navigation()
            .navigate('/home')
            .then(() => {
              win.Luigi.navigation().navigateToIntent('Sales-setting');
              cy.expectPathToBe('/home/two/#?intent=Sales-setting');
            });
        });
      });

      it('hideShellbar', () => {
        cy.visitTestApp('/', newConfig);
        cy.get('#app[configversion="normal-navigation"]');
        cy.get('.fd-shellbar').should('exist');
        cy.window().then((win) => {
          win.Luigi.getConfig().settings.header.disabled = true;
          win.Luigi.configChanged('settings');
        });
        cy.contains('.fd-shellbar').should('not.exist');
      });
    });

    describe('Tooltext for category button', () => {
      let newConfig;

      beforeEach(() => {
        newConfig = structuredClone(defaultLuigiConfig);
        newConfig.navigation.nodes[0].children[0].category = {
          label: 'Test Category',
          collapsible: true,
          titleExpandButton: 'Expand test category',
          titleCollapseButton: 'Collapse test category'
        };
        newConfig.tag = 'tooltip-test';
      });

      it('Tooltip for expand/collapse button', () => {
        cy.visitTestApp('/', newConfig);
        cy.get('#app[configversion="tooltip-test"]');
        cy.get('.lui-collapsible-item').contains('Test Category');
        cy.get('.lui-collapsible-item button').should('have.attr', 'title', 'Expand test category');
        cy.get('.lui-collapsible-item').contains('Test Category').click();
        cy.get('.lui-collapsible-item button').should('have.attr', 'title', 'Collapse test category');
      });

      it('Tooltip for expand button not defined', () => {
        delete newConfig.navigation.nodes[0].children[0].category.titleExpandButton;
        newConfig.tag = 'tooltip-test-2';
        cy.visitTestApp('/', newConfig);
        cy.get('#app[configversion="tooltip-test-2"]');
        cy.get('.lui-collapsible-item').contains('Test Category');
        cy.get('.lui-collapsible-item button').should('not.have.attr', 'title');
        cy.get('.lui-collapsible-item').contains('Test Category').click();
        cy.get('.lui-collapsible-item button').should('have.attr', 'title', 'Collapse test category');
      });

      it('Tooltip for collapse button not defined', () => {
        delete newConfig.navigation.nodes[0].children[0].category.titleCollapseButton;
        newConfig.tag = 'tooltip-test-3';
        cy.visitTestApp('/', newConfig);
        cy.get('#app[configversion="tooltip-test-3"]');
        cy.get('.lui-collapsible-item').contains('Test Category');
        cy.get('.lui-collapsible-item button').should('have.attr', 'title', 'Expand test category');
        cy.get('.lui-collapsible-item').contains('Test Category').click();
        cy.get('.lui-collapsible-item button').should('not.have.attr', 'title');
      });

      it('Default tooltip for collapse and expand button only applied if it is not configured on category itself', () => {
        newConfig.navigation.defaults = {
          category: {
            titleExpandButton: 'Default expand tooltip',
            titleCollapseButton: 'Default collapse tooltip'
          }
        };
        newConfig.tag = 'tooltip-test-4';
        delete newConfig.navigation.nodes[0].children[0].category.titleCollapseButton;
        cy.visitTestApp('/', newConfig);
        cy.get('#app[configversion="tooltip-test-4"]');
        cy.get('.lui-collapsible-item').contains('Test Category');
        cy.get('.lui-collapsible-item button').should('have.attr', 'title', 'Expand test category');
        cy.get('.lui-collapsible-item').contains('Test Category').click();
        cy.get('.lui-collapsible-item button').should('have.attr', 'title', 'Default collapse tooltip');
      });
    });

    describe('Viewgroup live settings', () => {
      let newConfig;
      let $iframeBody;

      beforeEach(() => {
        newConfig = structuredClone(defaultLuigiConfig);
        newConfig.tag = 'viewgroup-live-settings';
        newConfig.navigation['viewGroupSettings'] = {
          vg1: {},
          vg2: {}
        };
      });

      it('viewgroup live settings on single node', () => {
        console.log('newConfig.navigation.nodes[0]', newConfig.navigation.nodes[0]);
        newConfig.navigation.nodes[0].children.push(
          {
            pathSegment: 'mfe1',
            label: 'MFE 1 {viewGroupData.foo}',
            icon: 'home',
            viewUrl: '/examples/microfrontends/multipurpose.html',
            viewGroup: 'vg1'
          },
          {
            pathSegment: 'mfe2',
            label: 'MFE 2 {viewGroupData.foo}',
            icon: 'home',
            viewUrl: 'mfe.html#2',
            viewGroup: 'vg2'
          },
          {
            pathSegment: 'mfe3',
            label: 'MFE 3 {viewGroupData.bar}',
            icon: 'home',
            viewUrl: 'mfe.html#3',
            viewGroup: 'vg2'
          }
        );
        cy.visitTestApp('/home/mfe1', newConfig);
        cy.get('#app[configversion="viewgroup-live-settings"]');
        cy.get('.fd-app__sidebar').should('not.contain', 'MFE 1 Luigi rocks');
        cy.getIframeBody({}, 0, '.iframeContainer').then((result) => {
          $iframeBody = result;
          cy.wrap($iframeBody).find('#vgDataUpdate').contains('Set view group data').click();
        });

        cy.get('.fd-app__sidebar').contains('MFE 1 Luigi rocks');
      });
    });
  });

  describe('ContextSwitcher', () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.navigation.nodes.push({
        hideFromNav: true,
        pathSegment: 'environments',
        viewUrl: '/examples/microfrontends/multipurpose.html',
        children: [
          {
            pathSegment: ':environmentId',
            viewUrl: '/examples/microfrontends/multipurpose.html'
          }
        ]
      });
      newConfig.navigation.contextSwitcher = {
        defaultLabel: 'Select Environment',
        parentNodePath: '/environments',
        lazyloadOptions: true,
        options: function () {
          return [
            {
              label: 'Environment 1',
              pathValue: 'env1',
              customRendererCategory: 'production'
            },
            {
              label: 'Environment 2',
              pathValue: 'env2',
              customRendererCategory: 'stage'
            }
          ];
        },
        customSelectedOptionRenderer: function (option) {
          if (option.customRendererCategory === 'production') {
            return `<label style='color: rgb(136, 255, 0); font-weight:700'>
                  ${option.label}
                  </label>`;
          } else if (option.customRendererCategory === 'stage') {
            return `<label style='color: rgb(0, 136, 255); font-weight:700'>
                      ${option.label}
                      </label>`;
          }
        }
      };
    });

    it('custom selected option renderer', () => {
      cy.visitTestApp('/', newConfig);

      cy.contains('Select Environment').should('exist').click();
      cy.contains('Environment 1').should('exist').click();
      cy.get('[data-testid=luigi-contextswitcher-button]')
        .find('label')
        .should('have.css', 'color', 'rgb(136, 255, 0)')
        .and('have.css', 'font-weight', '700');

      cy.get('[data-testid=luigi-contextswitcher-button]').should('exist').click();
      cy.contains('Environment 2').should('exist').click();
      cy.get('[data-testid=luigi-contextswitcher-button]')
        .find('label')
        .should('have.css', 'color', 'rgb(0, 136, 255)')
        .and('have.css', 'font-weight', '700');

      // checks if there is only one selected item
      cy.get('#context_menu_middle .is-selected').should('have.length', 1);
    });

    it('using fallbackLabelResolver', () => {
      newConfig.navigation.contextSwitcher.customSelectedOptionRenderer = undefined;
      newConfig.navigation.contextSwitcher.fallbackLabelResolver = (id) => id.toUpperCase();
      newConfig.navigation.contextSwitcher.options = [{ pathValue: 'env1' }, { pathValue: 'env2' }];

      cy.visitTestApp('/', newConfig);

      cy.get('#context_menu_middle .is-selected').should('have.length', 0);

      cy.contains('Select Environment').click();
      cy.contains('ENV1').click(); // fb label resolver used

      // checks if there is only one selected item
      cy.get('#context_menu_middle .is-selected').should('have.length', 1);
    });
  });

  describe('virtualTree with fromVirtualTreeRoot', localRetries, () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.navigation.nodes.push({
        pathSegment: 'virtual',
        label: 'Virtual',
        virtualTree: true,
        viewUrl: '/examples/microfrontends/multipurpose.html#',
        loadingIndicator: {
          enabled: false
        },
        context: {
          content:
            '<button  onClick="LuigiClient.linkManager().fromVirtualTreeRoot().navigate(\'/this/is/a/tree\')">virtual</button>'
        }
      });
    });

    it('navigate', localRetries, () => {
      cy.visitTestApp('/virtual', newConfig);
      let $iframeBody;

      cy.getIframeBody({}, 0, '.iframeContainer').then((result) => {
        $iframeBody = result;
        cy.wrap($iframeBody).find('button').contains('virtual').click();
      });
      cy.expectPathToBe('/virtual/this/is/a/tree');
    });
  });

  describe('Unload and load Luigi', () => {
    let newConfig;

    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      cy.visitTestApp('/home/two', newConfig);
    });

    it('Core API unload', () => {
      let config;
      cy.window().then((win) => {
        config = win.Luigi.getConfig();
        config.navigation.nodes = [
          {
            label: 'Luigi',
            pathSegment: 'luigi',
            viewUrl: '/examples/microfrontends/multipurpose.html'
          }
        ];
      });

      cy.get('.fd-shellbar').should('be.visible');

      cy.window().then((win) => {
        win.Luigi.unload();
      });

      cy.get('.fd-shellbar').should('not.exist');

      cy.window().then((win) => {
        win.Luigi.setConfig(config);
      });

      cy.get('.fd-shellbar').should('be.visible');
    });
  });

  describe('Show-hide of Logout & Login Buttons', () => {
    const loginLink = () => {
      return cy.get('[data-testid="login-btn"]');
    };
    const logoutLink = () => {
      return cy.get('[data-testid="logout-btn"]');
    };

    describe('No Auth', () => {
      let newConfig;

      beforeEach(() => {
        newConfig = structuredClone(defaultLuigiConfig);
        newConfig.auth = undefined;
        newConfig.navigation.profile = {
          logout: {
            label: 'Bye bye',
            icon: 'sys-cancel'
          }
        };
      });

      it('Static profile, and logging out with customLogoutFn', () => {
        cy.visitTestApp('/home/two', newConfig);
        cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
        logoutLink().should('exist');
        loginLink().should('not.exist');

        let profileLogout;
        cy.window().then((win) => {
          const config = win.Luigi.getConfig();
          profileLogout = config.navigation.profile.logout;
          profileLogout.customLogoutFn = () => {
            return true;
          };
          cy.spy(profileLogout, 'customLogoutFn');
          win.Luigi.setConfig(config);
          win.Luigi.configChanged('navigation.profile');
        });

        // Verify profile value
        logoutLink().contains('Bye bye').click();

        // need to wrap 'expect' into some cypress function, else it executes immediately
        cy.window().then((win) => {
          expect(profileLogout.customLogoutFn).to.be.called;
        });
      });
    });

    describe('With Auth', () => {
      let newConfig;

      beforeEach(() => {
        newConfig = structuredClone(defaultLuigiConfig);
        newConfig.auth = {
          use: 'myOAuth2',
          myOAuth2: {
            idpProvider: 'LuigiAuthOAuth2',
            authorizeUrl: '/auth/idpmock/implicit.html',
            logoutUrl: '/auth/idpmock/logout.html',
            post_logout_redirect_uri: '/auth/logout.html',
            authorizeMethod: 'GET',
            oAuthData: {
              client_id: 'egDuozijY5SVr0NSIowUP1dT6RVqHnlp',
              redirect_uri: '/auth/callback.html'
            }
          }
        };
        newConfig.navigation.profile = {
          logout: {
            label: 'Bye bye'
          },
          staticUserInfoFn: () => ({
            name: 'Static User',
            initials: 'LU',
            email: 'other.luigi.user@example.com',
            picture: '/assets/favicon-sap.ico',
            icon: false
          })
        };
      });

      it('Profile, no auto-login, logged out', () => {
        newConfig.auth.disableAutoLogin = true;
        cy.visitTestApp('/', newConfig);

        cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
        logoutLink().should('not.exist');
        loginLink().should('exist');
      });

      it('No Profile, no auto-login, logged out and login', () => {
        newConfig.auth.disableAutoLogin = true;
        newConfig.navigation.profile = undefined;
        cy.visitTestApp('/', newConfig);

        // Logged out
        cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
        logoutLink().should('not.exist');
        loginLink().should('exist');

        // Log in
        loginLink().click();
        cy.login('tets@email.com', 'tets', true, newConfig);

        // // Verify default value
        logoutLink().contains('Sign Out');
      });

      it('Profile, logged in', () => {
        newConfig.navigation.profile = {
          logout: {
            label: 'Bye bye',
            icon: 'sys-cancel'
          }
        };
        newConfig.auth.disableAutoLogin = false;
        cy.visitTestAppLoggedIn('/', newConfig);
        cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
        logoutLink().should('exist');
        loginLink().should('not.exist');

        // Verify profile value
        logoutLink().contains('Bye bye');
      });

      it('No profile, logged in', () => {
        newConfig.navigation.profile = undefined;
        newConfig.auth.disableAutoLogin = false;
        cy.visitTestAppLoggedIn('/', newConfig);

        cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
        logoutLink().should('exist');
        loginLink().should('not.exist');

        // Verify default value
        logoutLink().contains('Sign Out');
      });

      it('Trigger Login and Logout with Core API', () => {
        newConfig.navigation.profile = undefined;
        newConfig.auth.disableAutoLogin = true;
        newConfig.tag = 'loginlogoutcoreapi';
        let cfg = structuredClone(newConfig);
        cy.visitTestApp('/', cfg);

        cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
        loginLink().should('exist');

        cy.window().then((win) => {
          cy.log('Trigger auth().login()');
          win.Luigi.auth().login();
        });

        cy.login('tets@email.com', 'tets', true, cfg);

        cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
        logoutLink().should('exist');
        cfg = structuredClone(newConfig);
        cy.visit('http://localhost:4500/auth/logout.html');
        cfg.auth.myOAuth2.idpProvider = 'LuigiAuthOAuth2';

        cy.visitTestAppLoggedIn('/', cfg);
        cy.get('#app[configversion="loginlogoutcoreapi"]');
        cy.window().then((win) => {
          cy.log('Trigger auth().logout()');
          win.Luigi.auth().logout();
        });
        cy.contains('Login again');
      });

      it('User settings in profile menu with custom label', () => {
        newConfig.settings = {
          userSettings: {
            userSettingsProfileMenuEntry: {
              label: 'My UserSettings',
              icon: 'settings'
            }
          }
        };
        cy.visitTestAppLoggedIn('/', newConfig);
        cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
        cy.get('[data-testid="settings-link"]').should('exist');
        cy.get('[data-testid="settings-link"]').contains('My UserSettings');
      });

      it('User settings in profile menu with default label', () => {
        newConfig.settings = {
          userSettings: {}
        };
        cy.visitTestAppLoggedIn('/', newConfig);
        cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
        cy.get('[data-testid="settings-link"]').should('exist');
        cy.get('[data-testid="settings-link"]').contains('Settings');
      });

      it('User settings not in the profile menu, if not configured', () => {
        newConfig.navigation.profile = {
          logout: {
            label: 'Bye bye',
            icon: 'sys-cancel'
          }
        };
        newConfig.auth.disableAutoLogin = false;
        cy.visitTestAppLoggedIn('/', newConfig);

        cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
        logoutLink().should('exist');
        cy.get('[data-testid="settings-link"]').should('not.exist');
      });
    });

    describe('Vega profile menu with grouped items', () => {
      let newConfig;

      beforeEach(() => {
        newConfig = structuredClone(defaultLuigiConfig);
        newConfig.auth = undefined;
        newConfig.settings.profileType = 'vega';
        newConfig.navigation.profile = {
          logout: {
            label: 'Sign Out',
            icon: 'log'
          },
          staticUserInfoFn: () => ({
            name: 'Test User',
            initials: 'TU',
            email: 'test@example.com'
          }),
          items: [
            {
              label: 'Account Settings',
              icon: 'account',
              testId: 'profile-group-account',
              children: [
                { label: 'Profile', icon: 'person-placeholder', link: '/home/one', testId: 'profile-child-profile' },
                { label: 'Privacy', icon: 'locked', link: '/home/two', testId: 'profile-child-privacy' }
              ]
            },
            { label: 'About', icon: 'hint', link: '/home/one', testId: 'profile-flat-about' }
          ]
        };
      });

      it('Should render group items with submenu arrow', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('[data-testid="luigi-topnav-profile-initials"]').click();
        cy.get('[data-testid="luigi-topnav-profile-username"]').should('be.visible');
        cy.get('[data-testid="profile-group-account"]').should('exist');
        cy.get('[data-testid="profile-group-account"] .fd-menu__addon-after--submenu').should('exist');
      });

      it('Should render flat items without submenu arrow', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('[data-testid="luigi-topnav-profile-initials"]').click();
        cy.get('[data-testid="profile-flat-about"]').should('exist');
        cy.get('[data-testid="profile-flat-about"] .fd-menu__addon-after--submenu').should('not.exist');
      });

      it('Should expand group on click and show children', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('[data-testid="luigi-topnav-profile-initials"]').click();
        cy.get('[data-testid="profile-group-account"] .fd-menu__link.has-child').should('be.visible').click();
        cy.get('[data-testid="profile-child-profile"]').should('exist');
        cy.get('[data-testid="profile-child-privacy"]').should('exist');
      });

      it('Should collapse group on second click', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('[data-testid="luigi-topnav-profile-initials"]').click();
        cy.get('[data-testid="profile-group-account"] .fd-menu__link.has-child').should('be.visible').click();
        cy.get('[data-testid="profile-child-profile"]').should('be.visible');
        cy.get('[data-testid="profile-group-account"] .fd-menu__link.has-child').should('be.visible').click();
        cy.get('[data-testid="profile-child-profile"]').should('not.exist');
      });

      it('Should navigate when clicking a child item', () => {
        cy.visitTestApp('/home/two', newConfig);
        cy.get('[data-testid="luigi-topnav-profile-initials"]').click();
        cy.get('[data-testid="profile-group-account"] .fd-menu__link.has-child').should('be.visible').click();
        cy.get('[data-testid="profile-child-profile"]').click();
        cy.expectPathToBe('/home/one');
      });

      it('Should close submenu when clicking elsewhere in the menu', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('[data-testid="luigi-topnav-profile-initials"]').click();
        cy.get('[data-testid="profile-group-account"] .fd-menu__link.has-child').should('be.visible').click();
        cy.get('[data-testid="profile-child-profile"]').should('exist');
        cy.get('.fd-user-menu__header').click();
        cy.get('[data-testid="profile-child-profile"]').should('not.exist');
      });

      it('Should reset submenu state when profile menu is reopened', () => {
        cy.visitTestApp('/home/one', newConfig);
        cy.get('[data-testid="luigi-topnav-profile-initials"]').click();
        cy.get('[data-testid="profile-group-account"] .fd-menu__link.has-child').should('be.visible').click();
        cy.get('[data-testid="profile-child-profile"]').should('exist');
        // Close profile menu
        cy.get('[data-testid="luigi-topnav-profile-initials"]').click();
        // Reopen
        cy.get('[data-testid="luigi-topnav-profile-initials"]').click();
        cy.get('[data-testid="profile-child-profile"]').should('not.exist');
      });
    });
  });

  describe('First topNav node has no viewURL and empty children', () => {
    let newConfig;
    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.navigation.nodes.unshift({
        pathSegment: 'firstnode',
        label: 'First Node',
        children: []
      });
    });
    it('TopNav nodes should be visible either first node has no view', () => {
      cy.visitTestAppLoggedIn('/', newConfig);
      cy.expectPathToBe('/firstnode/');
      cy.get('.fd-app__sidebar .fd-nested-list').children().should('have.length', 0);
      cy.get('.fd-shellbar').contains('First Node');
      cy.get('.fd-shellbar').contains('Home').click();
      cy.expectPathToBe('/home');
      cy.get('.fd-app__sidebar .fd-nested-list').children().should('have.length', 2);
      cy.get('.fd-app__sidebar').contains('Section one');
    });
  });
  describe('getCurrentRoute', () => {
    let newConfig;
    beforeEach(() => {
      newConfig = structuredClone(defaultLuigiConfig);
      newConfig.navigation.nodes[0].navigationContext = 'home';
      newConfig.navigation.nodes[0].children.push({
        pathSegment: 'multipurpose',
        label: 'Multipurpose',
        viewUrl: '/examples/microfrontends/multipurpose.html',
        children: [
          {
            pathSegment: 'wc',
            label: 'WC',
            viewUrl: '/examples/microfrontends/helloWorldWC.js',
            webcomponent: true
          }
        ]
      });
    });
    it('getCurrentRoute from closestContext', () => {
      cy.visitTestAppLoggedIn('/home/multipurpose/wc', newConfig);
      cy.expectPathToBe('/home/multipurpose/wc');
      cy.get(
        'luigi-wc-687474703a2f2f6c6f63616c686f73743a343530302f6578616d706c65732f6d6963726f66726f6e74656e64732f68656c6c6f576f726c6457432e6a73'
      )
        .shadow()
        .contains('getCurrentRouteFromClosestContext')
        .click();
      cy.get(
        'luigi-wc-687474703a2f2f6c6f63616c686f73743a343530302f6578616d706c65732f6d6963726f66726f6e74656e64732f68656c6c6f576f726c6457432e6a73'
      )
        .shadow()
        .contains('/multipurpose/wc');
    });
    it('getCurrentRoute from context', () => {
      cy.visitTestAppLoggedIn('/home/multipurpose/wc', newConfig);
      cy.expectPathToBe('/home/multipurpose/wc');
      cy.get(
        'luigi-wc-687474703a2f2f6c6f63616c686f73743a343530302f6578616d706c65732f6d6963726f66726f6e74656e64732f68656c6c6f576f726c6457432e6a73'
      )
        .shadow()
        .contains('getCurrentRouteFromContext')
        .click();
      cy.get(
        'luigi-wc-687474703a2f2f6c6f63616c686f73743a343530302f6578616d706c65732f6d6963726f66726f6e74656e64732f68656c6c6f576f726c6457432e6a73'
      )
        .shadow()
        .contains('/multipurpose/wc');
    });
    it('getCurrentRoute from parent', () => {
      cy.visitTestAppLoggedIn('/home/multipurpose/wc', newConfig);
      cy.expectPathToBe('/home/multipurpose/wc');
      cy.get(
        'luigi-wc-687474703a2f2f6c6f63616c686f73743a343530302f6578616d706c65732f6d6963726f66726f6e74656e64732f68656c6c6f576f726c6457432e6a73'
      )
        .shadow()
        .contains('getCurrentRouteFromParent')
        .click();
      cy.get(
        'luigi-wc-687474703a2f2f6c6f63616c686f73743a343530302f6578616d706c65732f6d6963726f66726f6e74656e64732f68656c6c6f576f726c6457432e6a73'
      )
        .shadow()
        .contains('/wc');
    });
    it('getCurrentRoute from virtualTreeRoot', () => {
      newConfig.navigation.nodes[0].children.push({
        pathSegment: 'multipurpose2',
        label: 'Multipurpose2',
        viewUrl: '/examples/microfrontends/helloWorldWC.js#',
        webcomponent: true,
        virtualTree: true
      });
      cy.visitTestAppLoggedIn('/home/multipurpose2/wc/test', newConfig);
      cy.expectPathToBe('/home/multipurpose2/wc/test');
      cy.get(
        'luigi-wc-687474703a2f2f6c6f63616c686f73743a343530302f6578616d706c65732f6d6963726f66726f6e74656e64732f68656c6c6f576f726c6457432e6a73232f3a7669727475616c5365676d656e745f312f3a7669727475616c5365676d656e745f32'
      )
        .shadow()
        .contains('getCurrentRouteFromVirtualTree')
        .click();
      cy.get(
        'luigi-wc-687474703a2f2f6c6f63616c686f73743a343530302f6578616d706c65732f6d6963726f66726f6e74656e64732f68656c6c6f576f726c6457432e6a73232f3a7669727475616c5365676d656e745f312f3a7669727475616c5365676d656e745f32'
      )
        .shadow()
        .contains('/wc/test');
    });
  });
});
