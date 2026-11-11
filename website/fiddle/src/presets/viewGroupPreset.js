export default `Luigi.setConfig({
            navigation: {
                preloadViewGroups: true,
                viewGroupSettings: {
                    vg1: {
                        preloadUrl: '/examples/microfrontends/multipurpose.html#/preload'
                    }
                },
                nodes: () => [
                    {
                        pathSegment: 'settings',
                        label: 'Settings',
                        defaultChildNode: 'agents',
                        children: [
                            {
                                viewGroup: 'vg1',
                                pathSegment: 'agents',
                                label: 'Agent Lists',
                                hideSideNav: false,
                                loadingIndicator: {
                                    hideAutomatically: true,
                                    enabled: true
                                },
                                viewUrl: '/examples/microfrontends/multipurpose.html#/route1',
                            },
                            {
                                viewGroup: 'vg1',
                                pathSegment: 'agentgroups',
                                label: 'Agent Groups',
                                hideSideNav: false,
                                loadingIndicator: {
                                    hideAutomatically: true,
                                    enabled: true
                                },
                                viewUrl: '/examples/microfrontends/multipurpose.html#/route2',
                            },
                        ]
                    }
                ],
                profile: {
                    logout: {
                        label: 'Sign Out',
                        icon: "sys-cancel",
                        customLogoutFn: () => { }
                    },
                }
            },
            routing: {
                useHashRouting: true
            }
        });
        `