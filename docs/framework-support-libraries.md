<!-- meta
{
  "node": {
    "label": "Framework support libraries",
    "category": {
      "label": "Luigi Client",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 5,
      "position": 1
    }
  }
}
meta -->

# Luigi Client framework support libraries

On this page, you can find more information about Luigi Client support libraries for web application frameworks. 

- [Angular Support Library](#angular-support-library)
  - [How to use the library](#how-to-use-the-library)
  - [Features](#features)
- [UI5 Support Library](#ui5-support-library)
  - [How to use the library](#how-to-use-the-library-1)
  - [Features](#features-1)

## Angular Support Library

The [ClientSupportAngular](https://github.com/luigi-project/luigi/tree/main/client-frameworks-support/client-support-angular/projects/client-support-angular) library provides several features which make it easier to run your Angular application inside the Luigi micro frontend framework.

> **NOTE:** Starting with version 20, this package will be aligned with Angular's major versioning. For example, '@luigi-project/client-support-angular@^20' will support '@angular/core@^20', and so on. 

### How to use the library

1. Import the library in the `package.json`:
```javascript
npm install @luigi-project/client-support-angular -s
```

2. Once the library is imported and saved in your Angular project, provide the module `LuigiAngularSupportModule` in your app configuration:

```javascript
providers: [
  importProvidersFrom(LuigiAngularSupportModule)
]
```

> **NOTE:** For legacy Angular apps where **bootstrapModule** function is still in use, you need to import the module `LuigiAngularSupportModule` in your root NgModule:

```javascript
imports: [
  LuigiAngularSupportModule
]
```

### Features

These are the features provided by the library:
* [LuigiContextService](#LuigiContextService) - allows you to observe context changes in Luigi.
* [Preload component](#preload-component) - an empty Angular component that can be used to build a preload route. See also [preloadUrl](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=viewgroupsettings). 
* [LuigiAutoRoutingService](#LuigiAutoRoutingService) - enables the synchronization of Angular routes with Luigi. It contains the following elements: 
  * [LuigiRouteStrategy](#LuigiRouteStrategy) - Luigi's implementation of an Angular [RouteReuseStrategy](https://angular.io/api/router/RouteReuseStrategy).
  * [AutoRouting for modals](#autorouting-for-modals) - synchronizes Angular modals with Luigi.
* [LuigiMockModule](#LuigiMockModule) - an Angular module that listens to Luigi Client calls and messages and sends a mocked response back. See also [LuigiMockUtil](luigi-testing-utilities.md). 


### LuigiContextService

You can inject this service inside your Angular items in order to:
* Get the current (latest) [context](navigation-parameters-reference.md#context) that we received from Luigi Core
* Provide an `Observable<IContextMessage>` and `Signal<IContextMessage>` where through subscribing, you can get any context change

```javascript
contextSignal = signal<Context | undefined>(undefined);

constructor(private luigiContextService: LuigiContextService) {
  // check context data via Observable
  luigiContextService.contextObservable()
    .pipe(takeUntilDestroyed())
    .subscribe((data: IContextMessage) => {
      if (data) {
        this.contextSignal.set(data.context || {});
      }
    });

  // check context data via Signal
  effect(() => {
    const data: IContextMessage = luigiContextService.contextSignal()();

    if (data) {
      this.contextSignal.set(data.context || {});
    }
  });
}

```

**LuigiContextService** is an abstract class. Its implementation is in the **LuigiContextServiceImpl** class.
If you need to change or extend the implementation, you can easily create a new class extending **LuigiContextServiceImpl**:

In this class, we added the possibility to "reuse" a component and not initialize it every time you load it (as it could be useful to keep component state.)

```javascript
export class YourContextService extends  LuigiContextServiceImpl {
    ....
}

```
Inside your module, redefine the provider:

 ```javascript
providers: [
    {
        provide: LuigiContextService,
        useClass: YourContextService
    }
]
 ```

### Preload component

In your Angular route configuration, you can add in any of the following preload components:

 ```javascript
{path: 'luigi-client-support-preload',component: Sample1Component,data: { fromVirtualTreeRoot: true }}
{path: 'luigi-client-support-preload',component: Sample1Component,data: { fromVirtualTreeRoot: : {"truncate": "*/projects"} }}
{path: 'luigi-client-support-preload',component: Sample1Component,data: { fromVirtualTreeRoot: : {"truncate": "/projects"} }}
{path: 'luigi-client-support-preload',component: Sample2Component,data: { luigiRoute: '/home/sample2' }}
{path: 'luigi-client-support-preload',component: Sample2Component,data: { luigiRoute: '/home/sample2', fromContext: true}}
{path: 'luigi-client-support-preload',component: Sample2Component,data: { luigiRoute: '/home/sample2', fromContext: 'localContext'}}
 ```

Under the hood, these components make use of Luigi's [linkManager](luigi-client-api.md#linkmanager) in the following way: 

For `data: { fromVirtualTreeRoot: true }`, once we load Sample1Component, this Luigi Client API method is called:
 ```javascript
  luigiClient.linkManager().fromVirtualTreeRoot().withoutSync().navigate({route url});
 ```

 For `data: { fromVirtualTreeRoot: : {"truncate": "*/projects"} }}` or `{"truncate": "/projects"} }}`, this Luigi Client API method is called:
 ```javascript
  luigiClient.linkManager().fromVirtualTreeRoot().withoutSync().navigate({truncated url});
 ```
 In the above case, the specified string (e.g. `projects`) will be cut off from the beginning of the current micro frontend route before being sent to Luigi Core. This can be useful when the micro frontend is not served under the webroot, but under a subfolder. If the truncate string starts with `*`, the route will be truncated after the first occurrence of the string following `*`.

For `data: { luigiRoute: '/home/sample2' }`, this Luigi Client API method is called:
 ```javascript
  luigiClient.linkManager().withoutSync().navigate(data.luigiRoute);
 ```

For `data: { luigiRoute: '/home/sample2', fromContext: true }`, this Luigi Client API method is called:
 ```javascript
  luigiClient.linkManager().fromClosestContext().withoutSync().navigate(data.luigiRoute);
 ```

For `data: { luigiRoute: '/home/sample2', fromContext: 'localContext' }`, this Luigi Client API method is called:
 ```javascript
  luigiClient.linkManager().fromContext('localContext').withoutSync().navigate(data.luigiRoute);
 ```

### LuigiAutoRoutingService

This service cannot be used directly, but it provides useful features on how to synchronize your Angular application with Luigi navigation. 

For example, when the user navigates through different pages within a micro frontend, you can use this feature to update Luigi accordingly. (You can also find more information about this process in the [micro frontend routing](microfrontend-routing.md) document.)

#### LuigiRouteStrategy

To use **LuigiAutoRoutingService**, this library defines a new **RouteReuseStrategy** named **LuigiRouteStrategy**.
If you need to define your own **RouteReuseStrategy**, you can extend **LuigiRouteStrategy** by overriding it in this way:

 ```javascript
export class YourRouteStrategy extends LuigiRouteStrategy {

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        super.retrieve(route);
        // Your code
    }

}
 ```
and define the provider:
 ```javascript
 {
      provide: RouteReuseStrategy,
      useClass: YourRouteStrategy
 }
 ```

#### AutoRouting for modals

Similarly to other components, modals which have a [modalPathParam](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=modalpathparam) can trigger a change in the URL when navigation occurs. In the Angular router of your Luigi app, you can enable auto-routing for modals using these parameters: 
- `updateModalDataPath` - if set to `true`, the URL will be updated automatically every time the user navigates within a modal. 
- `addHistoryEntry` - if set to `true`, changes in the modal will also add a history element in the history of the tab.

For example: 
```javascript
{
    path: 'luigi-client-support-preload',
    component: LuigiPreloadComponent,
    data: { updateModalDataPath: true, addHistoryEntry: true }
  }
```

### LuigiMockModule

In the normal Luigi workflow, messages coming from Luigi Client to Luigi Core are processed on the Core and a proper response is sent back. However, in many systems where testing of micro frontends standalone is a necessity, the absence of Luigi Core to send back needed responses to Client micro frontends becomes a case of high coupling. To remove this coupling, we introduce **LuigiMockModule** for **Angular** applications. This module is attached to the start of your application where it intercepts all the Client calls and sends a mocked Core response back. This enables users to test their micro frontends standalone without depending on the Core. 
To use **LuigiMockModule**, simply add it to the list of imports of your applications entry point. A good practice is to include it in the main testing module of your application as given in the example below:

 ```javascript
import {LuigiMockModule} from '@luigi-project/client-support-angular';

/**
 * This module is used to run the application for e2e tests.
 */
@NgModule({
  imports: [
    AppModule,
    LuigiMockModule,
  ],
  bootstrap: [AppComponent]
})
export class AppTestingModule {}

 ```

To make mocking of Luigi Core easier, you can use a range of utility functions and assertions. Our lightweight [Luigi Testing Utilities](luigi-testing-utilities.md) library provides the necessary basic utility functions needed for your application. 


## UI5 Support Library
​
The [Luigi Client UI5 Support Library](https://github.com/luigi-project/luigi/tree/main/client-frameworks-support/client-support-ui5) offers a set [features](#features) which make it easier to use the Luigi micro frontend framework with UI5 applications.  
​
### How to use the library

1. Include the following in your `index.html` file in order to add `ComponentSupport` and allow `data-sap-ui-frameOptions`:
```javascript
<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js" data-sap-ui-resourceroots='{
				"luigi.ui5-demoapp": "./"
			}' data-sap-ui-oninit="module:sap/ui/core/ComponentSupport" data-sap-ui-compatVersion="edge"
		data-sap-ui-async="true" data-sap-ui-frameOptions="allow" data-sap-ui-theme="sap_horizon"
		data-sap-ui-xx-waitForTheme="true" data-sap-ui-xx-supportedLanguages="en,de">
</script>
```

2. Install the library either by using [npm](#installing-via-npm) (this option requires [UI5 Tooling](https://sap.github.io/ui5-tooling/stable/)), or [manually](#installing-manually).

#### Installing via npm
​
1. Import the library in your `package.json` file:
```javascript
npm install @luigi-project/client-support-ui5
```

2. If your project is not set up for use with the [UI5 Tooling](https://sap.github.io/ui5-tooling/stable/) yet, you need to install it. It is required to consume the Luigi Client UI5 Support Library.
​
3. In the last step, you need to register the library in your `Component.js` file.

Using UI5 tooling:
```javascript
sap.ui.define([
	"sap/ui/core/UIComponent",
    ....
	"@luigi-project/client-support-ui5/ui5-support-lib",
], function (UIComponent,...., Ui5SupportLib) {
    return UIComponent.extend("com.sap.luigiclient.Component", {
		....
		init: function () {
			.....			
			// connect client-support-ui5 lib to the application
			Ui5SupportLib.connectTo(this);
            
            this.LuigiClient = Ui5SupportLib.LuigiClient;
​
			this.getRouter().initialize();
		},
```
#### Installing manually

1. Create a `lib` folder under the `webapp` directory and put the [luigi-client.js](https://www.npmjs.com/package/@luigi-project/client?activeTab=code) and [ui5-support-lib.js](https://www.npmjs.com/package/@luigi-project/client-support-ui5?activeTab=code) into it.

2. Use the [shim mechanism](https://openui5.hana.ondemand.com/#/api/sap.ui.loader/methods/sap.ui.loader.config) to make Luigi Client available in your UI5 application using `sap.ui.loader.config` (the Luigi Client UI5 Support Library consumes Luigi Client via the name `@luigi-project/client/luigi-client`): 

```javascript
sap.ui.loader.config({
	// provide dependency and export metadata for non-UI5 modules
	paths: {
		"@luigi-project/client/luigi-client": "lib/luigi-client"
	},
    shim:{
        "@luigi-project/client/luigi-client": {
            amd: false,
            exports: 'LuigiClient'
        }
    }
});
sap.ui.define([
	"sap/ui/core/UIComponent",
	...
	"./lib/LuigiUI5SupportLib"
], function (UIComponent, ..., LuigiUI5SupportLib) {
	"use strict";
    return UIComponent.extend("com.sap.luigiclient.Component", {
		....
		init: function () {
			.....			
			// connect client-support-ui5 lib to the application
			Ui5SupportLib.connectTo(this);
            
            this.LuigiClient = Ui5SupportLib.LuigiClient;
​
			this.getRouter().initialize();
		},
```


In addition, the [Luigi Client API](https://docs.luigi-project.io/docs/luigi-client-api) is available through the Luigi Client UI5 Support Library. Luigi Client can be used in a controller in this way:
```javascript
const alertSettings = {
    ....
}
this.getOwnerComponent().LuigiClient.uxManager().showAlert(alertSettings).then(() => {
          // Logic to execute when the alert is dismissed
        });
```
​
### Features
​
The main features offered by the Luigi Client UI5 support library are:
- [Context](#context) - allows you to receive a context object from Luigi
- [Auto routing](#auto-routing) - provides an easier way to keep your UI5 app and Luigi routing in sync
- [Auto routing for modals](#auto-routing-for-modals) - enables synchronization of routing between Luigi Core and a modal
- [Preload](#preload) - special view that can help you when using Luigi's [viewGroups](https://docs.luigi-project.io/docs/navigation-advanced?section=view-groups) feature
​
#### Context
​
The current (latest) context object that the UI5 application receives from Luigi Core is available on the UI5 model.
​
The context object is accessible in the controller by calling:
```javascript
this.getView().getModel('$luigiCtx').getData()
```
​
In a view file, it can be used like this:
```javascript
<Button
    text="{$luigiCtx>/<CONTEXT_PROPERTY_KEY>}"/>
```
​
#### Auto routing
​
With the auto routing feature, we provide an easy way of synchronizing UI5 application routes with Luigi navigation. In the `routes` definition of the manifest file, you can add these attributes in the `data` object:
​
```javascript
{
    "pattern": "",
    "name": "products",
    "target": "products",
    "data": {
        "luigiRoute": "/app1/products"
    }
},
{
    "pattern": "settings/userSettings/developer",
    "name": "developer",
    "target": "developer",
    "data": {
        "fromContext": "usersettings",
        "luigiRoute": "developer"
    }
},
{
    "pattern": "settings",
    "name": "settings",
    "target": "settings",
    "data": {
        "fromVirtualTreeRoot": true
    }
},
{
    "pattern": "products/{productId}/sites/{siteId}",
    "name": "site",
    "target": "site",
    "data": {
        "fromVirtualTreeRoot": {
            "truncate": "*/sites"
        }
    }
}
```
​
If data `"data": {"luigiRoute": "/app1/products"}` is defined on a route, Luigi Client will be called with:
```javascript
    luigiClient.linkManager().withoutSync().navigate(data.luigiRoute);
```
with `data: { fromVirtualTreeRoot: true }`, Luigi Client API will be called in this way:
```javascript
    luigiClient.linkManager().fromVirtualTreeRoot().withoutSync().navigate({route url});
```
Additionally, it is possible to truncate the URL. Everything before and including the specified value is truncated from the URL.
For example, all but `/{sitesId}` are removed from the URL with the above configuration.
​
More information about Luigi's linkManager can be found [here](https://docs.luigi-project.io/docs/luigi-client-api/?section=linkmanager).
​
​
​
#### Auto routing for modals
​
Similarly to other views, modals which have a [modalPathParam](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=modalpathparam) which can trigger a change in the URL when navigation occurs. In the UI5 router of your Luigi app, you can enable auto-routing for modals using these parameters: 
- `updateModalDataPath` - if set to `true`, the URL will be updated automatically every time the user navigates within a modal. 
- `addHistoryEntry` - if set to `true`, changes in the modal will also add a history element in the history of the tab.
​
For example: 
```javascript
{
    "pattern": "products/{productId}",
    "name": "product",
    "target": "product",
    "data": {
        "updateModalDataPath": true,
        "addHistoryEntry": true,
        "luigiRoute":'/products/:productId'
    }
}
```
​
#### Preload
​
If you are using [view groups](https://docs.luigi-project.io/docs/navigation-advanced/?section=viewgroupsettings) in your Luigi configuration, this library provides a view which you can use as a Luigi `preloadUrl` attribute in your configuration.
The route to this view is `https://your.domain.name/__luigi_preload_view__`