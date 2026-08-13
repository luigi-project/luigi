let defaultConfig = `

Luigi.setConfig({
    navigation: {
            profile: {
                logout: {
                    label: "End session",
                    icon: "sys-cancel",
                },
            },
            validWebcomponentUrls:['.*?'],
            nodes: [{ 
                pathSegment: 'home', 
                label: 'h', 
                hideFromNav: true, 
                children: [{ 
                    pathSegment: 'overview', 
                    label: 'Overview', 
                    icon: 'home',
                    viewUrl: '/examples/microfrontends/multipurpose.html',
                    context: {
                        title: 'Welcome to Luigi Fiddle!',
                        content: 'Click on "Modify Config" at the bottom right and play around with your Luigi configuration'
                    }
                },{ 
                    pathSegment: 'empty', 
                    label: 'Empty Page', 
                    category: {
                        label: 'Fundamental Demo Pages',
                        icon: 'dimension',
                        collapsible: true
                    },
                    loadingIndicator: {
                        enabled: false
                    },
                    viewUrl: '/examples/microfrontends/fundamental/empty-demo-page.html'
                },{ 
                    pathSegment: 'table', 
                    label: 'Table', 
                    category: 'Fundamental Demo Pages',
                    loadingIndicator: {
                        enabled: false
                    },
                    viewUrl: '/examples/microfrontends/fundamental/table-demo-page.html'
                },{ 
                    pathSegment: 'tree', 
                    label: 'Tree', 
                    category: 'Fundamental Demo Pages',
                    loadingIndicator: {
                        enabled: false
                    },
                    viewUrl: '/examples/microfrontends/fundamental/tree-demo-page.html'
                },{ 
                    pathSegment: 'ui5qs', 
                    label: 'Quickstart', 
                    category: {
                        label: 'UI5 Demo Pages',
                        icon: 'sap-ui5',
                        collapsible: true
                    },
                    viewUrl: '/examples/microfrontends/ui5qs/'
                },{ 
                    pathSegment: 'ui5sc', 
                    label: 'Shopping Cart', 
                    category:  'UI5 Demo Pages',
                    hideSideNav: true,
                    loadingIndicator: {
                        enabled: false
                    },
                    viewUrl: 'https://sdk.openui5.org/test-resources/sap/m/demokit/cart/webapp/index.html'
                },{ 
                    pathSegment: 'wc1', 
                    label: 'WC Editable List', 
                    loadingIndicator: {
                        enabled: false
                    },
                    category: {
                        label: 'Web Component',
                        icon: 'cloud',
                        collapsible: true
                    },
                    viewUrl: '/wc/list.js',
                    webcomponent: true,
                    openNodeInModal: false
                },{ 
                    pathSegment: 'wc2', 
                    label: 'WC Luigi Client', 
                    category:  'Web Component',
                    loadingIndicator: {
                        enabled: false
                    },
                    viewUrl: '/wc/luigiExampleWC.js',
                    webcomponent: true,
                    openNodeInModal: false
                },
                { 
                    pathSegment: 'wc3', 
                    label: 'WC UI5 Web Components', 
                    category:  'Web Component',
                    loadingIndicator: {
                        enabled: false
                    },
                    viewUrl: '/wc/ui5/ui5example.js',
                    webcomponent: true,
                    openNodeInModal: false
                },{
                    pathSegment: 'wc4',
                    label: 'WC Compound Example',
                    category:  'Web Component',
                    viewUrl: '/examples/microfrontends/compound/nested-wc.js',
                    webcomponent: true,
                    openNodeInModal: false,
                        compound: {
                          children: [
                            {
                              viewUrl: '/examples/microfrontends/compound/w1.js',
                              layoutConfig: {
                                slot: "slot-1"
                              }
                            },
                            {
                              viewUrl: '/examples/microfrontends/compound/w2.js',
                              layoutConfig: {
                                slot: "slot-2"
                              }
                            }
                          ]
                        }
                  }
                ] 
            },{ 
                pathSegment: 'foo', 
                label: 'Some Action',
                icon: 'favorite-list',
                viewUrl: '/examples/microfrontends/multipurpose.html',
                hideSideNav: true,
                context: {
                    title: 'Left navigation hidden',
                    content: 'for pages needing more space or wanting to handle navigation internally'  
                }
            },{ 
                pathSegment: 'help', 
                label: 'Help',
                icon: 'sys-help',
                viewUrl: '/examples/microfrontends/multipurpose.html',
                context: {
                    title: 'Help Section',
                    content: 'Find some useful links on the left'  
                },
                children: [{
                    label: 'Back',
                    link: '/',
                    icon: 'nav-back'
                },{
                    label: 'Luigi Github Page',
                    externalLink : { 
                        url: 'https://github.com/luigi-project/luigi'
                    }
                },{
                    label: 'Fundamental Library',
                    externalLink : { 
                        url: 'https://sap.github.io/fundamental-styles'
                    }
                },{
                    label: 'Fundamental Icons',
                    externalLink : { 
                        url: 'https://sap.github.io/fundamental-styles/components/icon.html'
                    }
                }]
            }],
            productSwitcher: {
                items: [{
                    icon: 'https://raw.githubusercontent.com/luigi-project/luigi/main/website/landingpage/public/assets/img/logos/sap.svg',
                    label: 'SAP homepage',
                    externalLink: {
                      url: 'https://www.sap.com',
                      sameWindow: false
                    }
                },{
                    icon: 'https://svelte.technology/favicon.ico',
                    label: 'Svelte',
                    externalLink: {
                      url: 'https://svelte.technology',
                      sameWindow: false
                    }
                }]
            } 
        }, 
        
        // uncomment if you want to use our mock oidc idp
        /**
        auth: {
            // We have registered the following provider at the window object:
            // OAuth2 Implicit Grant: window.LuigiAuthOAuth2 - Docs: https://docs.luigi-project.io/docs/authorization-configuration?section=oauth2-implicit-grant-configuration
            // OIDC Implicit Grant: window.LuigiAuthOIDC - Docs: https://docs.luigi-project.io/docs/authorization-configuration/?section=openid-connect-configuration
 
            use: 'myOAuth2',
            myOAuth2: {
                idpProvider: window.LuigiAuthOAuth2,
                authorizeUrl: '/auth/idpmock/implicit.html',
                logoutUrl: '/auth/idpmock/logout.html',
                post_logout_redirect_uri: '/auth/logout.html',
                authorizeMethod: 'GET',
                oAuthData: {
                  client_id: 'egDuozijY5SVr0NSIowUP1dT6RVqHnlp',
                  redirect_uri: '/auth/callback.html'
                }
            }
        },
        */
        routing: { 
            useHashRouting: true 
        }, 
        lifecycleHooks: {
            luigiAfterInit: () => {
                console.log('Luigi initialized.');
            }
        },
        settings: { 
            responsiveNavigation: 'semiCollapsible',
            header: { 
                logo: 'img/luigi.svg', 
                title: 'Luigi Fiddle'
            },
            burgerTooltip: {
                navExpanded: 'Collapse navigation',
                navCollapsed: 'Expand navigation'
            },
            theming: {
                useFioriScrollbars: true,
                themes:
                  [
                    { id: 'sap_fiori_3', name: 'Quartz light' },
                    { id: 'sap_fiori_3_dark', name: 'Quartz dark' },
                    { id: 'sap_fiori_3_hcw', name: 'High Contrast White' },
                    { id: 'sap_fiori_3_hcb', name: 'High Contrast Black' },
                    { id: 'sap_horizon', name: 'Morning Horizon' },
                    { id: 'sap_horizon_dark', name: 'Evening Horizon' }
                  ],
                defaultTheme: 'sap_horizon',
                nodeViewURLDecorator: {
                  queryStringParameter: {
                    keyName: 'sap-theme'
                    // // optional
                    // value: themeId => {
                    //   return themeId;
                    // }
                  }
                }
            }
        },
        userSettings: {
            userSettingGroups: {
                theme: {
                    label: 'Theming',
                    title: 'Theming',
                    icon: 'lightbulb',
                    settings: {
                        theme: {
                            type: 'enum',
                            label: 'Theming',
                            options: [
                                { value: 'sap_fiori_3', label: 'Quartz light' },
                                { value: 'sap_fiori_3_dark', label: 'Quartz dark' },
                                { value: 'sap_fiori_3_hcw', label: 'High Contrast White' },
                                { value: 'sap_fiori_3_hcb', label: 'High Contrast Black' },
                                { value: 'sap_horizon', label: 'Morning Horizon' },
                                { value: 'sap_horizon_dark', label: 'Evening Horizon' }
                            ]
                        }
                    }
                }
            },
            storeUserSettings: (obj, previous) => {
                return new Promise((resolve, reject) => {
                    if (JSON.stringify(obj) !== JSON.stringify(previous)) {
                        let theme = obj.theme.theme;
                        sessionStorage.setItem('myUserSettings', JSON.stringify(obj));
                        setTheme(theme);
                        Luigi.theming().setCurrentTheme(theme);
                        Luigi.configChanged();
                        resolve();
                    }
                });
            },
            readUserSettings: () => {
                return new Promise((resolve, reject) => {
                    try {
                        if (sessionStorage.getItem('myUserSettings')) {
                            let theme = JSON.parse(sessionStorage.getItem('myUserSettings')).theme.theme;
                            if (theme !== Luigi.theming().getCurrentTheme()) {
                               setTheme(theme);
                               Luigi.theming().setCurrentTheme(theme);
                               Luigi.configChanged();
                            }
                        }
                        resolve(JSON.parse(sessionStorage.getItem('myUserSettings')));
                    }catch {
                        reject({ closeDialog: true, message: 'some error' });
                    }
                })
            }
        }
    });
    function setTheme(theme){
        const themeUrl = 'https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.1.48/content/Base/baseLib/' + theme + '/css_variables.css';
        const themeTag = document.querySelector('#_theme');
        if (themeTag) {
            document.head.removeChild(themeTag);
        }
    
        const link = document.createElement('link');
        link.id = '_theme';
        link.href = themeUrl;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }    
`;
export default defaultConfig;
