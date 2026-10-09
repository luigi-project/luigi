let compoundPreset = `
Luigi.setConfig({
    navigation: {
        nodes: [{
            pathSegment: 'home',
            label: 'h',
            hideFromNav: true,
            children: [{
                pathSegment: 'compound',
                label: 'Compound Grid',
                icon: 'grid',
                compound: {
                    renderer: {
                        use: 'grid',
                        config: {
                            columns: '1fr 1fr',
                            gap: '20px'
                        }
                    },
                    children: [{
                        viewUrl: '/examples/microfrontends/compound/w1.js'
                    },{
                        viewUrl: '/examples/microfrontends/compound/w2.js'
                    },{
                        viewUrl: '/examples/microfrontends/compound/w1.js'
                    },{
                        viewUrl: '/examples/microfrontends/compound/w2.js'
                    }]
                }
            }]
        }]
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
export default compoundPreset;