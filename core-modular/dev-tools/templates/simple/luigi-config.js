window.onload = () => {
  window.Luigi.setConfig({
    navigation: {
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
          icon: 'success',
          viewUrl: '/microfrontend.html#errors'
        },
        {
          category: { id: 'cat2', label: 'cat2', icon: 'record' },
          pathSegment: 'cat2',
          label: 'Cat2',
          icon: 'people',
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
        }
      ]
    },
    routing: {
      useHashRouting: true
    },
    settings: {
      responsiveNavigation: 'Fiori3',
      header: {
        title: 'Luigi Headless POC',
        logo: 'https://fiddle.luigi-project.io/img/luigi.svg'
      }
    }
  });
};
