<!-- meta
{
  "node": {
    "label": "Micro frontend routing",
    "category": {
      "label": "Advanced",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 8,
      "position": 2
    }
  }
}
meta -->

# Micro frontend routing

Luigi routing can be divided in two main parts: higher-level routing of the main app (Luigi Core), and routing within the micro frontend (Luigi Client).

This document shows how you can handle the second way of routing while preserving the existing router of your micro frontend. The exact way this is achieved depends on the type of routing you use, but you should follow some general steps:

1. Enable [virtualTree](navigation-parameters-reference.md#virtualtree) in your Luigi configuration file for the node of your micro frontend.
2. Import [Luigi Client](luigi-client-setup.md) to your micro frontend.
3. Use the methods provided by Luigi Client's [linkManager](luigi-client-api.md#linkmanager) to update the main app's URL and maintain navigation history.

Below, you can find some simple examples on how to keep routing in sync for different frontend technologies such as [Angular](#angular-routing), [SvelteKit](#sveltekit-routing), and [React](#react-routing).

<!-- accordion:start -->

### Angular routing

#### Overview

If your use case involves Angular routing, it is recommended that you use the [Luigi Client Angular support library](framework-support-libraries.md#angular-support-library). The library contains routing features providing an easier way to synchronize applications. If you want to find out how this process works under the hood, you can read the example below. 

This example shows you how to keep an existing routing strategy and use an existing micro frontend as drop-in without the need to refactor everything to [`LuigiClient.linkManager()`](https://docs.luigi-project.io/docs/luigi-client-api?section=linkmanager). To update the Luigi Core URL when routing internally with the micro frontend router, without updating the URL on the Luigi Client side, use the `linkManager()` [withoutSync](luigi-client-api.md#withoutsync) and [fromVirtualTreeRoot](luigi-client-api.md#fromvirtualtreeroot) methods.

If you are running Luigi Core v0.7.7+, you can use [fromClosestContext](luigi-client-api.md#fromclosestcontext) instead of `fromVirtualTreeRoot`, which requires a [navigationContext](luigi-client-api.md#navigationcontext) at the `virtualTree` node configuration.

#### Steps

1. Configure the Luigi navigation node:

<!-- add-attribute:class:warning -->
> **NOTE**: To keep the example simple, we use [virtualTree](navigation-parameters-reference.md#virtualtree) to allow any nested navigation, but this is not mandatory. You can always specify the node tree yourself and still use automatic navigation with router events.


```javascript
    {
      pathSegment: 'Orders',
      label: 'orders',
      viewUrl: 'https://orders.microfrontend/',
      virtualTree: true
    }
```

2. Use an Angular Router for navigation.

Angular provides [Router events](https://angular.io/guide/router#router-events). We are reacting on `NavigationEnd` to update the URL after a successful route change.

We assume that the whole Angular app is one micro frontend and has its routes declared on the root level:

```javascript
  { path: 'preload', component: PreloadComponent },
  { path: '', component: OrderListComponent },
  { path: ':id', component: OrderComponent },
  { path: ':id/details', component: OrderDetailsComponent },
```

Use this code to implement `luigi-auto-navigation.service.ts`, which is globally imported in our `app.module.ts`:

```javascript
import { Router, NavigationEnd } from '@angular/router';
import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { linkManager } from '@luigi-project/client';

@Injectable({ providedIn: 'root' })
export class LuigiAutoNavigationService implements OnDestroy {
  private subscriptions: Subscription = new Subscription();
  constructor(private router: Router) {
    this.subscriptions.add(
      router.events
        .pipe(filter(ev => ev instanceof NavigationEnd))
        .subscribe((ev: NavigationEnd) => {
          linkManager()
            .fromVirtualTreeRoot()
            .withoutSync()
            .navigate(ev.url);
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
```
`app.module.ts`:
```javascript
@NgModule({
    providers: [LuigiAutoNavigationService],
```


#### Result

Other than the added service, which you can also implement as a `RouteGuard` or similar, the micro frontend is unchanged and uses `[routerLink='']` or other functionality to navigate.



### SvelteKit routing

#### Overview

This example shows the steps to use Luigi with routing based on SvelteKit. It is also meant to show how to keep Luigi Core in sync with a Svelte micro frontend.

#### Steps 

1. Create a SvelteKit app by following the steps [here](https://kit.svelte.dev/docs/introduction#getting-started).

2. Include the Luigi Client script somewhere in your app. In this example, include the CDN version in your `app.html`:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<script src="https://unpkg.com/@luigi-project/client/luigi-client.js"></script>
		%sveltekit.head%
	</head>
	<body>
		<div>%sveltekit.body%</div>
	</body>
</html>
```

3. Connect inbound and outbound routing channels in an always-present Svelte component in order to have two-way route sync. In this example, paste the following inside `__layout.svelte`: 

```html
<script>
	import Header from '$lib/header/Header.svelte';
	import '../app.css';

	import { onMount } from 'svelte';
	import  { goto, afterNavigate } from '$app/navigation';

	
	onMount(async () => {
		// react on Luigi-induced route changes
		window.addEventListener('popstate', () => {
			goto(window.location.href, { replaceState: true });
		});
	});

	afterNavigate(navigation => {
		// sync Luigi route after internal navigation
		if( navigation.to && navigation.from && navigation.to.href !== navigation.from.href ) {
			let luigiRoute = navigation.to.pathname;
			if(luigiRoute === '/') {
				luigiRoute += 'home';
			}
			LuigiClient.linkManager().withoutSync().fromParent().navigate(luigiRoute);
		}
	});
</script>
...
```

4. Now your micro frontend is configured and you can include it in your application. Below is an example configuration that you can test by going to [Luigi Fiddle](https://fiddle.luigi-project.io/) and clicking on "Modify Config". You need to replace `sveltekitMFEUrl` with the URL to your own micro frontend. 

```javascript
let sveltekitMFEUrl = 'http://127.0.0.1:5173/';

Luigi.setConfig({
    navigation: { 
            nodes: [{ 
                pathSegment: 'home', 
                label: 'h', 
                globalNav: true,
                hideFromNav: true, 
                children: [{ 
                    pathSegment: 'home', 
                    label: 'Home', 
                    icon: sveltekitMFEUrl + 'src/lib/header/svelte-logo.svg',
                    viewUrl: sveltekitMFEUrl,
                    viewGroup: 'svelte'
                },{ 
                    pathSegment: 'about', 
                    label: 'About', 
                    icon: sveltekitMFEUrl + 'src/lib/header/svelte-logo.svg',
                    viewUrl: sveltekitMFEUrl + 'about',
                    viewGroup: 'svelte'
                },{ 
                    pathSegment: 'todos', 
                    label: 'Todos', 
                    icon: sveltekitMFEUrl + 'src/lib/header/svelte-logo.svg',
                    viewUrl: sveltekitMFEUrl + 'todos',
                    viewGroup: 'svelte'
                }] 
            }]
        }, 
        
        routing: { 
            useHashRouting: true 
        }, 
        settings: { 
            responsiveNavigation: 'semiCollapsible',
            header: { 
                logo: 'img/luigi.png', 
                title: 'Svelte kit poc'
            }
        }
    });    
```

5. If you don't want to specify each subsequent navigation node in your application, you can use Luigi's [virtualTree](navigation-parameters-reference.md#virtualtree) feature.


### React routing

#### Overview

This example provides general instructions on how to implement routing with React. The specifics might depend on which version of React you are using. 

#### Steps 

1. In your Luigi configuration file, set [virtualTree](navigation-parameters-reference.md#virtualtree) to `true` for the node where you want to use React routing. This allows navigation to any of the node children's paths without the need for specifying them on the Luigi Core level.

```js
Luigi.setConfig({
  navigation: {
    nodes: [
      {
        hideSideNav: true,
        label: 'React',
        pathSegment: 'react',
        viewUrl: '//localhost:3000/',
        virtualTree: true,
      },
```

2. Inside your React app's `App.js` file, use Luigi's [linkManager](luigi-client-api.md#linkmanager) methods to make Luigi aware of the internal URL changes.  

This can be done in React by calling a Luigi Client navigation function inside your route change listener. As the route of your micro frontend changes, the Luigi Client navigation call will append it to the main app's route so that it is kept in the browser's session navigation history, allowing you to move back and forth while navigating internally. 

Use [fromVirtualTreeRoot](luigi-client-api.md#fromvirtualtreeroot) to set routing to the parent route in the `virtualTree`, and [withoutSync](luigi-client-api.md#withoutsync) to disable Luigi Core handling of the URL. Finally, navigate to the correct path using Luigi Client's [navigate](luigi-client-api.md#navigate) method:

```js
  let location = useLocation();

  useEffect(() => {
    // Broadcast all route changes to Luigi so that it can update the URL
    LuigiClient.linkManager().fromVirtualTreeRoot().withoutSync().navigate(location.pathname);
  }, [location]);
```



<!-- accordion:end -->
