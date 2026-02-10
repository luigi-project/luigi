<!-- meta
{
  "node": {
    "label": "Navigation parameters reference",
    "category": {
      "label": "Navigation",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 3,
      "position": 4
    }
  }
}
meta -->

# Navigation parameters reference

<!-- add-attribute:class:success -->
> **TIP:** To see the navigation parameters in use, see the [navigation configuration example](navigation-configuration-example.md) or configure a test application in the [Luigi Fiddle](https://fiddle.luigi-project.io).

Use the parameters and functions in this reference to configure your Luigi navigation structure.

* [Routing parameters](#routing-parameters)
* [Navigation parameters](#navigation-parameters)
* [Node parameters](#node-parameters)
* [Profile](#profile)
* [Context switcher](#context-switcher)
* [Product switcher](#product-switcher)
* [App switcher](#app-switcher)
* [Global search](#global-search)


## Routing parameters
You can configure the way Luigi tackles routing in your application in the `routing:` section of the configuration file. For example, you can choose the routing strategy to apply in your application as either hash or path location routing.

### disableBrowserHistory
  - **type** boolean
  - **description**: defines either if browser history is enabled or not.
  - **default**: `false`

### modalPathParam
- **type**: string
- **description**: sets the parameter name when using the `LuigiClient.linkManager().openAsModal()` function, which provides a simple way to bookmark a modal view URL. It is appended as query param to the base URL. An example would be `example.com/your/path?modal=/another/path`. This setting requires [`routing.showModalPathInUrl`](#showModalPathInUrl) to be set to `true` to be effective.
- **default**: the default parameter name is `modal`, but you may also define a custom one.

### nodeParamPrefix
- **type**: string
- **description**: sets the prefix character when using the `LuigiClient.linkManager().withParam()` function, which provides a simple way to attach query parameters to a view URL for activities such as sorting and filtering. Only this prefix can pass query parameters to micro frontends. A different prefix has to be used to pass parameters to the Luigi app itself to avoid potential conflicts between the two.
- **default**: the default prefix character is `~`, but you may also define a custom one.

### pageNotFoundHandler
- **type**: any
- **description**: defines custom behavior when a `404` error occurs.  Luigi handles it by default. Leave its body empty if you have an external `404` handling. You can return an Object with **redirectTo** and  **keepURL** as parameters. You can use the **redirectTo** parameter if you want Luigi to redirect to a specific navigation path after execution. Setting the **keepURL** parameter to `true` will keep the erroneous URL onto the browser's address bar.
If you don't want Luigi to handle the page not found error, because you've implemented your own function for this purpose, you can return an Object with  **ignoreLuigiErrorHandling** set to `true`. 
- **attributes**:
  - **wrongPath** (string): the path that the user tried navigating to.
  - **wasAnyPathFitted** (bool): it is true if Luigi managed to fit a valid path which means **wrongPath** was only partially wrong. Otherwise it is false.

### preserveQueryParams
- **type**: boolean
- **description**: defines if query parameters are persisted in the URL after path changes.
- **default**: the default is `false`, which means query parameters are not persisted in the URL after navigation request.

### replaceIntentRoute
  - **type** boolean
  - **description**: defines if intent navigation route resolves to actual path automatically or not.
  - **default**: `false`

### showModalPathInUrl
- **type**: boolean
- **description**: defines if modal paths are persisted in the URL to make them bookmarkable. The query param which is used as persistence can be configured with [`routing.modalPathParam`](#modalPathParam) setting.
- **default**: the default is `false`, which means no modal paths are shown in the URL.

### skipRoutingForUrlPatterns
- **type**: RegExp[]
- **description**: defines regex patterns the router will skip when listening for path changes. This parameter is used for excluding **redirect_uri** parameters.
- **default**: the default patterns are `[/access_token=/, '/id_token=/]`.

### useHashRouting
- **type**: boolean
- **description**: defines either hash-based (`example.com/#/yourpath`) or path-based (`example.com/yourpath`) routing.
- **default**: the default is `false`, which means path routing is used.

## Navigation parameters
The navigation parameters allow you to configure **global** navigation settings directly under the `navigation:` section in the configuration file.

### addNavHrefs
- **type**: boolean
- **description**: if set to `true`, proper href attributes are added to all navigation links. It is set to `false` by default.
- **since**: v0.7.4

### defaults.category
- **type**: object
- **description**: defines a default `title` for all expand and collapse buttons on categories. It is possible to override the default to define a title on an individual [category](navigation-parameters-reference.md#category) by itself.
- **attributes**:
  - **titleExpandButton** adds the HTML `title` attribute with the defined value to the expand button.
  - **titleCollapseButton** adds the HTML `title` attribute with the defined value to the collapse button.
- **since**: 1.26.0
- **example**:
```javascript
config.navigation.defaults = {
    category: {
         titleExpandButton: 'Expand category',
         titleCollapseButton: 'Collapse category',
    }
}
```

### defaults.isolateView
- **type**: boolean
- **description**: renders all views in new frames. This setting overrides the same-domain frame reuse.
- **default**: the parameter **defaults.isolateView** is `false` by default, and you can overwrite it using the **isolateView** value on a single node level.
- **example**:
```javascript
config.navigation.defaults = {
  isolateView: true
}
```

### defaults.pageErrorHandler
<!-- add-attribute:class:warning -->
> **NOTE**: The **pageErrorHandler** only works if the [loading indicator](#loadingindicatorenabled) is not disabled.

- **type**: object
- **description**: gives you the possibility to handle a situation in which Luigi Client doesn't respond. By default, it will redirect to the home page if nothing else is specified. **timeout** is required.
- **default**: the parameter **defaults.pageErrorHandler** is not specified by default, and you can overwrite it using the **pageErrorHandler** value on a single node level.
- **attributes**:
  - **timeout** amount of time in milliseconds after which redirection will take effect.
  - **viewUrl** specifies the location to redirect to on the micro frontend level (the main URL is not changed).
  - **redirectPath** specifies the location to redirect to on the Luigi level (the main URL is changed).
  - **errorFn** used to handle different scenarios other than redirection.
- **since**: v1.0.1
- **example**:
```javascript
config.navigation.defaults = {
    pageErrorHandler: {
         timeout: 500,
         viewUrl: '/some/view/url',
         redirectPath: '/projects/pr2',
         errorFn: ()=> {}
    }
}
```

### defaults.sideNavAccordionMode
- **type**: boolean
- **description**: overrides the default behaviour of categories whether multiple categories can be collapsed. When set to `true`, only one category is collapsed. The navigation is similar to an accordion; when the user clicks another category the previously collapsed category is closed and the new one is opened.
- **default**: `false`
- **example**:
```javascript
config.navigation.defaults = {
  sideNavAccordionMode: true
}
```

### defaults.tooltipText
- **type**: boolean | string
- **description**: applies the [tooltipText](navigation-parameters-reference.md#tooltiptext) property to all navigation nodes where it is not set explicitly. If it is `false`, all tooltips will be hidden. If it is `Some string text`, all tooltips will have the value `Some string text`.
- **default**: the parameter **defaults.tooltipText** is `undefined` by default.
- **example**:
```javascript
 config.navigation.defaults = {
  tooltipText: 'Default tooltip text'
}
```

### intentMapping
- **type**: array
- **description**: contains an array of abstract intent objects that can be used to navigate through micro frontends through the [LuigiClient linkManager.navigate()](luigi-client-api.md#navigate) method. The attributes contained in each intent object of the array are abstract notations which can be used to define the target mapping of your desired intent navigation in a semantic way.
Check our [Advanced Scenarios](advanced-scenarios.md) page for an example.
- **attributes**:
  - **semanticObject**(string): may represent a business entity such as a sales order or a product. It enables navigating to such entities in an abstract implementation-independent way. It can only only contain alphanumerical characters.
  - **action**(string): defines an operation, i.e.: `display`, `approve` or `edit`. The operation is intended to be performed on a **semanticObject** such as a sales order or a certain product. It can only contain alphanumerical characters but also the underscore character.
  - **pathSegment**(string): represents the target of the navigation. In order to use it as a target link, it has to be defined under navigation nodes in the Luigi configuration.
  - **externalLink**(object): used to resolve the intent to an external link. This parameter is optional. When used, the **pathSegment** parameter is ignored.
    - **attributes**:
      - **url**(string): URL the intent gets resolved to.
      - **openInNewTab**(boolean): if set to `true`, opens the specified URL in a new tab. Otherwise, it opens it in the current tab.

### nodeAccessibilityResolver
- **type**: any
- **description**: receives all values defined in the node configuration. It allows you to define a permission checker function that gets executed on every node. If it returns `false`, Luigi removes the node and its children from the navigation structure. See [angular navigation.js](../test/e2e-test-application/src/luigi-config/extended/navigation.js) for an example.

### nodeChangeHook
- **type**: function
- **description**: allows you to invoke and execute a specific function on the global level when a request to navigate to the node occurs. The function receives two node objects as input parameters: the previous node and current node, as described in the configuration. An additional third parameter contains an auxiliary data object with the property `currentContext`, containing the fully resolved context object that has been sent to the micro frontend.

### nodes
- **type**: array | object
- **description**: You can define navigation nodes using the `nodes:` attribute. First-level nodes are also referred to as "root nodes". Second-level nodes can be defined inside a [children](#children) array below the root node. 

In addition to an array, `nodes:` can also be defined as a single node object which then serves as the root node. 
In this case, the root node should not have a [pathSegment](#pathsegment) defined, because it is accessible through the empty path. If you define a `pathSegment` anyway, you should see a warning about this in the console. 

- **example**: 
```js
// Nodes array 
navigation: {
  nodes:[{
      pathSegment: 'home'
      label: 'Root node',
      viewUrl: 'home.html',
      children: [
        {
          pathSegment: 'sample1',
          label: 'Sample',
          viewUrl: 'sample1.html'
        }
      ]
  }]
}

// Root node as an object
navigation: {
  nodes:{
      label: 'Root node',
      viewUrl: 'home.html',
      children: [
        {
          pathSegment: 'sample1',
          label: 'Sample',
          viewUrl: 'sample1.html'
        }
      ]
  }
}
...
```

### preloadViewGroups
- **type**: boolean
- **description**: allows deactivating the default preloading of [view groups](navigation-advanced.md#view-groups) iframes.

### validWebcomponentUrls
  - **type**: array
  - **description**: a list of allowed web component URLs. They must be added as regular expressions to the array.
  - **example**:
```javascript
settings: {
  navigation: {
    validWebcomponentUrls:[
      'https\:\/\/YOURPROJECT\.gitlab\.io\/.?'
    ]
  }
```

### viewGroupSettings
- **type**: object
- **description**: contains key-object pairs, where the key is the view group name as specified in the node parameters, and the object contains key-value pairs. In each key-value pair, the key is the feature name and the value is the actual setting. The following options are supported:
- **attributes**:
  - **noClientCheck**(boolean): when set to `true`, it prevents a navigation check when reactivating the iframe
  - **preloadUrl**(string): needs to be an absolute URL of a micro frontend belonging to a view group. It cannot be an URL of a node. It is recommended that you use a dedicated small, visually empty view, which imports Luigi Client and is fine with getting an empty context, for example, without an access token. The **preloadUrl** parameter
 is also required for view group caching in case you need a view group iframe to refresh whenever you navigate back to it.
  - **loadOnStartup**(boolean): when set to `true`, it loads the respective view group with the respective **preloadUrl** in the background as soon as the app first starts.

### globalContext
- **type**: object
- **description**: contains key-object pairs which are inherited from all node contexts.

## Node parameters
Node parameters are all the parameters that can be added to an individual navigation node in the `nodes:` section of the Luigi configuration file.

### altText
- **type**: string
- **description**: adds the HTML `alt` attribute to an icon. Note that this property only applies to icons with a defined absolute or relative path.

### anonymousAccess
- **type**: boolean or "exclusive"
- **description**: when set to `true`, the node is always accessible. When set to `exclusive`, the node is only visible in logged-out state. Requires **auth.disableAutoLogin** to be set to `true`. **anonymousAccess** needs to be defined both on parent and child nodes.

### badgeCounter
- **type**: object
- **description**: adds a badge with a number and a label to a node. Nodes that are part of a category show a cumulated number of all badges in this category.
- **attributes**:
  - **label** is the label of the badge.
  - **count** is a function or asynchronous function that returns a number.
  Gets updated when you click the navigation. Use `Luigi.navigation().updateTopNavigation()` in Luigi Core or trigger it in Luigi Client by using the custom message feature.

### category
- **type**: string or object
- **description**: defines a group of views separated with a headline and an icon. You should define at least one node in a group as an Object with **label** and **icon** attributes. For all other nodes, you can set **category** as a string with the `label` value.
- **attributes**:
  - **label** is a string that represents the title of the category.
  - **icon** is the name of an icon, without the `sap-icon--` prefix. Its source may be [OpenUI5](https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html) or a custom link (relative or absolute) to an image. It is recommended to use a square image. The icon is displayed next to the node label in the side navigation or instead of the label in the top navigation. In case you accidentally define different icons in a category group, only the first one is used.
  - **altText** adds the HTML `alt` attribute to an icon. Note that this property only applies to icons with a defined absolute or relative path.
  - **collapsible** if set to `true`, category items are hidden at first. To expand them, click the main category node.
  - **testId** is a string where you can define your own custom `testId` for  E2E tests. If nothing is specified, it is the node's label written as one word in lower case, for example`label`.
  - **id** if this property is defined all nodes with the same category `id` will be grouped.
  - **titleExpandButton** adds the HTML `title` attribute with the defined value to the expand button.
  - **titleCollapseButton** adds the HTML `title` attribute with the defined value to the collapse button.

### children
- **type**: array | function
- **description**:  in this element, you can specify children nodes. All children nodes will have the same parent prefix URL.
You can also return a Promise that resolves to an array of nodes. Which can be useful if the child nodes aren't available immediately and need to get fetched asynchronously.
For example, if you look at our [Fiddle showcase](https://fiddle.luigi-project.io/), you will see that home node has different children: this hierarchy will be reflected in children URLs.
```javascript
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
                title: 'Welcome to Luigi Fiddle!',
                content: 'Click on "Modify Config" at the bottom right and play around with your Luigi configuration'
            }
        },
        ...
        {
            pathSegment: 'ui5sc',
            label: 'Shopping Cart',
            category:  'UI5 Demo Pages',
            hideSideNav: true,
            loadingIndicator: {
                enabled: false
            },
            viewUrl: 'https://sdk.openui5.org/test-resources/sap/m/demokit/cart/webapp/index.html'
        }]
    ...
    }]
}

// Example of Children as a Promise
navigation: {
  nodes: [{
    ...,
    children:  () => {
      return new Promise((resolve, reject) => {
        fetch('/node/endpoint').then((...)=>{
        ...
          resolve(nodes);
        });
      })
    },
    ...
  }]
}
```

### clientPermissions.changeCurrentLocale
- **type**: boolean
- **description**: current locale can be changed from client using the corresponding API if this is set to `true`
- **example**:
    ```javascript
    clientPermissions: {
      changeCurrentLocale: true
    }
    ```

### clientPermissions.urlParameters
- **type**: object
- **description** Specify if the micro frontend behind this node can read and write the Luigi Core search query parameter. See also [Routing API](luigi-core-api.md#routing)
- **example**:
```javascript
clientPermissions:{
  urlParameters:{
    q:{
      write: true,
      read: true
    }
  }
}
```

### compound
- **type**: object
- **description**: It is possible to compound web components in one micro frontend. Within this object, the layout of the web components can be defined. In addition, you can configure nested web components. In that case the parent web component has to be defined by a slot with a name to plug in the child web component. For example `<header><slot name="header">header</slot></header>`.
Web components can communicate over an event bus.
- **attributes**:
  - **renderer**:
    - **type**: object
    - **description**: meta information about the layout of the compound web components
    - **attributes**:
      - **use**:
        - **type**: string OR object
        - **description**: You can define a CSS layout, like the CSS `grid`, or implement an extended layout by defining an object using the `extends` property. In that case you have the possibility to implement the following functions to manipulate the standard renderer.
        - **attributes**:
          - **extends**
            - **type**: string, e.g. `grid`
            - **description**:
          - **createCompoundContainer**
            - **type**: function
            - **description**: This function gets the grid layout `config` object as parameter.
          - **createCompoundItemContainer**
            - **type**: function
            - **description** This function gets a the grid layout `config` object and the layout config object for the item.
          - **attachCompoundItem**
            - **type**: function
            - **description** This function allows you to attach custom HTML to the item. This function gets the whole HTML container of the compound items and the item container as parameter.
      - **config**:
        - **type**: object
        - **description**: defines the configuration object of the grid layout
        - **attributes**:
          - **columns**: represents the css `grid-template-columns`, e.g `1fr 2fr` .
          - **rows**: represents the css `grid-template-rows`, e.g. `150px 150px`.
          - **gap**: represents the css `grid-gap`, e.g. `auto`.
          - **min-height** min height
          - **layouts**
            - **type**: array
            - **description**: defines the configuration objects of the grid layout for media queries.
            - **attributes**:
              - **columns**: represents the css `grid-template-columns`, e.g `1fr 2fr` .
              - **rows**: represents the css `grid-template-rows`, e.g. `150px 150px`.
              - **gap**: represents the css `grid-gap`, e.g. `auto`.
              - **min-width** min width
              - **max-width** max width
  - **lazyLoadingOptions**
    - **type**: object
    - **description**: allows enabling lazy loading for compound or nested web components
    - **attributes**
      - **enabled**
        - **type**: boolean
        - **default**: false
        - **description**: This will activate lazy loading. In that case, an [intersection observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) will be used to attach and render only children that are within a defined part of the brower's [viewport](https://developer.mozilla.org/en-US/docs/Glossary/Viewport). The empty containers for all children will be added but the intersection observer makes sure that web components will only be added to the containers that are inside that defined part of the viewport.
      - **intersectionRootMargin**
        - **type**: string
        - **default**: "0px"
        - **description**: This allows setting the [`rootMargin` option for the intersection observer](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#rootmargin). In short, this allows configuring that child web components are instantiated before or after their containers enter the viewport.
      - **temporaryContainerHeight**
        - **type**: string
        - **default**: "500px"
        - **description**: When lazy loading is active, the containers for all children will be created with a fixed, temporary height. That is because otherwise, when adding the empty containers for all children, all containers would have a height of 0. All containers would be visible so that all web components would be added right away. In other words, this would break lazy loading.

          This attribute must be a valid CSS height string. Its value will be used for the default temporary height for all children. Individual children can override this default with their own value, see below.

          After the web component of a child is rendered and attached to its container, the temporary height will be removed from the container.
      - **noTemporaryContainerHeight**
        - **type**: boolean
        - **default**: false
        - **description**: When implementing a custom renderer for a compound web component, the standard behavior of lazy loading of setting and removing temporary heights to the child containers may conflict with the custom renderer. In that case, setting this attribute to `true` will turn off that behavior. In that case, the custom renderer methods and the code of the child web components must ensure that not all child containers are visible right away. Note that the intersection observer will still be in effect: child web components will only be instantiated and added to their containers when the containers are visible in the defined part of the viewport.
  - **children**
    - **type**: array
    - **description**: Array of web component nodes.
    - **attributes**:
      - **id**: unique `id` of the web component.
      - **viewUrl**: URL which points to the web component `.js` file. If you are using [localization](https://docs.luigi-project.io/docs/i18n) and translating your page into different languages, you can also add a **{i18n.currentLocale}** parameter to the viewUrl part of your configuration.
      - **context**: object, which you can pass to the web component.
      - **layoutConfig**:
        - **type**: object
        - **attributes**
          - **row**
            - **type**: string
            - **default**: "auto"
            - **description**: Sets the `grid-row` value in the [CSS grid standard](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout). Use it to define the position of the child item in the grid.
          - **column**
            - **type**: string
            - **default**: "auto"
            - **description**: Sets the `grid-column` value in the [CSS grid standard](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout). Use it to define the position of the child item in the grid.
          - **slot**
            - **type**: string
            - **default**: ""
            - **description**: If you want to use the mechanism of nested web components, you can use this instead of `row` and `column` to define the slot into which to render this child. In that case this web component node will be plugged in that slot of the parent web component.
          - **temporaryContainerHeight**
            - **type**: string
            - **default**: undefined
            - **description**: If lazy loading is active for this compound web component then setting this attribute will define the temporary container height for this individual child. It will override the general default value of `temporaryContainerHeight` that is set for the overall compound.
      - **eventListeners**
        - **type**: array
        - **description**: array of events.
        - **attributes**:
          - **source**: `id` of the web component, which you want to listen. Alternatively you can set an asterisk, e.g. `*`
          - **name**: name of the event, which this web component is listening to.
          - **action**: type of the event, such as `update`.
          - **dataConverter**
            - **type** function
            - **description** This function gets the data object as parameter. If the received data are in a different format, you can use this function to convert the data.
- **example**:
```javascript
{
    pathSegment: 'webcomponent',
    label: 'Webcomponent',
    icon: 'along-stacked-chart',
    loadingIndicator: {
      enabled: false
    },
    context: {
      title: 'Hello WebComponent!'
    },
    viewUrl: '/helloWorldWC.js',
    webcomponent: true,
    openNodeInModal: true
  },
```

Below is Luigi's web component example configuration which shows 3 web components in a grid layout. It also includes the configuration for the event bus. The `input` web component sends the typed input. The `header` web component listens to a `sendInput` event from a web component with the id `input1`. Received data will be converted. An `update` event will be triggered, changing the `header` web component where an `update` event listener is registered.

```javascript
{
        pathSegment: 'wc_grid',
        label: 'Grid',
        category: {
          label: 'Compound',
          icon: 'attachment-html',
          collapsible: true
        },
        compound: {
          renderer:
          {
            use: 'grid',
            config: {
              columns: '1fr 1fr 1fr',
              /*rows: '150px',*/
              /*gap: '30px',*/
              layouts: [{
                minWidth: 0,
                maxWidth: 600,
                columns: '1fr',
                gap: 0
              }, {
                minWidth: 600,
                maxWidth: 1024,
                columns: '1fr 1fr',
                gap: '30px'
              }]
            }
          },
          children: [{
            viewUrl: 'URL_TO_HEADER_WEBCOMPONENT/panelHeader.js',
            context: {
              title: 'My Awesome Grid',
              description: 'Really awesome'
            },
            layoutConfig: {
              row: "1",
              column: "1 / -1"
            },
            eventListeners: [{
              source: 'input1',
              name: 'sendInput',
              action: 'update',
              dataConverter: (data) => {
                return 'new text: ' + data;
              }
            }]
          }, {
            id: 'input1',
            viewUrl: 'URL_TO_SOME_WEBCOMPONENT/input.js',
            context: {
              title: 'Some input test',
              instant: true
            }
          },
          {
            viewUrl: 'URL_TO_FOOTER_WEBCOMPONENT/panelFooter.js',
            context: {
              footer: 'This is the end of awesomeness'
            },
            layoutConfig: {
              column: "1 / -1"
            }
          }]
        }
      }
```
- **since**: 1.7.0

### context
- **type**: object
- **description**: sends the specified object as a context to the micro frontend.


### defaultChildNode
- **type**: string
- **description**: sets the child node that Luigi activates automatically if the current node has no **viewUrl** defined. Provide **pathSegment** of the child node you want to activate as a string.

<!-- add-attribute:class:warning -->
>**NOTE:** To define a root-level **defaultChildNode** which is different than the first header navigation node, set an object with **defaultChildNode** and **children** set to `navigation.nodes` instead of an array of nodes.

- **example**:
```javascript
settings: {
  navigation: {
    nodes: {
      defaultChildNode: 'overview',
      children: [
        {
          pathSegment: 'docs',
          label: 'Documentation',
          viewUrl: '...'
        },
        {
          pathSegment: 'overview',
          label: 'Overview',
          viewUrl: '...'
        }
      ]
    }
  }
```


### defaults.runTimeErrorHandler

<!-- add-attribute:class:warning -->
> **NOTE**:  The **runTimeErrorHandler** only works if the micro frontend uses Luigi Client and [disable-luigi-runtime-error-handling](advanced-options-luigi-client.md#disable-luigi-core-runtime-error-handling) is not disabled.

- **type**: object
- **description**: allows you to handle errors on the Core level. The error handler receives all unhandled errors from the micro frontends which are using the Luigi Client.
- **default**: the parameter **defaults.runTimeErrorHandler** is not specified by default, and you can overwrite it using the **runTimeErrorHandler** value on a single node level.
- **attributes**:
  - **errorFn**:(function) gets an object `error` as parameter. The properties of this object are the properties of the [error event](https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent). The inherited properties from [event](https://developer.mozilla.org/en-US/docs/Web/API/Event) are not part of the object. Current node is the second parameter.
- **example**
```javascript
runTimeErrorHandler: {
   errorFn: (error, currentNode)=>{}
}
```
- **since**: 1.15.0

### drawer
- **type**: object
- **description**: opens a view in a drawer. Use these settings to configure if the drawer has a header, backdrop and size.
- **attributes**: 
  - **header**: boolean or object: By default, the header is visible. Title is node label and `x` is displayed to close the drawer view. The header could also be an object with a title attribute to specify an own title for the drawer component.
  - **backdrop**: boolean: By default, it is set to false. If it is set to true the rest of the screen has a backdrop.
  - **size**: `("l" | "m" | "s" | "xs")` size of the drawer (optional, default "s")
- **since**: 1.6.0

### externalLink
- **type**: object
- **description**: indicates that the node links to an external URL. If this parameter is defined, **pathSegment** and **link** parameters are ignored.
- **attributes**:
  - **sameWindow** defines if the external URL is opened in a new or current tab. The default value for this parameter
 is `false`.
  - **url** is the external URL that the node leads to. If you are using [localization](https://docs.luigi-project.io/docs/i18n) and translating your page into different languages, you can also add a **{i18n.currentLocale}** parameter to the URL part of your configuration.

### hideFromNav
- **type**: boolean
- **description**: shows or hides a navigation node. You can still navigate to the node but it does not show up in the top or left pane.

### hideGlobalSearch
- **type**: boolean
- **description**: if set to `true`, the global search disappears when you click the affected node.
- **default**: `false`

### hideSideNav
- **type**: boolean
- **description**: if set to `true`, the left navigation disappears when you click the affected node.
- **default**: `false`

### icon
- **type**: string
- **description**: the name of an icon, without the `sap-icon--` prefix. Its source may be [OpenUI5](https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html) or a custom link (relative or absolute) to an image. It is recommended to use a square image. The icon is displayed next to the node label in the side navigation or instead of the label in the top navigation. To show the label next to the icon in the top navigation, add the `showLabel` attribute.

### intendToHaveEmptyViewUrl
- **type**: boolean
- **description**: when set to `true`, it forces navigation to the empty **viewUrl** node.

### isolateView
- **type**: boolean
- **description**: renders the view in a new frame when you enter and leave the node. This setting overrides the same-domain frame re-usage.
- **default**: `false`

### keepSelectedForChildren
- **type**: boolean
- **description**: focuses the navigation on its current hierarchy, omitting the display of children.

### label
- **type**: string
- **description**: contains the display name of the navigation node.

### link
- **type**: string
- **description**: refers to an absolute path in the navigation structure or a relative path to a grandchild of the current path. If this parameter is defined, **pathSegment** is ignored.

### loadingIndicator.enabled

<!-- add-attribute:class:warning -->
> **NOTE**: For iframe integration of views, which don't have Luigi Client, loading indicator should be disabled.

- **type**: boolean
- **description**: shows a loading indicator when switching between micro frontends. If you have a fast micro frontend, you can disable this feature to prevent flickering of the loading indicator.
- **default**: `true`
- **example**:
    ```javascript
    loadingIndicator: {
      enabled: false
    }
   ```
### loadingIndicator.hideAutomatically
- **type**: boolean
- **description**: if set to `false`, it disables the automatic hiding of the loading indicator once the micro frontend is loaded. It is only considered if the loading indicator is enabled. It does not apply if the loading indicator is activated manually with the `LuigiClient.uxManager().showLoadingIndicator()` function. If the loading indicator is enabled and automatic hiding is disabled, use `LuigiClient.uxManager().hideLoadingIndicator()` to hide it manually in your micro frontend during the startup.
- **default**: `true`
- **example**:
    ```javascript
    loadingIndicator: {
      hideAutomatically: false
    }
    ```

### navigationContext
- **type**: string
- **description**: contains a named node that is mainly for use in combination with a dynamic **pathSegment** to start navigation from a dynamic node using ` LuigiClient.linkManager().fromContext('contextname')`.


### onNodeActivation
- **type**: function
- **description**: executed when a request to navigate to the node occurs. As an input parameter, the function receives the node object as described in the configuration. This function can return results synchronously or asynchronously. If the function returns boolean `false`, the navigation is not triggered, otherwise, navigation renders as usual.

### openNodeInModal
- **type**: boolean or object
- **description**:  configures the settings of a view which opens in a modal. You can set the **openNodeInModal** parameter to `true` to use the default modal title and size, or you can specify them using these attributes:
- **attributes**:
  - **title** is the modal title. By default, it is the node label. If there is no label, it is left empty.
  - **size** specifies the size of the modal. The default size is `l`, which means 80% of the main window size. You can also use `m` (60%) and `s` (40%) to set the modal size or
  - **width** and **height** can be used to specify the size of the modal more precisely. In that case, the **size** attribute is not needed. Allowed units are `%`, `px`, `rem`, `em`, `vh` and `vw`.

### pageErrorHandler
<!-- add-attribute:class:warning -->
> **NOTE**: The **pageErrorHandler** only works if the [loading indicator](#loadingindicatorenabled) is not disabled.

- **type**: object
- **description**: gives you the possibility to handle a situation in which Luigi Client doesn't respond. By default, it will redirect to the home page if nothing else is specified. **timeout** is required.
- **attributes**:
  - **timeout** amount of time in milliseconds after which redirection will take effect. (For example, `timeout: 500`).
  - **viewUrl** specifies the location to redirect to on the micro frontend level (the main URL is not changed).
  - **redirectPath** specifies the location to redirect to on the Luigi level (the main URL is changed).
  - **errorFn** used to handle different scenarios other than redirection.
  - **since**: v1.0.1

### pathSegment
- **type**: string
- **description**: specifies the partial URL of the current segment. **pathSegment** must not contain slashes.
- **examples**:
  - A static **pathSegment** of value `settings` results in `example.com/settings`.
  - A dynamic **pathSegment** is prefixed with a colon and can load any value. Find out more about dynamic paths in Luigi [here](navigation-advanced.md#dynamically-changeable-paths).

### showBreadcrumbs
- **type**: boolean
- **description**: if a breadcrumbs configuration is set, the breadcrumbs will show for all nodes by default. This property allows you to disable breadcrumbs for any particular node by setting it to `false` for that node. See the [advanced navigation](navigation-advanced.md#breadcrumbs) document for more information.
- **example**:
```javascript
navigation: {
  nodes: [{
    pathSegment: 'home',
    showBreadcrumbs: false, 
...
```

### sideNavAccordionMode
- **type**: boolean
- **description**: overrides the default behaviour of categories whether multiple categories can be collapsed. When set to `true`, only one category is collapsed. The navigation is similar to an accordion; when the user clicks another category the previously collapsed category is closed and the new one is opened. Note that this will be applied to its direct children.
- **default**: `false`

### statusBadge
- **type**: object
- **description**: Allows you to set a status badge for this node. The status badge is a small label next to the title of the node, based on the Fundamental Styles [object status](https://sap.github.io/fundamental-styles/?path=/docs/sap-fiori-components-object-status--docs).
- **attributes**:
  - **label**: string specifying the text displayed on the status badge.
  - **type**: string. Allowed values are `negative`, `positive`, `critical`, `informative`, or `neutral`. The default is `neutral`.
  - **align**: string. Defines the alignment of the status badge. Allowed values are `right` or `left`. The default is `left`.
- **example**:
    ```javascript
    {
      pathSegment: 'settings',
      label: 'Settings',
      viewUrl: '/sampleapp.html#/settings',
      statusBadge: {
        label: 'Settings',
        type: 'positive'
      }
    }
    ```
 - **since**: 1.25.0

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

### testId
- **type**: string
- **description**: allows you to define your own custom **testId** to be used in E2E tests. If you do not specify it, it is a combination of the node's **pathSegment** followed by an underscore and the label, written as one word in lower case. If the **pathSegment** does not exist, the **testId** includes the label only. This way, you can have `pathsegment_label` or `label`.

### tooltipText
- **type**: string
- **description**: Allows to set a custom tooltip text for this node or to disable the tooltip by setting the value to `false`.
- **default**: it is `undefined` by default, and it can be overwritten by using the **tooltipText** value on a single node level.
- **example**:
```javascript
tooltipText: 'Useful links'
```

### topNav
- **type**: boolean
- **description** children of the root node will not be rendered in the top navigation if this value is set to `false`. Instead, the children will be rendered in the left navigation (default) or in the horizontal navigation ([tabNav](#tabNav)) if this is configured on the node. This feature only works if the [nodes](#nodes) property is an object instead of an array. In that case, the root node will not be reflected in the URL.
- **default**: The default is `true`, meaning that children of the root node show in the top navigation.
- **example**:
```javascript
navigation: {
  nodes: {
    pathSegment: "",
    hideFromNav: true,
    tabNav: true,
    topNav: false,
    hideSideNav: true,
    viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
    context: {
        title: 'root'
    },
    children: [
    {
      pathSegment: "SampleApp1",
      label: "SampleApp1",
      viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
      context: {
          title: 'Sample app 1',
          content: 'Sample app 1'
      }
    },
    {
      pathSegment: "SampleApp2",
      label: "SampleApp2",
      viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
      context: {
          title: 'Sample app 2',
          content: 'Sample app 2'
      }
    }]
  }
}
```
- **since**: 2.7.0

### userSettingsGroup
- **type**: string
- **description**: sets the user settings group for this navigation node. It is the title of a predefined user settings group belonging to a `userSettingGroups` object. For more information, read the section on [user settings](user-settings.md).
- **example**:
```javascript
{
    category: { label: 'Settings', icon: 'action-settings' },
    pathSegment: 'user_settings',
    label: 'User Settings',
    viewUrl: '/sampleapp.html#/projects/' + projectId + '/settings',
    icon: 'settings',
    userSettingsGroup: 'userAccount',
    testId: 'myTestId',
  }
```

### viewGroup
- **type**: string
- **description**: allows you to associate nodes to be rendered in the same iframe, as long as they belong to the same origin.
The value of this parameter is considered as the view group ID. If you want to use this feature, you must set [preloadViewGroups](navigation-advanced.md#preloadViewGroups) to `true` and provide a preload URL for your view group ID in [viewGroupSettings](navigation-advanced.md#viewGroupSettings).
For further explanations, see [this section](navigation-configuration.md#view-groups).
- **example:**
```javascript
settings: {
  navigation: {
    preloadViewGroups: true,
    viewGroupSettings:{
       view_group_components: {
          preloadUrl: '.....'
       }
    },
    nodes: {
      defaultChildNode: 'overview',
      children: [
        {
          pathSegment: 'docs',
          label: 'Documentation',
          viewGroup: 'view_group_components',
          viewUrl: '...'
        },
        {
          pathSegment: 'overview',
          label: 'Overview',
          viewGroup: 'view_group_components',
          viewUrl: '...'
        }
      ]
    }
  }
```


### viewUrl
- **type**: string
- **description**: contains the URL or path to a view which renders when you click the navigation node. Use either a full URL or a relative path. If **viewUrl** is undefined, Luigi activates the child node specified in **defaultChildNode**. When both **viewUrl** and **defaultChildNode** are undefined, Luigi opens the first child of the current node. **viewUrl** can contain variables from:
  * dynamic path segments
  * node parameters


### virtualTree
- **type**: boolean
- **description**: marks the node as the beginning of a virtual tree. Allows navigation to any of its children's paths without the need of specifying nested children. The path that comes after the node marked as **virtualTree** is appended to its **viewUrl**. [**keepSelectedForChildren**](#keepSelectedForChildren) is automatically applied. This feature is often used in combination with [LinkManager().withoutSync().navigate](luigi-client-api.md#withoutsync) to be able to keep a micro frontend's existing router links.
- **example**:
    In this example, navigating to `core.tld/settings/some/nested/view` will result in opening `/sampleapp.html#/settings/some/nested/view`.
    ```javascript
    {
      pathSegment: 'settings',
      label: 'Settings',
      viewUrl: '/sampleapp.html#/settings',
      navigationContext: 'settings',
      virtualTree: true
    }
    ```
- **since**: v0.7.6

### visibleForFeatureToggles
- **type**: array
- **description**: defines a list of feature toggles this node is restricted to. If all feature toggles in this list are active, the node will be visible in the top or left navigation. It is also possible to negate the feature toggle by adding a `!` in front of the toggle name. Then, the node is always visible except for the feature toggle defined with an exclamation mark.
- **example**:
    ```javascript
    {
      pathSegment: 'settings',
      label: 'Settings',
      viewUrl: '/sampleapp.html#/settings',
      navigationContext: 'settings',
      visibleForFeatureToggles:['ft1', '!ft2']
    }
    ```
- **since**: 1.4.0


### webcomponent
- **type**: boolean OR object
- **description**: mark a node as web component either by setting this attribute to `true` or defining an object with the attributes described below. In the latter case, the `viewUrl` attribute of the node must point to the web component `.js` file.
- **attributes**:
  - **type**: string, like `module`.
  - **selfRegistered**: if it is `true`, the web component bundle will be added via script tag.
  - **tagName**: tag name where web component is added to DOM.
- **since**: 1.7.0

<!-- add-attribute:class:warning -->
>**NOTE:** If you have to use the mechanism of `selfRegistered`, we recommend using the following code in your web component:
```javascript
window.Luigi._registerWebcomponent(new URL(document.currentScript?.getAttribute('src'), location), <YOUR_WEBCOMPONENT_CLASS>);
```
The advantage of this line of code is: you don't have to specify a tag name, thus avoiding the duplication of self-defined tag names.


## Context switcher

The context switcher is a drop-down list available in the top navigation bar. It allows you to switch between a curated list of navigation elements such as Environments. To do so, add the **contextSwitcher** parameter to the **navigation** object using the following optional parameters:


### actions
- **type**: array
- **description**: defines a list of additional elements that are shown on above or below the context switcher **options**.
- **attributes**:
  - **label** defines the action element label.
  - **testId** is a string where you can define your own custom `testId` for E2E tests. If nothing is specified, it is the node's label written as one word and lower case (e.g. `label`).
  - **position** defines the action element position. Can be `top` or `bottom`. The default value is `top`. This parameter
 is optional.
  - **link** defines an absolute Link to a **node**. This parameter
 is optional.
  - **clickHandler** specifies a function and is executed on click and should return a boolean. If it returns `true`, **link** is opened afterwards.

### alwaysShowDropdown
- **type**: boolean
- **description**: if set to `false`, the drop-down is not shown on click if there is only one option and no actions.
- **default**: `true`
- **since**: v0.7.3

### customSelectedOptionRenderer
- **type**: function
- **parameters**: [option](navigation-parameters-reference.md#options)
- **description**: enables you to customize the selected option of the dropdown button of the context switcher by rendering HTML code inside a `<button>`. The function takes an  **option** object as a parameter. It is recommended to use this function carefully because it is possible to inject JavaScript code.
- **since**: v1.0.0

### customOptionsRenderer
- **type**: function
- **parameters**: [option](navigation-parameters-reference.md#options), isSelected
- **description**: enables you to add custom items to the context switcher by rendering code inside a `<li>` element. The function takes an **option** object and a boolean **isSelected** as a parameter. It is recommended to use this function carefully because it is possible to inject JavaScript code.
- **since**: v0.7.3

### defaultLabel
- **type**: string
- **description**: specifies the default label that is shown if no context is selected.

### fallbackLabelResolver
- **type**: any
- **description**: specifies a function used to fetch the **label** for **options** with no **label** defined. Additionally, it fetches the drop-down label for non-existing **options**.

### icon
- **type**: string
- **description**: is the name of an icon from [OpenUI5](https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html). It's displayed on smaller screens next to the default label or the selected context in a dropdown for the top navigation nodes. There is a default icon if nothing is set.

### lazyloadOptions
- **type**: boolean
- **description**: defines when to fetch **options**. When set to `true`, loads **options** when you click the context switcher. It doesn't involve any caching. When set to `false`, loads **options** once the page loads.
- **default**: `true`

### options
- **type**: array
- **description**: defines the list of context element.
- **attributes**:
  - **label** defines the context element label. If not defined, the **pathValue** is passed to **fallbackLabelResolver** to set its value. The default value is **pathValue**, if **fallbackLabelResolver** is not defined.
  - **pathValue** defines the context element path that is appended to **parentNodePath** and reflects a **pathSegment**.
  - **customRendererCategory** defines a custom category for the option, which can be used by **customSelectedOptionRenderer** function to customize the rendering of the option when selected

### parentNodePath
- **type**: string
- **description**: specifies the base path, that is prepended to **options[].pathValue**. It must be an absolute path.

### preserveSubPathOnSwitch
- **type**: boolean
- **description**: if set to `true`, the sub-path is preserved on context switch.

### useFallbackLabelCache
- **type**: boolean
- **description**: if set to `true`, the labels retrieved through **fallbackLabelResolver** are cached within Luigi. This is useful, if **fallbackLabelResolver** is an async function which does a remote server call to fetch its value.
- **since**: 1.4.0

## Profile

The profile section is a configurable drop-down list available in the top navigation bar. Within the configuration, you can override the logout item content (if authorization is configured) and/or add links to Luigi navigation nodes. To do so, add the **profile** parameter to the **navigation** object using the following optional parameters:

### items
- **type**: array
- **description**: an array of objects, each one being a link to a Luigi navigation node or an external URL.
- **attributes**:
  - **label** defines the text for the link.
  - **testId** is a string where you can define your own custom `testId` for E2E tests. If nothing is specified, it is the node's label written as one word and lower case (e.g. `label`).
  - **icon** is the name of an icon from [OpenUI5](https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html) or a custom link (relative or absolute) to an image displayed next to the label or instead of it.
  - **altText** adds the HTML `alt` attribute to an icon. Note that this property only applies to icons with a defined absolute or relative path.
  - **link** defines an absolute link to a **node**.
  - **openNodeInModal** configures the settings of a view which opens in a modal. Details can be found here: [openNodeInModal](navigation-parameters-reference.md#openNodeInModal).
  - **externalLink** is an object which indicates that the node links to an external URL. If this parameter
 is defined, the **link** parameter
 is ignored. It has the following attributes:
    - **sameWindow** defines if the external URL is opened in the current tab or in a new one. The default value for this attribute
   is `false`.
    - **url** is the external URL that the link leads to.

### logout
- **type**: object
- **description**: defines a list of additional elements that are shown on above or below the context switcher **options**.
- **attributes**:
  - **label** overrides the text for the logout item. The default value is `Sign Out`.
  - **testId** is a string where you can define your own custom `testId` for E2E tests. If nothing is specified, it is the node's label written as one word and lower case (e.g. `label`).
  - **icon** overrides the icon for the logout item. The default value is the [SAP UI5 log icon](https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons/?tag=logout).
  - **altText** adds the HTML `alt` attribute to an icon. Note that this property only applies to icons with a defined absolute or relative path.
  - **customLogoutFn** defines a function to implement your own logout functionality. Use this function only if no IDP is configured. If you define IDP with a corresponding [logout function](authorization-configuration.md), the **customLogoutFn** set for a profile is ignored.

### staticUserInfoFn
- **type**: function
- **description**: used to retrieve a user's name and email to simulate logging in. It can be used when authorization is disabled and also gets called if the defined IDP provider does not have **settings.userInfoFn** defined or does not provide a `userInfo` function internally. It can be asynchronous and should return an object with **name**, **email** and **picture** parameters.
- **since**: v0.6.5

<!-- add-attribute:class:warning -->
>**NOTE:** Neither **authorization** nor **profile** parameter is configured if the profile section in the top navigation bar is not visible.

## Product switcher

The product switcher is a pop-up window available in the top navigation bar. It allows you to switch between the navigation elements displayed in the pop-up. To do so, add the **productSwitcher** parameter to the **navigation** object using the following optional parameters:

### altText
- **type**: string
- **description**: adds the HTML `alt` attribute to an icon. Note that this property only applies to icons with a defined absolute or relative path.

### columns
- **type**: number
- **description**: gives the possibility to define a number of columns to be displayed within the product switcher. It may be 3 or 4 columns, or `'auto'`. If nothing is specified, it is 4 columns by default. Parameter `columns: 'auto'` sets the number of columns to 3, in case the entities in  **productSwitcher** are equal to or less than 6. If there are more than 6, the number of columns will be automatically adjusted to 4. 

### icon
- **type**: string
- **description**: the name of an icon, without the `sap-icon--` prefix. Its source may be [OpenUI5](https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html) or a custom link (relative or absolute) to an image. The icon is displayed without label in the top navigation.

### items
- **type**: array
- **description**: an array of objects, each one being a link to a Luigi navigation node or an external URL. An item can have several attributes.
- **attributes**:
  - **label** defines the text for the link.
  - **subTitle** defines an additional text line for the link.
  - **testId** is a string where you can define your own custom `testId` for E2E tests. If nothing is specified, it is the node's label written as one word and lower case (e.g. `label`).
  - **icon** is the name of an icon from the [OpenUI5](https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html) or a custom link (relative or absolute) to an image displayed next to the label or instead of it.
  - **altText** adds the HTML `alt` attribute to an icon. Note that this property only applies to icons with a defined absolute or relative path.
  - **link** defines an absolute link to a **node**.
  - **selected** if set to true, the item is displayed in selected state, useful e.g. if the item refers to the current product.
  - **externalLink** is an object which indicates that the node links to an external URL. If this parameter
 is defined, the **link** parameter
 is ignored. It has the following attributes:
    - **sameWindow** defines if the external URL is opened in the current tab or in a new one. The default value for this attribute
   is `false`.
    - **url** is the external URL that the link leads to.

### label
- **type**: string
- **description**: defines the label of the product switcher. It is displayed as a title attribute on hover in the top navigation and as a headline in the mobile pop-up.

### testId
- **type**: string
- **description**: enables you to define your own custom `testId` for E2E tests. If nothing is specified, it is the node's label written as one word and lower case (e.g. `label`).

## App switcher

The app switcher is a dropdown list available in the top navigation bar. It allows you to switch between application elements displayed in the dropdown. To use it, you need to:
1. Define a [header object](general-settings.md#headerlogo) in the `settings:` section of your Luigi configuration.
2. Add the **appSwitcher** parameter to the **navigation** object using the optional parameters listed below.

### itemRenderer
- **type**: function
- **description**: This function allows you to customize the single list element rendered in the default app switcher popover.
- **attributes**:
  - **item** single application element
  - **slot** `ul` element as slot. You can append your custom `li` entries to this `ul` element.
  - **appSwitcherApiObj**
      - **type**: Object
      - **description**: It is an object with a function `closeDropDown` as property. This function closes the custom app switcher dropdown.
- **example**:
  ```javascript
    appSwitcher: {
      items:[...],
      itemRenderer: (item, slot, appSwitcherApiObj) => {
        let a = document.createElement('a');
        a.setAttribute('class', 'fd-menu__link');
        a.addEventListener('click', e => {
          Luigi.navigation().navigate(item.link);
          appSwitcherApiObj.closeDropDown();
          e.stopPropagation();
          Luigi.configChanged('navigation')
        });
        let span = document.createElement('span');
        span.setAttribute('class', 'fd-menu__addon-before');
        let i = document.createElement('i');
        if (item.title === 'Application One') {
          i.setAttribute('class', 'sap-icon--phone');
        } else {
          i.setAttribute('class', 'sap-icon--settings');
        }
        span.appendChild(i);
        let spanText = document.createElement('span');
        spanText.setAttribute('class', 'fd-menu__title');
        spanText.innerText = item.title;
        a.appendChild(span);
        a.appendChild(spanText);
        slot.appendChild(a);
      }
    }
  ```
- **since**: 1.25.0

### items
- **type**: array
- **description**: defines the list of application elements.
- **attributes**:
  - **title** defines the application title. This is shown in the **appSwitcher** drop-down as well as the title in the header of the Luigi application if a user is in the context of the app.
  - **subTitle** defines the application sub-title. This is shown as the sub-title in the header of the Luigi application if a user is in the context of the app.
  - **link** is a link within the Luigi application that defines the root of the app. It is used to switch to the application if the drop-down entry is selected. It is also used to determine if a user is within the app's scope, so that the corresponding title and sub-title can be rendered in the header.
  - **selectionConditions** 
      - **type**: Object
      - **description**: It allows to specify additional "selected state" conditions, next to `link` match. The object should contain a `route` property to specify an additional path that is matched by this item, as well as `contextCriteria`, an Array of `key: string, value:string` objects, each of which can define a context key and a matching value (all contextCriteria must match).

### showMainAppEntry
- **type**: boolean
- **description**: includes the link to the root of the Luigi application in the drop-down using the **title** specified in the **settings/header** section of the configuration as a label.

## Global search

The global search is an input field available in the top navigation bar. The search is available if the Luigi configuration file contains on its root level a section called `globalSearch`. Within this section you can implement and configure a search provider object.

### disableInputHandlers
- **type**: boolean
- **description**: disables the on:keyUp and other internal handlers on the search input field. It is a plain input field then, which can be used to attach your own handlers. If set to `true`, a **searchProvider** must be defined in order to show the search field, which can contain your custom logic. It is recommended to initialize your custom logic in the [**lifeCycle.luigiAfterInit**](lifecycle-hooks.md#luigiafterinit) hook.
- **since**: 1.5.0

### globalSearchCenteredCancelButton
- **type**: string
- **description**: defines the label of the cancel button. It will be displayed if you want to hide the search field on a smaller viewport. This property is only available if `searchFieldCentered` is active. Default value is `cancel` and this property is optional.
- **since**: 1.20.0

### searchFieldCentered
- **type**: boolean
- **description**: The search input field will be rendered in the center of the shellbar.
- **since**: 1.20.0

### searchProvider
- **type**: Object
- **description**: The search provider is an object which contains different events and the possibility to implement a custom result renderer or change only the search result item.
 - **attributes:**
  - **onInput**
    - **type**: Function
    - **description**: will be executed on every key-up event.
  - **onEnter**
    - **type**: Function
    - **description**: will be executed when the user presses 'Enter'.
  - **onEscape**
    - **type**: Function
    - **description**: will be executed when the user presses 'Escape'.
  - **customSearchResultRenderer**
    - **type**: Function
    - **description**: This function allows you to append your custom search result to a slot which Luigi provides for you. If this function is implemented the default search result popover is disabled.
    - **attributes**:
      - **searchResults**
        - **type**: Array
        - **description**: array of search result items
      - **slot**
        - **type**: DIV element
        - **description**: `div` element as slot. You can append a custom implementation of the search result to this `div` element.
      - **searchApiObj**
        - **type**: Object
        - **description**: It is an object with a function `fireItemSelected` as property. This function gets a search result item as parameter and fires the search provider event `onSearchResultItemSelected`.
  - **customSearchResultItemRenderer**
    - **type**: Function
    - **description**: This function allows you to customize the single list element rendered in the default search result popover.
    - **attributes**:
      - **searchResultItem**
        - **type**: Object
        - **description**: search result item
      - **slot**
        - **type**: LI element
        - **description**: `li` element as slot. You can append a custom implementation of a `searchResultItem` to this `li` element.
      - **searchApiObj**
        - **type**: Object
        - **description**: It is an object with a function `fireItemSelected` as property. This function gets a `searchResultItem` as parameter and fires the search provider event `onSearchResultItemSelected`.
  - **onSearchResultItemSelected**
    - **type**: Function
    - **description**: will be executed when the user clicks on a `searchResultItem`.
    - **attribute** [searchResultItem](luigi-core-api.md#globalsearch)
  - **inputPlaceholder**
    - **type**: string
    - **description**: This text will be used as placeholder in the search input field.
   - **inputPlaceholder**
     - **type**: Function
     - **description**: Output of this function will be used as placeholder in the search input field.
   - **inputPlaceholder**
     - **type**: Object
     - **description**: Key value JSON object, where `key` is the language and `value` is the text used as placeholder in the search input field. This function doesn't have any input parameter.
   - **toggleSearch**
     - **type**: Function
     - **description**: This function will be executed every time when the visibility of the search input field is changed.
    - **attributes**:
      - **element**
        - **type**: INPUT element
        - **description**: the input element where the user enters the search text.
      - **visible**
        - **type**: boolean
        - **description**: specifies if the input text is visible or not.
