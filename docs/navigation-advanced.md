<!-- meta
{
  "node": {
    "label": "Advanced navigation",
    "category": {
      "label": "Navigation",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 3,
      "position": 1
    }
  }
}
meta -->

# Advanced navigation

This document shows you how to configure the following Luigi features:

* [View groups](#view-groups)
* [Dynamically changeable paths](#dynamically-changeable-paths)
* [Contexts](#contexts)
* [Profile](#profile) 
* [Context switcher](#context-switcher) 
* [Product switcher](#product-switcher) 
* [App switcher](#app-switcher) 
* [Tab navigation](#tab-navigation)
* [Breadcrumbs](#breadcrumbs)
* [Additional options](#additional-options)

## View groups

View groups are a way to reuse micro frontends (views) in Luigi.

Imagine your application hosts two micro frontend views: `http://example.com/a#e` and  `http://example.com/b#f`. Due to hash routing and a different path up to `#`, they are, by default, rendered in different iframes. However, as they both have the **same origin**, such as `example.com`, you want to render them in the same iframe. To achieve that, define the **viewGroup** parameter for any navigation node. Children of that node will automatically be considered part of the same view group.

Nodes belonging to the same view group are always rendered in their own view group iframe. Nodes not belonging to any view group follow the same-origin iframe rendering policy.

<!-- add-attribute:class:warning -->
>**NOTE**: To make sure view groups work properly, you need to include **Luigi Client** in your micro frontend. See [this document](luigi-client-setup.md) for instructions, or for a simpler implementation include this line in your application:
`<script src="https://unpkg.com/@luigi-project/client/luigi-client.js"></script>`

You can paste this view group example in [Luigi Fiddle](https://fiddle.luigi-project.io/):

<!-- accordion:start -->

### Code example

```javascript
Luigi.setConfig({
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
```

<!-- accordion:end -->

The view groups feature also offers out-of-the-box caching. Each time you navigate to another view group, either a new iframe is created or it is reused if already exists. In both cases, the iframe you are navigating from becomes hidden and is available for you to use again. If you navigate back to the first iframe and it should be updated with new data, such when a new entry was added in the second iframe and you want to display it in a table in the first iframe, you must define a **preloadUrl** parameter for the view group under **navigation.viewGroupSettings**.

You can also preload view groups. You just need to define which URL you want to preload, and Luigi will preload the view after some user interactions when the browser is most likely to be idle. This option is active by default, but you can deactivate it with the [**preloadViewGroups**](navigation-parameters-reference.md#preloadviewgroups) configuration flag.

For more information on setting caching with view refreshing and preloading for view groups, read [this document](navigation-parameters-reference.md#node-parameters).

Further options related to view groups can be configured using the parameters listed below. These parameters should be placed just before `nodes:` in the `navigation:` section of the configuration file:

### viewGroupSettings
- **type**: object
- **description**: contains key-object pairs, where the key is the view group name as specified in the node properties, and the object contains key-value pairs. In each key-value pair, the key is the feature name and the value is the actual setting. The following options are supported:
- **attributes**:
  - **preloadUrl**(string): needs to be an absolute URL of a micro frontend belonging to a view group. It may not be an URL of a node. It is recommended that you use a dedicated small, visually empty view, which imports Luigi Client and is fine with getting an empty context, for example, without an access token. The **preloadUrl** property is also required for view group caching in case you need a view group iframe to refresh whenever you navigate back to it.
  - **loadOnStartup**(boolean): when set to `true`, it loads the respective view group with the respective **preloadUrl** in the background as soon as the app first starts. 
### preloadViewGroups
- **type**: boolean
- **description**: allows deactivating the default preloading of view group iframes.

### defaults.isolateView
- **type**: boolean
- **description**: renders all views in new frames. This setting overrides the same-domain frame reuse. The **defaults.isolateView** is disabled by default, and you can overwrite it using the **isolateView** value on a single node level.

## Dynamically changeable paths

In Luigi, you can make a navigation path dynamically changeable according to your needs. This is accomplished by defining dynamic parameters within the **pathSegement** or **viewUrl** navigation paths.

### Dynamic path parameters
Instead of a static value for your **pathSegment**, you can add a colon to this value to make it act as a parameter. This tells Luigi to accept any value for this **pathSegment**.

In this example, a sample path parameter called `:userId` is defined:

```javascript
navigation: {
    nodes: [
      {
        pathSegment: 'home',
        label: 'Home',
        viewUrl: 'https://example.com/',
        children: [
          {
            pathSegment: 'users',
            label: 'User List',
            viewUrl: 'https://example.com/users.html',
            children: [
              {
                pathSegment: ':userId',
                label: 'User Profile',
                // E.g. if userId is 'JohnSmith'
                // the main application URL will be https://[YOUR.WEBSITE]/users/JohnSmith
              }
            ]
          }
        ]
      }
    ]
  }
}
...
```

### Dynamic viewUrl parameters

You have the following options to add a parameter to **viewUrl**:
- Place the parameter anywhere in the **viewUrl** value. For example, if the main application URL is `https://[YOUR.WEBSITE]/home/users/JohnSmith`, then the **viewUrl** of the micro frontend in the content area can be `https://example.com/users/details.html#id=JohnSmith`.
- Use the [Luigi Client API](luigi-client-api.md) to access the node parameter values from the micro frontend. Use the `LuigiClient.getPathParams()` function.
For example, to get the value of the **userId** parameter, use `LuigiClient.getPathParams().userId`.
- Add a parameter to the context part of your configuration:

```javascript
{
  pathSegment: ':userId',
  label: 'User Profile',
  viewUrl: 'https://example.com/users/details.html#id=:userId;',
  context: {
    user: ':userId'
  }
}
  ...
```
If you are using [localization](https://docs.luigi-project.io/docs/i18n) and translating your page into different languages, you can also add a **{i18n.currentLocale}** parameter to the viewUrl part of your configuration:

```javascript
{
  pathSegment: 'home',
  label: 'Home',
  viewUrl: 'https://example.com/{i18n.currentLocale}/microfrontend.html',
}
  ...
```

 The **{i18n.currentLocale}** parameter will be replaced by the value of `LuigiI18N.getCurrentLocale()`, for example `https://example.com/en/microfrontend.html`

 If you are using [virtualTree](https://docs.luigi-project.io/docs/navigation-parameters-reference?section=virtualtree) and your viewUrl contains `{virtualTreePath}`, Luigi replaces this placeholder with the accumulated virtual path segments.
 Note that `{virtualTreePath}` does **not** include a leading slash — you need the `/` before the placeholder in the URL. The replacement always ends with a trailing `/`, so you can place a path suffix directly after it.
 For example, if the node's **viewUrl** is configured as:

```javascript
{
  pathSegment: ':virtualSegment_1',
  viewUrl: 'https://example.com/{virtualTreePath}?luigi=super',
  virtualTree: true
}
```
Luigi will transform the URL to `https://example.com/home/overview/?luigi=super`,

In all these cases, the parameter is automatically replaced by the real value.

### Dynamic Node parameters

You can use dynamic node parameters to build the **viewUrl** and pass them to the micro frontend specified in the navigation node selected in the navigation path.

You can specify them in the main application URL, similarly to URL query parameters with a specific prefix. The prefix is `~` by default, but you can reconfigure it using the global **nodeParamPrefix** setting.

All parameters without the prefix are not passed to the micro frontend and are consumed by the main application.

A sample **viewUrl** `https://[YOUR.WEBSITE]/home/users/allUsers?~sorting=asc&~page=2` supports sorting and pagination by introducing the **sort** and **page** node parameters.

Using dynamic node parameters in the previous example results in:

```javascript
navigation: {
    nodes: [
      {
        pathSegment: 'home',
        label: 'Home',
        viewUrl: 'https://example.com/',
        children: [
          {
            pathSegment: 'users',
            label: 'User List',
            viewUrl: 'https://example.com/users/list.html#pagenr={nodeParams.page};sort={nodeParams.sorting}',
            children: [
              {
                pathSegment: ':userId',
                label: 'User Profile',
                viewUrl: 'https://example.com/projects/details.html#id=:userId;'
              }
            ]
          }
        ]
      }
    ]
  }
}
...
```

 Use the following options to work with node parameters:

Build the **viewUrl** by placing parameters anywhere in the **viewUrl** value using the following syntax: `nodeParams.{node param name}`. For example, if the main application URL is `https://[YOUR.WEBSITE]/home/projects/?~sorting=asc&~page=2` then the **viewUrl** of a micro frontend is `https://example.com/projects/list.html#pagenr=2;sort=asc`.


### Dynamic viewUrl

You can use both dynamic node parameters and path parameters to build a **viewUrl**.

For example, if the web application URL is `https://[YOUR.WEBSITE]/something/sample_1/products?~sort=asc`, the micro frontend loads using a different URL, such as `https://example.com/project/sample_1/products?sort=asc`.

When loading, the **viewUrl** uses the following dynamic URL parameters:

- `:projectId = sample_1`
- `sort = asc`

```javascript
Luigi.setConfig({
  routing: {
    nodeParamPrefix: '~',
    showModalPathInUrl: true,
    modalPathParam: 'modal'
  },
  navigation: {
    nodes: [
      {
        pathSegment: 'something',
        label: 'Something',
        viewUrl: 'https://example.com/project',
        children: [{
          navigationContext: 'project',
          pathSegment: ':projectId',
          viewUrl: 'https://example.com/project/:projectId',
          // Optionally, you can always call LuigiClient.getPathParams() to get the parameters
          // context: {
          //  currentProject: ':projectId'
          // },
          children: [
            {
              pathSegment: 'products',
              label: 'Products',
              viewUrl: 'https://example.com/project/:projectId/products'
            }
          ]
        }]
      }
    ]
  }
});
```

## Contexts

The purpose of contexts is to send objects to the micro frontend. You can do this by adding this parameter to your node:

### context
- **type**: object
- **description**: sends the specified object as context to the view. Use this property in combination with the dynamic **pathSegment** to receive the context through the context listeners of Luigi Client. This is an alternative to using the dynamic value in the **viewUrl**.

<!-- add-attribute:class:warning -->
> **NOTE**: Context should not be used to create the path or URL as this can lead to errors. Please use one of the methods described in the [dynamically changeable paths](#dynamically-changeable-paths) section instead.


## Profile

![Profile](/assets/profile.jpg)

The profile is a drop-down list in the top navigation that allows you to override the logout item content if authorization is already configured. You can also add links to Luigi navigation nodes.

You can configure the profile element in the top navigation by adding the **profile** property to the navigation object in the configuration file. Find all the parameters which you can use to configure a profile [here](navigation-parameters-reference.md#profile).

Example:

```javascript
profile: {
  logout: {
    label: 'Sign Out'
    icon: "sys-cancel",
    customLogoutFn: myLogoutFn
  },
}
```


## Context switcher

![Context switcher](/assets/context-switcher.jpg)

The context switcher is a drop-down element in the top navigation. It allows you to switch between a curated list of navigation elements such as Environments. To do so, add the **contextSwitcher** property to the navigation object. Find all the parameters you can use to configure it [here](navigation-parameters-reference.md#context-switcher).

Example:

```javascript
contextSwitcher: {
  defaultLabel: 'Select Environment ...',
  testId: 'myTestId',
  parentNodePath: '/environments',
  lazyloadOptions: false,
  fallbackLabelResolver: (id) => (id.toUpperCase()),
  useFallbackLabelCache: true,
  options: [{label, pathValue,customRendererCategory}, {label, pathValue, customRendererCategory}],
  customSelectedOptionRenderer: (option) => {
    let color = "white";
    if (option.customRendererCategory === 'production') {
      color = "#87FF00";
    } else if (option.customRendererCategory === 'stage') {
      color = "#00C9FF";
    }
    return  `<label style="color:${color}">${option.label} </label>`;
  },
  customOptionsRenderer: (option, isSelected) => {
    let className = 'fd-menu__item' + (isSelected ? ' is-selected' : '');
    return `<a class="${className}">${option.label} test</a>`;
  },
  actions: [{label,link,position,clickHandler?}]
},
```

## Product switcher

![Product switcher](/assets/product-switcher.jpg)

The product switcher is window in top the navigation which allows you to switch between navigation elements displayed there. To add it to your application, include the **productSwitcher** property in your **navigation** object. You may also add any of the parameters listed [here](navigation-parameters-reference.md#product-switcher).

Example:
```javascript
productSwitcher: {
  label: 'My Products',
  testId: 'myTestId',
  icon: 'grid',
  items: [
    {
      icon: '',
      label: 'Luigi in Github',
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
},
```

## App switcher

![App switcher](/assets/app-switcher.jpg)

The app switcher is a dropdown at the top of the navigation which allows you to switch between applications. To use it, you need to:
1. Define a [header object](general-settings.md#headerlogo) in the `settings:` section of your Luigi configuration.
2. Add the **appSwitcher** parameter to the **navigation** object.

You may also add any of the parameters listed [here](navigation-parameters-reference.md#app-switcher).

Example:

```javascript
appSwitcher = {
  showMainAppEntry: true,
  items: [
    {
      title: 'Application One',
      subTitle: 'the first app',
      link: '/projects/pr1'
    },
    {
      title: 'Application Two',
      link: '/projects/pr2',
      subTitle: 'the second app'
    },
  ]
};
```

## Tab navigation

![Tab navigation](/assets/tabnav.jpg)

Tab-style navigation in Luigi can be displayed directly above the micro frontend area, providing you with additional menu options. When you put tab navigation nodes into a [category](navigation-configuration.md#category), they will be rendered in a drop-down. Add this parameter to your configuration to create tab navigation nodes:

### tabNav
- **type**: boolean or Object
- **description**: renders the children of the node as a horizontal navigation bar. Sub-children are not supported. When you categorize nodes, you will get a drop-down menu in the horizontal navigation. Set to `true` to show the horizontal navigation, or use the extra attributes for more customization. (**since**: v0.7.0)
- **attributes**:
  - **hideTabNavAutomatically**: boolean. In the case the node has only one child, it's possible to configure whether the horizontal navigation bar will be hidden automatically or not. Set this attribute to `true` to hide the horizontal navigation bar and `false` otherwise. ( **since**: v2.0.0 )
  - **showAsTabHeader**: boolean. If this attribute is set on the node, it will be considered as a horizontal navigation header micro frontend. The node should be [webcomponent-based](web-component.md) and it should have nested children to show on the horizontal navigation bar. (**since**: 2.2.0 )

- **example**:
```js
// Without hiding tab nav automatically 
 pathSegment: 'example', 
 label: 'Example', 
 tabNav: true,
 children: [
  ...
                
// With hiding tab nav automatically if node has only one child               
  pathSegment: 'example',
  label: 'Example',
  tabNav: { hideTabNavAutomatically: true },
  children: [
  ...

  // showing horizontal navigation header micro frontend       
  pathSegment: 'header',
  label: 'Header Micro frontend',
  viewUrl: '/tabHeader.js'
  webcomponent: true,
  tabNav: { showAsTabHeader : true },
  children: [
  ...
```

## Breadcrumbs



Luigi allows you to add [breadcrumbs](https://developer.mozilla.org/en-US/docs/Web/CSS/Layout_cookbook/Breadcrumb_Navigation) to your application. You need to create your own custom code implementing breadcrumbs. Once the breadcrumbs config is set, it is enabled by default for all nodes. If you wish to disable it for a particular node, you need to set [showBreadcrumbs](navigation-parameters-reference.md#showbreadcrumbs) to false for that node.  

In your custom code, you can choose any look and style for the breadcrumbs as well as define what should happen upon clicking them. However, the code should follow this general pattern and return the variable `breadcrumbs`: 

```js
 navigation.breadcrumbs = {
            pendingItemLabel: "not loaded yet", // string used as fallback if node label is not yet resolved
            omitRoot: false,  // if set to true, the root node in breadcrumb hierarchy is omitted 
            clearBeforeRender: true, // if set to true, the containerElement will be cleared first, before being rendered. If set to false, handling of the clear before render needs to be handled by your side 
            autoHide: true, // hide breadcrumbs when navigating to root node
            renderer: (containerElement, nodeItems, clickHandler)  => {
                  // containerElement - refers to HTML element that contains the breadcrumb structure to which you can append your own customised elements
                  // nodeItems : [{
                       label: label of node,
                       node: navigation node,
                       route: node route,
                       pending: indicates whether node label resolving state is pending or not
                  }]
                  // clickHandler(node) , can be called per node, to navigate to that node
            }
      }
```

Below is an example of a simple `breadcrumbsConfig`:

<!-- accordion:start -->

### Click to expand

```js
navigation.breadcrumbs = {
      clearBeforeRender: true,
      renderer: (el, items, clickHandler) => {
        el.classList.add('myBreadcrumb');
        let breadcrumbs = document.createElement('ol');
        breadcrumbs.setAttribute('style', 'top: 0;position: absolute;left: 0;');
        items.forEach((item, index) => {
          if (item.label) {
            let itemCmp = document.createElement('li');
            itemCmp.setAttribute('style', 'display:inline; margin: 0 10px;');
            itemCmp.setAttribute('data-testid', `breadcrumb_${item.label}_index${index}`);
            itemCmp.innerHTML = item.label;
            itemCmp._item = item;
            breadcrumbs.appendChild(itemCmp);
          }
        });
        breadcrumbs.addEventListener('click', event => {
          console.log('event detail', event);
          event.preventDefault();
          clickHandler(event.detail.item._item);
        });
        el.appendChild(breadcrumbs);
        return breadcrumbs;
      }
    };
```
<!-- accordion:end -->

Below is another example which uses UI5 Web Components breadcrumbs: 

<!-- accordion:start -->

### Click to expand

```js
config.navigation.breadcrumbs = {
            autoHide: true,
            omitRoot: false,
            pendingItemLabel: '...',
            renderer: (el, items, clickHandler) => {
              el.classList.add('dxp-breadcrumb');
              const ui5breadcrumbs =
                el.querySelector('ui5-breadcrumbs') ||
                document.createElement('ui5-breadcrumbs');
              ui5breadcrumbs.innerHTML = '';
              items.forEach((item, index) => {
                const label = item.label;
                
                if (label && !label.startsWith(':virtualSegment_')) {
                  const itemCmp = document.createElement(
                    'ui5-breadcrumbs-item'
                  );
                  itemCmp.setAttribute('href', item.route);
                  itemCmp.innerHTML = label;
                  itemCmp._item = item;
                  ui5breadcrumbs.appendChild(itemCmp);
                }
              });
              ui5breadcrumbs.addEventListener('item-click', (event) => {
                if (
                  !(
                    event.detail.ctrlKey ||
                    event.detail.altKey ||
                    event.detail.shiftKey ||
                    event.detail.metaKey
                  )
                ) {
                  event.preventDefault();
                  clickHandler(event.detail.item._item);
                }
              });
              el.appendChild(ui5breadcrumbs);

              return ui5breadcrumbs;
            },
          };
```
<!-- accordion:end -->

## Additional options

For more options and parameters which you can use to configure navigation in Luigi, read the [full parameter reference](navigation-parameters-reference.md). Some of the topics you can find there include:

* Defining the [routing](navigation-parameters-reference.md#routing-parameters) strategy of your application
* Enabling and disabling the [loading indicator](navigation-parameters-reference.md#loadingindicatorenabled)
* Hiding [navigation nodes](navigation-parameters-reference.md#hidefromnav) or [side navigation](navigation-parameters-reference.md#hidesidenav)
* Displaying content in a [modal](navigation-parameters-reference.md#opennodeinmodal)
* Adding a [badge counter](navigation-parameters-reference.md#badgecounter) to your nodes
* Defining a custom [testId](navigation-parameters-reference.md#testid) for end-to-end tests
