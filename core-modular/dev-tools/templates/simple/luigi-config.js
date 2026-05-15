window.onload = () => {
  window.Luigi.setConfig({
    navigation: {
      defaults: {
        runTimeErrorHandler: {
          errorFn: (obj, node) => {
            console.log('runTimeErrorHandler - default:');
            console.log(obj?.message);
            return { obj, node };
          }
        }
      },
      contextSwitcher: {
        defaultLabel: 'Select Environment',
        parentNodePath: '/environments',
        lazyloadOptions: true,
        options: () =>
          [...Array(10).keys()]
            .filter((n) => n !== 0)
            .map((n) => ({
              label: 'Environment ' + n,
              pathValue: 'env' + n
            })),
        actions: [
          {
            label: '+ New Environment (top)',
            link: '/create-environment'
          },
          {
            label: '+ New Environment (bottom)',
            link: '/create-environment',
            position: 'bottom',
            clickHandler: (node) => {
              return true; // route change will be done using link value (if defined)
              // return false // route change will not be done even if link attribute is defined
            }
          },
          {
            label: '+ New Project',
            link: '/projects',
            position: 'bottom',
            clickHandler: (node) => {
              Luigi.ux().showAlert({
                text: `Project created.`,
                type: 'info',
                closeAfter: 3000
              });
              return true;
            }
          }
        ],
        fallbackLabelResolver: (id) => (id ? id.replace(/\b\w/g, (l) => l.toUpperCase()) : 'Environment')
      },
      breadcrumbs: {
        clearBeforeRender: true, // if set to true, the containerElement will be cleared first before being rendered
        pendingItemLabel: 'not loaded yet', // string used as fallback if node label is not yet resolved
        omitRoot: false, // if set to true, the root node in breadcrumb hierarchy is omitted
        autoHide: false, // hide breadcrumbs when navigating to root node
        renderer: (containerElement, nodeItems, clickHandler) => {
          const ui5breadcrumbs = document.createElement('ui5-breadcrumbs');

          nodeItems.forEach((item) => {
            if (item.label) {
              const itemCmp = document.createElement('ui5-breadcrumbs-item');

              itemCmp.textContent = `${item.label}`;
              itemCmp._item = item;
              ui5breadcrumbs.appendChild(itemCmp);
            }
          });

          ui5breadcrumbs.addEventListener('item-click', (event) => {
            event.preventDefault();
            clickHandler(event.detail.item._item);
          });

          containerElement.appendChild(ui5breadcrumbs);

          return ui5breadcrumbs;
        }
      },
      appSwitcher: {
        showMainAppEntry: true,
        items: [
          {
            title: 'Overview',
            subTitle: 'overview',
            link: '/home'
          },
          {
            title: 'experimental',
            link: '/experimental',
            subTitle: '/parent/projects',
            selectionConditions: {
              route: '/parent/projects',
              contextCriteria: [
                {
                  key: 'somekey',
                  value: 'somevalue'
                }
              ]
            }
          },
          {
            title: 'experimental2',
            link: '/experimental/exp2',
            subTitle: 'experimental2'
          }
        ],
        itemRenderer_: (item, slot, appSwitcherApiObj) => {
          let a = document.createElement('a');
          a.setAttribute('style', 'background-color: red; color:green;');
          console.log('Hello from itemRenderer');
          // addEventListener does not work due to limitations of ui5
          a.setAttribute('onclick', `Luigi.navigation().navigate('${item.link}')`);
          let spanText = document.createElement('span');
          spanText.innerText = item.title;
          a.appendChild(spanText);
          slot.appendChild(a);
        }
      },
      nodes: [
        {
          pathSegment: '404',
          label: '404',
          viewUrl: '/404.html',
          anonymousAccess: true,
          loadingIndicator: { enabled: false },
          hideFromNav: true
        },
        {
          pathSegment: 'home',
          icon: 'home',
          showBreadcrumbs: false,
          viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
          anonymousAccess: 'exclusive',
          context: {
            title: 'You are not signed in'
          },
          hideSideNav: true,
          hideFromNav: true
        },
        {
          pathSegment: 'home2',
          icon: 'home',
          showBreadcrumbs: false,
          viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
          children: [
            {
              pathSegment: 'c1',
              label: 'MFE1',
              icon: 'group',
              viewUrl: '/microfrontend.html#child1',
              userSettingsGroup: 'mfeOne',
              viewGroup: 'vg1',
              clientPermissions: {
                changeCurrentLocale: true
              },
              children: [
                {
                  pathSegment: ':dynamic',
                  label: 'doesntmatter',
                  viewUrl: '/microfrontend.html#dyn',
                  viewGroup: 'vg1',
                  children: [
                    {
                      pathSegment: '1',
                      label: 'dynchild',
                      viewUrl: '/microfrontend.html#dynchild',
                      viewGroup: 'vg1'
                    }
                  ]
                }
              ]
            },
            {
              pathSegment: 'c2',
              label: 'MFE2',
              icon: 'calendar',
              viewUrl: '/microfrontend.html#child2',
              userSettingsGroup: 'mfeTwo',
              viewGroup: 'vg1'
            },
            {
              pathSegment: 'c3',
              label: 'MFE3',
              icon: 'group',
              viewUrl: '/microfrontend.html#child3',
              category: {
                id: 'cat',
                label: 'Cat',
                icon: 'group'
              },
              runTimeErrorHandler: {
                errorFn: (obj, node) => {
                  console.log('runTimeErrorHandler - node:');
                  console.log(obj?.message);
                  return { obj, node };
                }
              }
            },
            {
              pathSegment: 'c4',
              label: 'MFE4',
              icon: 'calendar',
              viewUrl: '/microfrontend.html#child4',
              category: 'cat',
              children: [
                {
                  pathSegment: 'detail',
                  label: 'Detail',
                  viewUrl: 'http://localhost:4400/microfrontend.html#detail',
                  icon: 'product',
                  showBreadcrumbs: true,
                  titleResolver: {
                    prerenderFallback: true,
                    fallbackTitle: 'Loading... fallbacktitle',
                    request: {
                      method: 'GET',
                      url: 'http://localhost:4400/mock/product.json'
                    },
                    titlePropertyChain: 'data.product.name',
                    iconPropertyChain: 'data.product.icon',
                    titleDecorator: 'Product: %s'
                  }
                },
                {
                  pathSegment: 'info',
                  label: 'Info',
                  viewUrl: 'http://localhost:4400/microfrontend.html#info',
                  icon: 'hint',
                  showBreadcrumbs: true,
                  titleResolver: {
                    request: {
                      method: 'GET',
                      url: 'http://localhost:4400/mock/product.json'
                    },
                    titlePropertyChain: 'data.product.name'
                  }
                }
              ]
            },
            {
              pathSegment: 'c3s',
              label: 'MFE3',
              icon: 'group',
              viewUrl: '/microfrontend.html#child3s',
              category: {
                id: 'cat::sub',
                label: 'SubCat',
                icon: 'group'
              }
            }
          ]
        },
        {
          hideFromNav: true,
          pathSegment: 'projects',
          showBreadcrumbs: false,
          viewUrl: '/microfrontend.html#/projects',
          context: {
            label: 'Project List'
          }
        },
        {
          hideFromNav: true,
          pathSegment: 'create-environment',
          showBreadcrumbs: false,
          viewUrl: '/microfrontend.html#/create/environment',
          context: {
            label: 'Create Environment'
          }
        },
        {
          hideFromNav: true,
          pathSegment: 'environments',
          showBreadcrumbs: false,
          viewUrl: '/microfrontend.html#/environments',
          children: [
            {
              pathSegment: ':environmentId',
              viewUrl: '/microfrontend.html#/environments/:environmentId',
              children: [
                {
                  label: 'Overview',
                  icon: 'group',
                  pathSegment: 'overview',
                  viewUrl: '/microfrontend.html#/environments/:environmentId/overview'
                },
                {
                  label: 'Settings',
                  icon: 'group',
                  pathSegment: 'settings',
                  viewUrl: '/microfrontend.html#/environments/:environmentId/settings'
                }
              ]
            }
          ]
        },
        {
          pathSegment: 'help',
          icon: 'sys-help',
          viewUrl: '/microfrontend.html#help',
          anonymousAccess: true,
          hideSideNav: true
        },
        {
          category: { id: 'cat', label: 'notification', icon: 'notification' },
          pathSegment: 'errors',
          label: 'Errors',
          icon: 'error',
          viewUrl: '/microfrontend.html#errors'
        },
        {
          category: 'cat',
          label: 'Warnings',
          pathSegment: 'warnings',
          icon: 'warning',
          viewUrl: '/microfrontend.html#warnings'
        },
        {
          category: 'cat',
          label: 'Success',
          pathSegment: 'success',
          icon: 'message-success',
          viewUrl: '/microfrontend.html#errors'
        },
        {
          category: { id: 'cat2', label: 'cat2', icon: 'record' },
          pathSegment: 'cat2',
          label: 'Cat2',
          icon: 'people-connected',
          viewUrl: '/microfrontend.html#cat2'
        },
        {
          pathSegment: 'notifications',
          icon: 'bell',
          viewUrl: '/microfrontend.html',
          badgeCounter: {
            label: 'Number of projects',
            count: () => {
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve(5);
                }, 1000);
              });
            }
          },
          children: [
            {
              pathSegment: 'child1',
              label: 'Child 1',
              viewUrl: '/microfrontend.html#child1',
              icon: 'group'
            },
            {
              pathSegment: 'child2',
              label: 'Child 2',
              viewUrl: '/microfrontend.html#child2',
              icon: 'calendar'
            }
          ]
        },
        {
          pathSegment: 'parent',
          label: 'parent',
          viewUrl: '/microfrontend.html#parent',
          hideFromNav: true,
          hideSideNav: true,
          children: [
            {
              pathSegment: 'projects',
              label: 'projects',

              viewUrl: '/microfrontend.html',
              context: {
                title: 'projects',
                content: 'Click on "Modify Config" at the bottom right and play around with your Luigi configuration',
                somekey: 'somevalue'
              }
            }
          ]
        },
        {
          pathSegment: 'experimental',
          label: 'experimental',
          viewUrl: '/microfrontend.html',
          hideFromNav: true,
          context: {
            title: 'experimental',
            content: 'Click on "Modify Config" at the bottom right and play around with your Luigi configuration'
          },
          children: [
            {
              pathSegment: 'exp1',
              label: 'Exp1',
              icon: 'home',
              viewUrl: '/microfrontend.html',
              context: {
                title: 'exp1',
                content: 'Click on "Modify Config" at the bottom right and play around with your Luigi configuration'
              }
            },
            {
              pathSegment: 'exp2',
              label: 'exp2',
              icon: 'home',
              viewUrl: '/microfrontend.html',
              context: {
                title: 'exp2',
                content: 'Click on "Modify Config" at the bottom right and play around with your Luigi configuration'
              }
            },
            {
              pathSegment: 'exp3',
              label: 'exp3',
              icon: 'home',
              viewUrl: '/microfrontend.html',
              context: {
                title: 'exp3',
                content: 'Click on "Modify Config" at the bottom right and play around with your Luigi configuration'
              }
            }
          ]
        }
      ],
      profile: {
        items: [
          {
            label: 'Luigi in Github',
            externalLink: {
              url: 'https://github.com/luigi-project/luigi',
              sameWindow: false
            }
          }
        ]
        // staticUserInfoFn: () => {
        //   return new Promise((resolve) => {
        //     resolve({
        //       name: 'Static User',
        //       initials: 'LU',
        //       email: 'other.luigi.user@example.com',
        //       description: 'Luigi Developer',
        //       picture: 'https://ui5.github.io/webcomponents/images/avatars/man_avatar_3.png'
        //     });
        //   });
        // }
      }
    },
    routing: {
      pageNotFoundHandler: function (notFoundPath, isAnyPathMatched) {
        return {
          redirectTo: '/404',
          keepURL: false,
          ignoreLuigiErrorHandling: false
        };
      },
      useHashRouting: true
      //showModalPathInUrl: true
    },
    settings: {
      responsiveNavigation: 'Fiori3',
      header: {
        title: 'Luigi Headless POC',
        subTitle: 'luigi headless poc',
        logo: 'https://fiddle.luigi-project.io/img/luigi.svg'
      },
      profileType: 'vega',
      customTranslationImplementation: () => {
        return {
          getTranslation: (key, interpolations, locale) => {
            return '*' + key + '* ' + (locale || Luigi.i18n().getCurrentLocale());
          }
        };
      }
    },
    userSettings: {
      userSettingsProfileMenuEntry: {
        label: 'My Settings',
        icon: 'settings'
      },
      userSettingsDialog: {
        dialogHeader: 'My UserSettings',
        saveBtn: 'Save',
        dismissBtn: 'Cancel'
      },
      userSettingGroups: {
        mfeOne: {
          label: 'Privacy One',
          title: 'Privacy',
          icon: 'private',
          iconClassAttribute: 'SAP-icon-iconClassAttribute-Test',
          settings: {
            policy: {
              type: 'string',
              label: 'Privacy One policy has not been defined.',
              placeholder: '...'
            },
            time: {
              type: 'enum',
              style: 'button',
              label: 'Time Format',
              options: ['12 h', '24 h']
            }
          }
        },
        mfeTwo: {
          label: 'Privacy Two',
          title: 'Privacy',
          icon: 'private',
          iconClassAttribute: 'SAP-icon-iconClassAttribute-Test',
          settings: {
            policy: {
              type: 'string',
              label: 'Privacy Two policy has not been defined.',
              placeholder: '...'
            },
            time: {
              type: 'enum',
              style: 'button',
              label: 'Time Format',
              options: ['12 h', '24 h']
            }
          }
        }
      }
    },

    lifecycleHooks: {
      luigiAfterInit: () => {
        console.log('AFTER INIT');
      }
    },

    auth__: {
      use: 'myOIDC',
      storage: 'none',
      disableAutoLogin: true,
      myOAuth2: {
        idpProvider: window['LuigiPlugin-auth-oauth2'],
        authorizeUrl: 'http://localhost:3000/auth',
        logoutUrl: 'http://localhost:3000/session/end',
        post_logout_redirect_uri: '/auth/logout.html',
        authorizeMethod: 'GET',
        oAuthData: {
          client_id: 'egDuozijY5SVr0NSIowUP1dT6RVqHnlp',
          redirect_uri: '/auth/callback.html'
        }
      },
      myOIDC: {
        idpProvider: window['LuigiPlugin-auth-oidc-pkce'],
        authority: 'http://localhost:3000',
        logoutUrl: 'http://localhost:3000/session/end',
        scope: 'openid profile email',

        client_id: 'egDuozijY5SVr0NSIowUP1dT6RVqHnlp', // example oidc-mockserver client id
        response_type: 'code', // for PKCE
        response_mode: 'fragment', // change between `query` and `fragment`
        loadUserInfo: true,
        post_logout_redirect_uri: '/auth/logout.html',

        userInfoFn: (settings, authdata) => {
          return new Promise((resolve) => {
            resolve(authdata.profile);
          });
        }
      },

      events: {
        onAuthSuccessful: (settings, authData) => {
          console.log('AUTH successful');
        },
        onAuthError: (settings, err) => {
          console.log('AUTH error');
        },
        onAuthExpired: (settings) => {
          console.log('AUTH expired');
        },
        onLogout: (settings) => {
          console.log('AUTH logout');
        },
        onAuthExpireSoon: (settings) => {
          console.log('AUTH expire soon');
        },
        onAuthConfigError: (settings, err) => {
          console.log('AUTH config error');
        }
      }
    }
  });
};
