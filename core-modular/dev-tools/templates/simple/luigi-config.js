window.onload = () => {
  window.Luigi.setConfig({
    navigation: {
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
          pathSegment: 'home',
          icon: 'home',
          viewUrl: '/microfrontend.html#home',
          children: [
            {
              pathSegment: 'c1',
              label: 'MFE1',
              icon: 'group',
              viewUrl: '/microfrontend.html#child1',
              viewGroup: 'vg1'
            },
            {
              pathSegment: 'c2',
              label: 'MFE2',
              icon: 'calendar',
              viewUrl: '/microfrontend.html#child2',
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
              }
            },
            {
              pathSegment: 'c4',
              label: 'MFE4',
              icon: 'calendar',
              viewUrl: '/microfrontend.html#child4',
              category: 'cat'
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
          pathSegment: 'help',
          icon: 'sys-help',
          viewUrl: '/microfrontend.html#help'
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
        ],
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
      }
    },
    routing: {
      useHashRouting: true
    },
    settings: {
      responsiveNavigation: 'Fiori3',
      header: {
        title: 'Luigi Headless POC',
        subTitle: 'luigi headless poc',
        logo: 'https://fiddle.luigi-project.io/img/luigi.svg'
      },
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
        privacy: {
          label: 'Privacy',
          title: 'Privacy',
          icon: 'private',
          iconClassAttribute: 'SAP-icon-iconClassAttribute-Test',
          settings: {
            policy: {
              type: 'string',
              label: 'Privacy policy has not been defined.',
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
    }
  });
};
