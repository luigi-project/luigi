<!-- meta
{
  "node": {
    "label": "Navigation configuration Example",
    "category": {
      "label": "Examples",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 9,
      "position": 0
    }
  }
}
meta -->

# Navigation configuration example

This example represents a Luigi navigation configuration example including parameters described in the [navigation parameters reference](navigation-parameters-reference.md).

Note that this is not a functional example, as its purpose is to illustrate different configuration options. For example, the line `children: [node, node, node]` will return an error because `node` is just a placeholder which has to be replaced by actual nodes.

```javascript
Luigi.setConfig({
  routing: {
    // uses hash-based navigation if set to true
    useHashRouting: true,
    nodeParamPrefix: '~',
    showModalPathInUrl: true,
    modalPathParam: 'modal'
    skipRoutingForUrlPatterns: [/access_token=/, /id_token=/]
  },
  // navigation structure and settings
  navigation: {
    nodeAccessibilityResolver: function (nodeToCheckPermissionFor, parentNode, currentContext) {},
    viewGroupSettings: {
      main: {
        preloadUrl: 'https://example.com/index.html#/preload',
      },
      projects: {
        preloadUrl: 'https://example.com/projects.html#/preloading',
      },
      envs: {
        preloadUrl: 'https://example.com/environments-details.html#/preload-view',
      }
    },
    nodes: [
      // STATIC navigation node
      {
        pathSegment: 'settings',
        label: 'Settings',
        viewUrl: 'https://example.com/settings',
        viewGroup: 'settingsGroup',
        // optional
        children: [node, node, node],
        hideFromNav: false,
        isolateView: false,
        icon: 'settings',
        testId: 'myTestId',
        category: {
          label: 'General',
          testId: 'myTestId',
          icon: 'general'
        }, // OR
        category: 'General'
      },
      // DYNAMIC navigation node
      {
        navigationContext: 'contextName',
        pathSegment: ':projectId',
        testId: 'myTestId',
        viewUrl: '/some/path/:projectId',
        context: {
          projectId: ':projectId'
        },
        children: [node, node, node]
      },
      // Implicit structural node
      {
        pathSegment: 'project/:projectId',
        viewUrl: '/some/path/:projectId',
        children: [node, node, node]
      }
      // View groups nodes
      {
        viewGroup: 'main',
        pathSegment: 'overview',
        label: 'Overview',
        viewUrl: 'https://example.com/index.html#/overview'
      },
      {
        viewGroup: 'main',
        pathSegment: 'preload',
        viewUrl: 'https://example.com/index.html#/preload'
      },
      {
        viewGroup: 'projects',
        pathSegment: 'projects',
        label: 'Projects',
        viewUrl: 'https://example.com/projects.html#/list',
        children: [
          {
            pathSegment: 'preloading',
            viewUrl: 'https://example.com/projects.html#/preloading'
          }
        ]
      },
      {
        viewGroup: 'envs',
        pathSegment: 'create-environment',
        viewUrl: 'https://example.com/environments.html#/create',
        context: {
          label: 'Create Environment'
        }
      },
      {
        viewGroup: 'envs',
        pathSegment: 'environments',
        viewUrl: 'https://example.com/environments-details.html#/list',
        children: [
          {
            pathSegment: 'preload',
            viewUrl: 'https://example.com/environments-details.html#/preload-view'
          },
          {
            pathSegment: 'env1',
            viewUrl: 'https://example.com/environments-details.html#/details/env1'
          }
        ]
      }
    ],
    contextSwitcher: {
      defaultLabel: 'Select Environment ...',
      testId: 'myTestId',
      parentNodePath: '/environments',
      lazyloadOptions: false,
      fallbackLabelResolver: (id) => (id.toUpperCase()),
      useFallbackLabelCache: true,
      options: [{label,pathValue}, {label,pathValue}],
      actions: [{label,link,position,clickHandler}]
    },
    profile: {
      logout: {
        label: 'End Session',
        // icon: "sys-cancel",
        testId: 'myTestId',
        customLogoutFn: myLogoutFn
      },
      items: [
        {
          icon: '',
          testId: 'myTestId',
          label: 'Luigi landing page',
          externalLink: {
            url: 'https://luigi-project.io/',
            sameWindow: false
          }
        },
        {
          icon: '',
          label: 'Project 1',
          link: '/projects/pr1'
        }
      ]
    },
    productSwitcher: {
      label: 'My Products',
      testId: 'myTestId',
      icon: 'grid',
      items: [
        {
          icon: '',
          label: 'Luigi landing page',
          testId: 'myTestId',
          externalLink: {
            url: 'https://luigi-project.io/',
            sameWindow: false
          }
        },
        {
          icon: '',
          label: 'Project 1',
          testId: 'myTestId',
          link: '/projects/pr1'
        }
      ]
    }
  }
});
```
