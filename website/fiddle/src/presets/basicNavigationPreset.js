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
              content: 'A child of Top Navigation Element One, shown in the left navigation.'
            }
          },
          {
            pathSegment: 'SideNav2',
            label: 'Side Navigation Element Two',
            viewUrl: '/examples/microfrontends/multipurpose.html',
            context: {
              title: 'Side Navigation Element Two',
              content: 'A child of Top Navigation Element One, shown in the left navigation.'
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
            pathSegment: 'SideNav1',
            label: 'Side Navigation Element One',
            viewUrl: '/examples/microfrontends/multipurpose.html',
            context: {
              title: 'Side Navigation Element One',
              content: 'A child of Top Navigation Element Two, shown in the left navigation.'
            }
          },
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