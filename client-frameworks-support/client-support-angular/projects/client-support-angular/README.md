# ClientSupportAngular

This library provides several features which make it easier to run your Angular application inside the Luigi micro frontend framework.
If you want to know more about Luigi, please have a look at the [Luigi homepage](https://luigi-project.io/).

> **NOTE:** Starting from v20 and on this package will only be released alongside Angular versions. So, `@luigi-project/client-support-angular@v20.0.0` will support Angular `v20.0.0` and so on. 

## How to use the library

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

## Features

These are the features provided by the library:
* [LuigiContextService](#LuigiContextService) - allows you to observe context changes in Luigi.
* [Preload component](#preload-component) - an empty Angular component that can be used to build a preload route. See also [preloadUrl](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=viewgroupsettings). 
* [LuigiAutoRoutingService](#LuigiAutoRoutingService) - enables the synchronization of Angular routes with Luigi. It contains the following elements: 
  * [LuigiRouteStrategy](#LuigiRouteStrategy) - Luigi's implementation of an Angular [RouteReuseStrategy](https://angular.io/api/router/RouteReuseStrategy).
  * [AutoRouting for modals](#autorouting-for-modals) - synchronizes Angular modals with Luigi.
* [LuigiMockModule](#LuigiMockModule) - an Angular module that listens to Luigi Client calls and messages and sends a mocked response back. See also [LuigiMockUtil](https://docs.luigi-project.io/docs/luigi-testing-utilities). 


### LuigiContextService

You can inject this service inside your Angular items in order to:
* Get the current (latest) [context](https://docs.luigi-project.io/docs/navigation-advanced?section=contexts) that we received from Luigi Core
* Provide an `Observable<IContextMessage>` and `Signal<IContextMessage>` where through subscribing, you can get any context change

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

### LuigiAutoRoutingService

This service cannot be used directly, but it provides useful features on how to synchronize your Angular application with Luigi navigation. 

For example, when the user navigates through different pages within a micro frontend, you can use this feature to update Luigi accordingly. (You can also find more information about this process in the [micro frontend routing](https://docs.luigi-project.io/docs/microfrontend-routing) document.)

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

Under the hood, these components make use of Luigi's [linkManager](https://docs.luigi-project.io/docs/luigi-client-api?section=linkmanager) in the following way: 

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


### LuigiRouteStrategy

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

### AutoRouting for modals

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

To make mocking of Luigi Core easier, you can use a range of utility functions and assertions. Our lightweight [Luigi Testing Utilities](https://docs.luigi-project.io/docs/luigi-testing-utilities) library provides the necessary basic utility functions needed for your application. 

