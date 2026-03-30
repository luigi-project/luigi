export const projectDetailNavStructure = (projectId) => [
  {
    pathSegment: 'wc_grid',
    label: 'Grid',
    hideFromNav: true,
    category: {
      label: 'Compound',
      icon: 'attachment-html',
      collapsible: true
    },
    compound: {
      renderer: {
        use: 'grid',
        config: {
          columns: '1fr 1fr',
          layouts: [
            {
              minWidth: 0,
              maxWidth: 600,
              columns: '1fr',
              gap: 0
            },
            {
              minWidth: 600,
              maxWidth: 1024,
              columns: '1fr 1fr',
              gap: '30px'
            }
          ]
        }
      },
      children: [
        {
          id: 'input1',
          viewUrl: '/assets/helloWorldWC.js',
          context: {
            title: 'Some input text !ft',
            instant: true
          },
          visibleForFeatureToggles: ['!ft']
        },
        {
          id: 'input12',
          viewUrl: '/assets/helloWorldWC.js',
          context: {
            title: 'Some input text ft1',
            instant: true
          },
          visibleForFeatureToggles: ['ft1']
        }
      ]
    }
  },
  {
    pathSegment: 'wc_grid_compound',
    label: 'Grid Compound',
    hideFromNav: true,
    category: {
      label: 'Compound',
      icon: 'attachment-html',
      collapsible: true
    },
    compound: {
      renderer: {
        use: 'grid',
        config: {
          columns: '1fr 1fr',
          layouts: [
            {
              minWidth: 0,
              maxWidth: 600,
              columns: '1fr',
              gap: 0
            },
            {
              minWidth: 600,
              maxWidth: 1024,
              columns: '1fr 1fr',
              gap: '30px'
            }
          ]
        }
      },
      children: [
        {
          id: 'btn',
          viewUrl: '/assets/wc_grid_btn.js',
          context: {
            text: 'Start'
          }
        },
        {
          id: 'timer',
          viewUrl: '/assets/wc_grid_timer.js',
          context: {
            s: 0
          },
          eventListeners: [
            {
              source: 'btn',
              name: 'sendBtn',
              action: 'update',
              dataConverter: (data) => data
            }
          ]
        }
      ]
    }
  },
  {
    pathSegment: 'wc_grid_compound_isolated',
    label: 'Grid Compound Isolated',
    hideFromNav: true,
    category: {
      label: 'Compound',
      icon: 'attachment-html',
      collapsible: true
    },
    compound: {
      isolated: true,
      renderer: {
        use: 'grid',
        config: {
          columns: '1fr 1fr',
          layouts: [
            {
              minWidth: 0,
              maxWidth: 600,
              columns: '1fr',
              gap: 0
            },
            {
              minWidth: 600,
              maxWidth: 1024,
              columns: '1fr 1fr',
              gap: '30px'
            }
          ]
        }
      },
      children: [
        {
          id: 'btn',
          viewUrl: '/assets/wc_grid_btn.js',
          context: {
            text: 'Start'
          }
        },
        {
          id: 'timer',
          viewUrl: '/assets/wc_grid_timer.js',
          context: {
            s: 0
          },
          eventListeners: [
            {
              source: 'btn',
              name: 'sendBtn',
              action: 'update',
              dataConverter: (data) => data
            }
          ]
        }
      ]
    }
  },
  {
    pathSegment: 'users',
    label: 'Users and Groups',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/users',
    icon: 'group',
    children: [
      {
        category: { label: 'Groups', icon: 'group' },
        pathSegment: 'groups',
        label: 'Groups',
        icon: 'group',
        viewUrl: '/sampleapp.html#/projects/' + projectId + '/users/groups',
        children: [
          {
            pathSegment: ':group',
            viewUrl: '/sampleapp.html#/projects/' + projectId + '/users/groups/:group',
            context: {
              currentGroup: ':group'
            },
            children: [
              {
                label: 'Group Settings',
                pathSegment: 'settings',
                keepSelectedForChildren: true,
                icon: 'user-settings',
                viewUrl: '/sampleapp.html#/projects/' + projectId + '/users/groups/:group/settings',
                children: [
                  {
                    label: 'Multi Path Params',
                    pathSegment: ':dynamic',
                    viewUrl: '/sampleapp.html#/projects/' + projectId + '/users/groups/:group/settings/:dynamic',
                    context: {
                      label: ':dynamic'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        pathSegment: 'usersoverview',
        label: 'Users Overview',
        icon: 'employee',
        viewUrl: '/sampleapp.html#/projects/' + projectId + '/users/usersoverview'
      }
    ]
  },
  {
    category: 'User Management',
    pathSegment: 'developers',
    label: 'Developers',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/developers',
    icon: 'employee',
    badgeCounter: {
      label: 'Number of developers',
      count: () => Math.floor(Math.random() * 100)
    },
    context: {
      test: 'test',
      label: 'VirtualTree - add segments to the url',
      links: false
    },
    virtualTree: true
  },
  {
    pathSegment: 'clientPermissionsTets',
    label: 'ClientPermissionsTets',
    viewUrl: '/sampleapp.html#/projects/pr1',
    hideFromNav: true
  },
  {
    pathSegment: 'drawer',
    label: 'Drawer Example',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/drawer',
    drawer: {
      header: 'Test',
      backdrop: true,
      size: 'l'
    },
    statusBadge: {
      label: 'Drawer',
      type: 'negative'
    }
  },
  {
    pathSegment: 'modal-with-callback',
    label: 'Modal with Callback',
    onNodeActivation: () => {
      Luigi.navigation().openAsModal(
        '/projects/pr2/settings',
        {
          title: 'Modal with callback function',
          size: 'm'
        },
        () => {
          alert('Callback called');
        }
      );
    }
  },
  {
    pathSegment: 'on-node-activation',
    label: 'Node with node activation hook',
    icon: 'activate',
    viewUrl: '/sampleapp.html#/on-node-activation',
    children: [
      {
        pathSegment: 'not-navigated',
        label: 'Prevent navigation',
        icon: 'stop',
        viewUrl: '/sampleapp.html#/on-node-activation/not-navigated',
        onNodeActivation: () => {
          Luigi.showAlert({
            text: 'Showing an alert instead of navigating.',
            type: 'info',
            closeAfter: 3000
          });
          return false;
        }
      },
      {
        pathSegment: 'navigated',
        label: 'Prevent navigation conditionally',
        icon: 'question-mark',
        viewUrl: '/sampleapp.html#/on-node-activation/conditionally-navigated',
        openNodeInModal: true,
        onNodeActivation: () => {
          const settings = {
            header: 'Confirmation',
            body: 'Are you sure you want to do this?',
            buttonConfirm: 'Yes',
            buttonDismiss: 'No'
          };
          return Luigi.showConfirmationModal(settings).then(
            () => true,
            () => false
          );
        }
      }
    ]
  },
  {
    category: { label: 'Settings', icon: 'action-settings' },
    pathSegment: 'settings',
    label: 'Project Settings',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/settings',
    icon: 'settings',
    userSettingsGroup: 'language',
    testId: 'myTestId',
    statusBadge: {
      label: 'Project',
      type: 'informative'
    }
  },
  {
    category: { label: 'Settings', icon: 'action-settings' },
    pathSegment: 'user_settings',
    label: 'User Settings',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/settings',
    icon: 'settings',
    userSettingsGroup: 'userAccount',
    testId: 'myTestId',
    statusBadge: {
      label: 'Settings',
      type: 'positive',
      align: 'right'
    }
  },
  {
    category: { label: 'Feature Toggle: Settings 2', icon: 'action-settings' },
    pathSegment: 'settings_ft',
    label: 'Project Settings 2',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/settings',
    icon: 'settings',
    testId: 'myTestId',
    visibleForFeatureToggles: ['ft1']
  },
  {
    category: { label: 'Feature Toggle: Settings 3', icon: 'action-settings' },
    pathSegment: 'settings_ft3',
    label: 'Project Settings 3',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/settings',
    icon: 'settings',
    testId: 'myTestId',
    userSettingsGroup: 'userAccount',
    visibleForFeatureToggles: ['!ft1']
  },
  {
    pathSegment: 'externalmf',
    label: 'External micro frontend',
    viewUrl: 'http://localhost:8090/index.html'
  },
  {
    pathSegment: 'miscellaneous',
    constraints: ['unicorns'],
    label: 'Miscellaneous',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/miscellaneous',
    icon: 'sys-help'
  },
  {
    pathSegment: 'miscellaneous2',
    label: 'Miscellaneous2',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/miscellaneous2',
    icon: 'sys-help',
    openNodeInModal: true
  },
  {
    pathSegment: 'webcomponent',
    label: 'Webcomponent',
    icon: 'along-stacked-chart',
    loadingIndicator: {
      enabled: false
    },
    context: {
      title: 'Hello WebComponent!'
    },
    viewUrl: '/assets/helloWorldWC.js?{i18n.currentLocale}',
    webcomponent: true,
    openNodeInModal: true,
    tooltipText: 'Webcomponent tooltipText',
    statusBadge: {
      label: '',
      type: 'critical'
    },
    clientPermissions: {
      changeCurrentLocale: false
    }
  },
  {
    pathSegment: 'webcomponent2',
    label: 'Webcomponent 2',
    icon: 'along-stacked-chart',
    loadingIndicator: {
      enabled: false
    },
    context: {
      title: 'Hello WebComponent!'
    },
    viewUrl: '/assets/helloWorldWC.js?{i18n.currentLocale}',
    webcomponent: true,
    clientPermissions: {
      changeCurrentLocale: true,
      urlParameters: {
        testParam: {
          read: true
        }
      }
    }
  },
  {
    pathSegment: 'misc2-isolated',
    label: 'Miscellaneous2 (Isolated View)',
    isolateView: true,
    openNodeInModal: true,
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/miscellaneous2',
    userSettingsGroup: 'privacy',
    icon: 'sys-help-2'
  },
  {
    pathSegment: 'dps',
    label: 'Default Child node Example',
    defaultChildNode: 'dps2',
    icon: 'checklist',
    children: [
      {
        pathSegment: 'dps1',
        label: 'First Child',
        viewUrl: '/sampleapp.html#/projects/' + projectId + '/dps/dps1',
        icon: 'physical-activity'
      },
      {
        pathSegment: 'dps2',
        label: 'Second Child',
        viewUrl: '/sampleapp.html#/projects/' + projectId + '/dps/dps2',
        icon: 'physical-activity'
      }
    ]
  },
  {
    link: '/settings',
    label: 'Go to absolute path',
    icon: 'switch-views'
  },
  {
    link: 'dps/dps1',
    label: 'Go to relative path',
    icon: 'switch-views'
  },
  {
    pathSegment: 'avengers',
    label: 'Keep Selected Example',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/dynamic/avengers',
    keepSelectedForChildren: true,
    icon: 'accept',
    context: {
      label: 'Avengers',
      links: ['Captain America', 'Iron Man', 'Thor', 'Hulk', 'Black Widow', 'Hawkeye', 'Loki']
    },
    children: ['Captain America', 'Iron Man', 'Thor', 'Hulk', 'Black Widow', 'Hawkeye', 'Loki'].map((name) => ({
      pathSegment: name.toLowerCase().split(' ').join('-'),
      label: name,
      context: {
        label: name,
        links: ['Super Power']
      },
      viewUrl: '/sampleapp.html#/projects/' + projectId + '/dynamic/' + name.toLowerCase().split(' ').join('-'),
      children: [
        {
          label: 'Super Power',
          pathSegment: 'super-power',
          context: {
            label: 'Super Power',
            links: ['Details']
          },
          viewUrl: '/sampleapp.html#/projects/' + projectId + '/dynamic/super-power',
          children: [
            {
              label: 'Details',
              pathSegment: 'details',
              context: {
                label: 'Details',
                links: false
              },
              viewUrl: '/sampleapp.html#/projects/' + projectId + '/dynamic/details'
            }
          ]
        }
      ]
    }))
  },
  {
    pathSegment: 'hideSideNav',
    label: 'Hide left navigation',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/hideSideNav',
    hideSideNav: true,
    icon: 'full-screen'
  },
  {
    pathSegment: 'emptyViewUrl',
    label: 'Empty viewUrl node',
    viewUrl: ''
  },
  {
    pathSegment: 'virtual-tree',
    label: 'VirtualTree',
    icon: 'tree',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/dynamic',
    navigationContext: 'virt',
    context: {
      label: 'VirtualTree - add segments to the url',
      links: false
    },
    virtualTree: true
  },
  {
    pathSegment: 'nav-sync',
    label: 'Nav Sync',
    icon: 'synchronize',
    navigationContext: 'navSync',
    children: [
      ...['one', 'two', 'three', 'four'].map((seg) => ({
        label: seg,
        pathSegment: seg,
        viewUrl: '/sampleapp.html#/nav-sync-example/' + seg
      })),
      {
        label: 'Flat Dynamic Parameter',
        pathSegment: 'dynamic-parameter-flat',
        viewUrl: '/sampleapp.html#/dynamic-parameter-flat',
        children: [
          {
            pathSegment: ':dynamic',
            label: 'Dynamic Parameter',
            viewUrl: '/sampleapp.html#/dynamic-parameter-flat/:dynamic'
          }
        ]
      },
      {
        label: 'Stacked Dynamic Parameter',
        pathSegment: 'dynamic-parameter-stacked',
        viewUrl: '/sampleapp.html#/dynamic-parameter-stacked',
        children: [
          {
            pathSegment: ':dynamic1',
            label: 'Dynamic Parameter',
            viewUrl: '/sampleapp.html#/dynamic-parameter-stacked/:dynamic1',
            children: [
              {
                pathSegment: 'child',
                label: 'Child',
                viewUrl: '/sampleapp.html#/dynamic-parameter-stacked/:dynamic1/child',
                children: [
                  {
                    pathSegment: ':dynamic2',
                    label: 'Dynamic Parameter 2',
                    viewUrl: '/sampleapp.html#/dynamic-parameter-stacked/:dynamic1/child/:dynamic2'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        label: 'Auto routing',
        pathSegment: 'auto-routing',
        viewUrl: '/sampleapp.html#/auto-routing'
      }
    ]
  },
  {
    label: 'Open Github in new tab',
    category: {
      label: 'Super useful Github links',
      icon: '/assets/github-logo.png',
      collapsible: true
    },
    externalLink: {
      url: 'http://github.com',
      sameWindow: false
    },
    icon: 'internet-browser'
  },
  {
    label: 'Open Github in this tab',
    category: 'Super useful Github links',
    externalLink: {
      url: 'http://github.com',
      sameWindow: true
    },
    icon: 'globe'
  },
  {
    label: 'Open SAP Website',
    category: 'Super useful Github links',
    externalLink: {
      url: 'http://sap.com/{i18n.currentLocale}',
      sameWindow: true
    },
    icon: 'globe'
  },
  {
    label: 'Context Value Replacement - External link',
    category: 'Super useful Github links',
    context: {
      someValue: 'bar'
    },
    externalLink: {
      url: 'http://sap.com/{i18n.currentLocale}?foo={context.someValue}',
      sameWindow: true
    },
    icon: 'globe'
  },
  {
    pathSegment: 'collapsibles',
    label: 'Collapsible categories',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/miscellaneous2',
    icon: 'sys-help',
    children: [
      {
        label: 'Open Github in new tab',
        category: {
          label: 'Super useful Github links',
          icon: '/assets/github-logo.png',
          collapsible: true
        },
        externalLink: {
          url: 'http://github.com',
          sameWindow: false
        },
        icon: 'internet-browser'
      },
      {
        label: 'Open Github in this tab',
        category: 'Super useful Github links',
        externalLink: {
          url: 'http://github.com',
          sameWindow: true
        },
        icon: 'globe'
      },
      {
        category: {
          label: 'User Management',
          icon: 'person-placeholder',
          collapsible: true
        },
        pathSegment: 'users',
        label: 'Users and Groups',
        viewUrl: '/sampleapp.html#/projects/' + projectId + '/users',
        icon: 'group'
      },
      {
        category: 'User Management',
        pathSegment: 'developers',
        label: 'Developers',
        viewUrl: '/sampleapp.html#/projects/' + projectId + '/developers',
        icon: 'employee',
        badgeCounter: {
          label: 'Number of developers',
          count: () => Math.floor(Math.random() * 100)
        }
      }
    ]
  },
  {
    pathSegment: 'sidenavaccordionmode',
    label: 'Collapse one categories',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/miscellaneous2',
    icon: 'sys-help',
    sideNavAccordionMode: true,
    children: [
      {
        label: 'Open Github in new tab',
        category: {
          label: 'Super useful Github links',
          icon: '/assets/github-logo.png',
          collapsible: true
        },
        externalLink: {
          url: 'http://github.com',
          sameWindow: false
        },
        icon: 'internet-browser'
      },
      {
        label: 'Open Github in this tab',
        category: 'Super useful Github links',
        externalLink: {
          url: 'http://github.com',
          sameWindow: true
        },
        icon: 'globe'
      },
      {
        category: {
          label: 'User Management',
          icon: 'person-placeholder',
          collapsible: true
        },
        pathSegment: 'users',
        label: 'Users and Groups',
        viewUrl: '/sampleapp.html#/projects/' + projectId + '/users',
        icon: 'group'
      },
      {
        category: 'User Management',
        pathSegment: 'developers',
        label: 'Developers',
        viewUrl: '/sampleapp.html#/projects/' + projectId + '/developers',
        icon: 'employee',
        badgeCounter: {
          label: 'Number of developers',
          count: () => Math.floor(Math.random() * 100)
        }
      }
    ]
  },
  {
    category: {
      label: 'Lazy Loading',
      icon: 'away'
    },
    pathSegment: 'lazygrid',
    label: 'Grid Compound',
    compound: {
      lazyLoadingOptions: {
        enabled: true,
        temporaryContainerHeight: '600px'
      },
      renderer: {
        use: 'grid',
        config: {
          columns: '1fr'
        }
      },
      children: [
        {
          id: 'compoundItem1',
          viewUrl: '/assets/wc_grid_text.js',
          context: {
            text: 'Start'
          }
        },
        {
          id: 'compoundItem2',
          viewUrl: '/assets/wc_grid_text.js',
          context: {
            s: '00:00'
          }
        }
      ]
    }
  }
];
