let globalSearchPreset = `
Luigi.setConfig({
    navigation: {
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
                    title: 'Global Search',
                    content: 'Type into the search field at the top. The search provider filters the labels of the navigation nodes.'
                }
            },{
                pathSegment: 'orders',
                label: 'Orders',
                icon: 'sales-order',
                viewUrl: '/examples/microfrontends/multipurpose.html',
                context: {
                    title: 'Orders',
                    content: 'Open and completed sales orders.'
                }
            },{
                pathSegment: 'customers',
                label: 'Customers',
                icon: 'customer',
                viewUrl: '/examples/microfrontends/multipurpose.html',
                context: {
                    title: 'Customers',
                    content: 'Customer data.'
                }
            },{
                pathSegment: 'invoices',
                label: 'Invoices',
                icon: 'receipt',
                viewUrl: '/examples/microfrontends/multipurpose.html',
                context: {
                    title: 'Invoices',
                    content: 'Billing documents.'
                }
            },{
                pathSegment: 'reports',
                label: 'Reports',
                icon: 'bar-chart',
                viewUrl: '/examples/microfrontends/multipurpose.html',
                context: {
                    title: 'Reports',
                    content: 'Sales reports'
                }
            }]
        }]
    },
    globalSearch: {
        searchProvider: {
            // Also runs on Enter, because no onEnter handler is defined
            onInput: () => {
                const query = (Luigi.globalSearch().getSearchString() || '').trim().toLowerCase();
                if (!query) {
                    Luigi.globalSearch().closeSearchResult();
                    return;
                }
                const pages = Luigi.getConfigValue('navigation.nodes')[0].children;
                const results = pages
                    .filter((node) => node.label.toLowerCase().includes(query))
                    .map((node) => ({
                        label: node.label,
                        description: node.context.content,
                        pathObject: {
                            link: '/home/' + node.pathSegment,
                            params: {}
                        }
                    }));
                Luigi.globalSearch().showSearchResult(results);
            },
            onEscape: () => {
                Luigi.globalSearch().closeSearchResult();
                Luigi.globalSearch().clearSearchField();
            },
            onSearchResultItemSelected: (searchResultItem) => {
                Luigi.navigation()
                    .withParams(searchResultItem.pathObject.params)
                    .navigate(searchResultItem.pathObject.link);
                Luigi.globalSearch().closeSearchResult();
                Luigi.globalSearch().clearSearchField();
            }
        }
    },
    routing: {
        useHashRouting: true
    },
    settings: {
        header: {
            logo: 'img/luigi.svg',
            title: 'Luigi Fiddle'
        }
    }
});
`;
export default globalSearchPreset;