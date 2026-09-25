const basicNavigation = `
Luigi.setConfig({
  navigation: {
    nodes: [
      {
        pathSegment: 'TopNav1',
        label: 'Top Navigation Element One',
        viewUrl: '/examples/microfrontends/multipurpose.html',
        context: {
          title: 'Top Navigation Element One',
          content: 'Top-level nodes appear in the top navigation. Their children appear in the left navigation.'
        },
        children: [
          {
            pathSegment: 'SideNav1',
            label: 'Side Navigation Element One',
            viewUrl: '/examples/microfrontends/multipurpose.html',
            context: {
              title: 'Side Navigation Element One',
              content: 'This node has children of its own, so the left navigation now lists them: an internal link and an external link.'
            },
            children: [
              {
                link: '/TopNav1/internalLink',
                label: 'Internal link to /TopNav1/internalLink'
              },
              {
                externalLink: {
                  url: 'https://luigi-project.io',
                  sameWindow: false
                },
                label: 'External link to luigi-project.io'
              }
            ]
          },
          {
            pathSegment: 'internalLink',
            label: 'Internal Link Target',
            hideFromNav: true,
            viewUrl: '/examples/microfrontends/multipurpose.html',
            context: {
              title: 'Internal link target',
              content: 'You got here through a link node. A link node takes you to another route of the app instead of loading a view of its own.'
            }
          }
        ]
      },
      {
        pathSegment: 'TopNav2',
        label: 'Top Navigation Element Two',
        viewUrl: '/examples/microfrontends/multipurpose.html',
        context: {
          title: 'Top Navigation Element Two',
          content: 'A second top-level node. Open Modify Config to see how these nodes are defined.'
        },
        children: [
          {
            pathSegment: 'SideNav2',
            label: 'Side Navigation Element Two',
            viewUrl: '/examples/microfrontends/multipurpose.html',
            context: {
              title: 'Side Navigation Element Two',
              content: 'A child of Top Navigation Element Two, shown in the left navigation.'
            }
          }
        ]
      }
    ]
  },
  routing: {
    useHashRouting: true
  },
  settings: {
    header: {
      logo: '/img/luigi.svg',
      title: 'Basic Navigation'
    }
  }
});
`;

export default basicNavigation;