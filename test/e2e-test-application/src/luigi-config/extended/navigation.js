import {
  addProject,
  getMockBadgeCount,
  getProjectCount,
  navigationPermissionChecker,
  projectsNavProviderFn,
  projectsCounterFn,
  projectExists,
  removeProject,
  getAllProjectsSync
} from './helpers';

class Navigation {
  constructor(navigationPermissionChecker, projectsNavProviderFn) {
    this.navigationPermissionChecker = navigationPermissionChecker;
    this.projectsNavProviderFn = projectsNavProviderFn;
  }

  addNavHrefs = true;
  preloadViewGroups = true;
  viewGroupSettings = {
    tets: {
      preloadUrl: '/sampleapp.html#/preload'
    },
    view_group_components: {
      noClientCheck: true,
      preloadUrl: '/sampleapp.html#/view-group/preload'
    }
  };
  intentMapping = [
    {
      semanticObject: 'Sales',
      action: 'settings',
      pathSegment: '/projects/pr2/settings'
    },
    {
      semanticObject: 'Component',
      action: 'settings',
      pathSegment: '/projects/:project/settings'
    },
    {
      semanticObject: 'External',
      action: 'view',
      externalLink: { url: 'https://www.sap.com', openInNewTab: true }
    }
  ];
  nodeAccessibilityResolver = navigationPermissionChecker;
  nodes = [
    {
      pathSegment: 'overview',
      label: 'Overview',
      viewUrl: '/sampleapp.html#/overview',
      hideSideNav: true,
      statusBadge: {
        label: 'OV'
      }
    },
    {
      pathSegment: 'projects',
      label: 'Projects',
      viewUrl: '/sampleapp.html#/projects',
      children: projectsNavProviderFn,
      badgeCounter: {
        label: 'Number of projects',
        count: projectsCounterFn
      }
    },

    {
      pathSegment: 'tabnavheader',
      label: 'Tab Nav Header',
      viewUrl: '/assets/tabHeader.js',
      icon: 'home',
      webcomponent: true,
      tabNav: {
        showAsTabHeader: true
      },
      children: [
        {
          pathSegment: 'header1',
          label: 'Header 1',
          viewUrl: '/sampleapp.html#/settings'
        },
        {
          pathSegment: 'header2',
          label: 'Header 2',
          viewUrl: '/sampleapp.html#/overview'
        },
        {
          pathSegment: 'tabNav1',
          category: { label: 'Header 3' },
          label: 'TabNav 1',
          viewUrl: '/sampleapp.html#/overview'
        },
        {
          pathSegment: 'tabNav2',
          category: { label: 'Header 3' },
          label: 'TabNav 2',
          viewUrl: '/sampleapp.html#/overview'
        },
        {
          pathSegment: 'tabNav2',
          category: { label: 'Header 3' },
          label: 'TabNav 2',
          viewUrl: '/sampleapp.html#/overview'
        },
        {
          pathSegment: 'tabNav3',
          category: { label: 'Header 3' },
          label: 'TabNav 3',
          viewUrl: '/sampleapp.html#/overview'
        },
        {
          pathSegment: 'tabNav4',
          category: { label: 'Header 3' },
          label: 'TabNav 4',
          viewUrl: '/sampleapp.html#/overview'
        },
        {
          pathSegment: 'tabNav5',
          category: { label: 'Header 3' },
          label: 'TabNav 5',
          viewUrl: '/sampleapp.html#/overview'
        },
        {
          pathSegment: 'tabNav6',
          category: { label: 'Header 3' },
          label: 'TabNav 6',
          viewUrl: '/sampleapp.html#/overview'
        },
        {
          pathSegment: 'tabNav7',
          category: { label: 'Header 3' },
          label: 'TabNav 7',
          viewUrl: '/sampleapp.html#/overview'
        },
        {
          pathSegment: 'tabNav8',
          category: { label: 'Header 3' },
          label: 'TabNav 8',
          viewUrl: '/sampleapp.html#/overview'
        },
        {}
      ]
    },
    {
      pathSegment: 'view-groups',
      label: 'View Groups',
      children: [
        {
          pathSegment: '1',
          label: 'VG 1',
          viewUrl: '/sampleapp.html#/view-group/1',
          viewGroup: 'view_group_components',
          category: {
            label: 'View Group',
            icon: '/assets/github-logo.png',
            collapsible: true
          }
        },
        {
          pathSegment: '2',
          label: 'VG 2',
          category: 'View Group',
          viewGroup: 'view_group_components',
          viewUrl: '/sampleapp.html#/view-group/2'
        },
        {
          pathSegment: '3',
          label: 'NO VG 3',
          category: 'View Group',
          viewUrl: '/sampleapp.html#/view-group/3'
        },
        {
          pathSegment: '4',
          label: 'NO VG 4',
          category: 'View Group',
          viewUrl: '/sampleapp.html#/view-group/4'
        }
      ]
    },

    {
      hideFromNav: true,
      pathSegment: 'create-environment',
      viewUrl: '/sampleapp.html#/create/environment',
      context: {
        label: 'Create Environment'
      }
    },
    {
      hideFromNav: true,
      pathSegment: 'environments',
      viewUrl: '/sampleapp.html#/environments',
      children: [
        {
          pathSegment: ':environmentId',
          viewUrl: '/sampleapp.html#/environments/:environmentId',
          children: [
            {
              pathSegment: 'overview',
              viewUrl: '/sampleapp.html#/environments/:environmentId/overview'
            },
            {
              pathSegment: 'settings',
              viewUrl: '/sampleapp.html#/environments/:environmentId/settings'
            }
          ]
        }
      ]
    },
    {
      pathSegment: 'forbidden-sample',
      label: 'Forbidden',
      viewUrl: '/sampleapp.html#/restricted',
      constraints: ['unicorns']
    },
    {
      externalLink: {
        url: 'https://github.com/luigi-project/luigi',
        sameWindow: true
      },
      label: 'Git',
      icon: 'globe',
      showLabel: true,
      hideSideNav: false,
      globalNav: true,
      testId: 'icon-and-label',
      statusBadge: {
        label: 'Git',
        type: 'negative'
      }
    },
    {
      globalNav: true,
      separator: true
    },
    {
      pathSegment: 'settings',
      label: 'Settings',
      viewUrl: '/sampleapp.html#/settings',
      icon: 'settings',
      globalNav: true,
      hideSideNav: true,
      viewGroup: 'tets'
    },

    {
      category: { label: 'Misc', icon: 'badge' },
      label: 'Open Google in this tab',
      externalLink: {
        url: 'http://google.com',
        sameWindow: true
      }
    }, // showing an anonymous content is possible only with auto login disabled

    {
      category: 'Misc',
      pathSegment: 'all-users',
      label: 'Visible for all users',
      anonymousAccess: true,
      viewUrl: '/sampleapp.html#/anonymous',
      hideSideNav: true
    },
    {
      pathSegment: 'anonymous',
      label: 'Visible for anonymous users only',
      anonymousAccess: 'exclusive',
      viewUrl: '/sampleapp.html#/anonymous?exclusive=true',
      hideSideNav: true
    },
    {
      category: 'Misc',
      pathSegment: 'ext',
      label: 'External Page',
      loadingIndicator: {
        hideAutomatically: false
      },
      viewUrl: '/assets/sampleexternal.html#ext',
      children: [
        {
          pathSegment: 'one',
          label: 'One',
          loadingIndicator: {
            hideAutomatically: false
          },
          icon: 'drill-up',
          viewUrl: '/assets/sampleexternal.html#one'
        },
        {
          pathSegment: 'two',
          label: 'Two',
          loadingIndicator: {
            hideAutomatically: false
          },
          icon: 'drill-down',
          viewUrl: '/assets/sampleexternal.html#two'
        }
      ]
    },

    {
      pathSegment: 'page-not-found',
      label: 'Page not found',
      viewUrl: '/assets/404.html',
      hideFromNav: true,
      hideSideNav: true
    },
    {
      category: { label: 'Messages', icon: 'lightbulb' },
      label: 'Errors',
      pathSegment: 'errors',
      viewUrl: '/sampleapp.html#/projects/pr1/dynamic/errors',
      hideSideNav: true,
      icon: 'alert',
      context: {
        label: 'Errors'
      },
      badgeCounter: {
        label: 'Number of Errors',
        count: () => 2
      }
    },
    {
      category: 'Messages',
      label: 'Warnings',
      pathSegment: 'warnings',
      viewUrl: '/sampleapp.html#/projects/pr1/dynamic/warnings',
      hideSideNav: true,
      icon: 'message-warning',
      context: {
        label: 'Warnings'
      },
      badgeCounter: {
        label: 'Number of Warnings',
        count: () => 5
      }
    },
    {
      category: 'Messages',
      label: 'Notifications',
      pathSegment: 'notifications',
      hideSideNav: true,
      viewUrl: '/sampleapp.html#/projects/pr1/dynamic/notifications',
      icon: 'ui-notifications',
      context: {
        label: 'Notifications'
      },
      badgeCounter: {
        label: 'Number of Notifications',
        count: getMockBadgeCount
      }
    }
  ];

  getContextSwitcherActions = () => {
    const actions = [
      {
        label: '+ New Environment (top)',
        link: '/create-environment'
      },
      {
        label: '+ New Environment (bottom)',
        link: '/create-environment',
        position: 'bottom', // top or bottom
        clickHandler: (node) => {
          // called BEFORE route change
          return true; // route change will be done using link value (if defined)
          // return false // route change will not be done even if link attribute is defined
        }
      },
      {
        label: '+ New Project',
        link: '/projects',
        position: 'bottom',
        clickHandler: (node) => {
          const p = addProject();
          Luigi.configChanged('navigation');
          Luigi.showAlert({
            text: `${p.name} created.`,
            type: 'info',
            closeAfter: 3000
          });
          return true;
        }
      }
    ];

    if (getProjectCount() > 0) {
      actions.push({
        label: '\u2212 Remove Project',
        link: '/projects',
        position: 'bottom',
        clickHandler: (node) => {
          const p = removeProject();
          Luigi.configChanged('navigation');
          Luigi.showAlert({
            text: `${p.name} removed.`,
            type: 'info',
            closeAfter: 3000
          });
          return true;
        }
      });
    }

    return actions;
  };

  // The following configuration will be used to render the context switcher component
  contextSwitcher = {
    defaultLabel: 'Select Environment ...',
    parentNodePath: '/environments', // absolute path
    lazyloadOptions: true, // load options on click instead on page load
    options: () =>
      [...Array(10).keys()]
        .filter((n) => n !== 0)
        .map((n) => ({
          label: 'Environment ' + n, // (i.e mapping between what the user sees and what is taken to replace the dynamic part for the dynamic node)
          pathValue: 'env' + n // will be used to replace dynamic part
        })),
    actions: this.getContextSwitcherActions,

    /**
     * fallbackLabelResolver
     * Resolve what to display in the context switcher (Label) in case the activated
     * context (option) is not listed in available options,
     * or if options have not been fetched yet
     */
    fallbackLabelResolver: (id) => id.replace(/\b\w/g, (l) => l.toUpperCase()),
    useFallbackLabelCache: true
  };

  getProductSwitcherItems = () => {
    const items = [
      {
        icon: 'https://pbs.twimg.com/profile_images/1143452953858183170/QLk-HGmK_bigger.png',
        label: 'hybris',
        subTitle: 'first subtitle',
        externalLink: {
          url: 'https://www.hybris.com',
          sameWindow: false
        }
      }
    ];

    getAllProjectsSync()
      .filter((project) => project.id !== 'tabNav')
      .forEach((project) => {
        items.push({
          icon: 'https://pbs.twimg.com/profile_images/1143452953858183170/QLk-HGmK_bigger.png',
          label: project.name,
          link: '/projects/' + project.id
        });
      });

    return items;
  };

  // The following configuration will be used to render a product switcher at the end of the top navigation
  productSwitcher = {
    label: 'My Products',
    icon: 'grid',
    // icon: '/assets/favicon-sap.ico',
    items: this.getProductSwitcherItems,
    columns: 3
  };

  getProfileItems = () => {
    const items = [
      {
        label: 'Luigi in Github',
        externalLink: {
          url: 'https://github.com/luigi-project/luigi',
          sameWindow: false
        }
      }
    ];

    getAllProjectsSync()
      .filter((project) => project.id !== 'tabNav')
      .forEach((project) => {
        items.push({
          icon: '',
          label: project.name,
          link: '/projects/' + project.id
        });
      });

    return items;
  };

  profile = {
    logout: {
      label: 'Sign Out'
      // icon: "sys-cancel",
    },
    items: this.getProfileItems,
    staticUserInfoFn: () => {
      return new Promise((resolve) => {
        resolve({
          name: 'Static User',
          initials: 'LU',
          email: 'other.luigi.user@example.com',
          picture: '/assets/favicon-sap.ico',
          description: 'Luigi Developer'
        });
      });
    }
  };

  appSwitcher = {
    showMainAppEntry: true,
    keepMainTitle: false,
    items: [
      {
        title: 'Application One',
        subTitle: 'the first app',
        link: '/projects/pr1'
      },
      {
        title: 'Application Two',
        link: '/projects/pr2',
        subTitle: 'the second app'
      },
      {
        title: 'Application Three',
        link: '/environments',
        subTitle: 'third app'
      },
      {
        title: 'Application Storage',
        link: '/projects/storage',
        subTitle: 'v1.18.0'
      }
    ]
  };
}

const navConfig = new Navigation(navigationPermissionChecker, projectsNavProviderFn);

export const navigation = {
  ...navConfig,
  validWebcomponentUrls: ['https://luigiwebcomponents.gitlab.io/.?']
};
