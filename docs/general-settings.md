<!-- meta
{
  "node": {
    "label": "General settings",
    "category": {
      "label": "Luigi Core",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 2,
      "position": 1
    }
  }
}
meta -->

# General settings

<!-- add-attribute:class:success -->
>**TIP:** For learning and testing purposes, use the [Luigi Fiddle](https://fiddle.luigi-project.io) page where you can configure a sample Luigi application.

The configuration file contains a section called **Settings** where you can configure additional Luigi options.

<!-- accordion:start -->
### Settings code example

This is an example of how settings parameters can be used:

```javascript
settings: {
  hideNavigation: false
  backdropDisabled : false,
  header: {  object / function / Promise
    logo: 'path/to/image.png',
    title: 'Luigi Demo',
    favicon: 'path/to/favicon.ico'
  },
  featureToggles : {
    queryStringParam: 'ft'
  },
  sideNavFooterText: 'MyLovelyApp 1.0.0',
  sideNavCompactMode: false,
  customTranslationImplementation: () => {
    return {
      getTranslation: (key, interpolations, locale) => {
        return translatedText;
      }
    };
  },
  customSandboxRules: ['allow-downloads-without-user-activation'],
  allowRules: ['microphone'],
  appLoadingIndicator: {
    hideAutomatically: true
  },
  thirdPartyCookieCheck = {
    //disabled: true,
    //thirdPartyCookieScriptLocation: 'https://domain/init.html',
    thirdPartyCookieErrorHandling: () => {
      const alert = {
        text: 'Third Party Cookies are not enabled. Please check your browser settings.',
        type: 'warning'
      };
      Luigi.ux().showAlert(alert);
    }
  },
  theming = {
    themes: () => [
      { id: 'light', name: 'Light Theme' },
      { id: 'dark', name: 'Dark Theme' }
    ],
    defaultTheme: 'light'
  }
}
```
<!-- accordion:end -->

Below is a list of the parameters you can use in the `settings:` Luigi configuration section.
* [General parameters](#general-parameters)
* [Third-party cookies support check](#third-party-cookies-support-check)

## General parameters

### allowRules
- **type**: array
- **description**: an array of rules for the content in the iframe, managed by the HTML **allow** attribute. You can use one or more rules by adding them to the array, for example `allowRules: ['microphone', 'camera']`. Be aware that this mechanism requires the browser to support [Feature Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Feature_Policy).

### appLoadingIndicator.hideAutomatically
- **description**: allows you to disable automatic hiding of the app loading indicator, which is enabled by default in case the app loading indicator is being used. Take a look at the [App loading indicator](luigi-ux-features.md#app-loading-indicator) section on how to use this feature.

### backdropDisabled
- **type**: boolean
- **description**: prevents the backdrop layer from covering the top and left navigation when showing modal windows.
- **default**: by default, the backdrop is set to `true`.

### burgerTooltip
- **type**: boolean/string
- **description**: allows to set and customize a tooltip for the burger, which will be rendered if **responsiveNavigation** is set to `simple` or `Fiori3`. You can set it to `true`. In that case, the default values `Expand navigation` and `Collapse navigation` will be rendered.
It is also possible to customize the values. In that case **burgerTooltip** will be an object with definable properties.
- **example**:
```javascript
burgerTooltip = {
    navExpanded: 'Collapse navigation',
    navCollapsed: 'Expand navigation'
  };
```

### customAlertHandler
- **type**: function
- **description**: with this function, Luigi alerts will be disabled and you can implement your own alerts. This function gets `settings` and `openFromClient` as parameters. It must either return a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) which gets resolved when the alert is dismissed, or `false` if the default Luigi alert should be shown.
- **example**:
```javascript
Luigi.setConfig({
  ...,
  settings: {
    customAlertHandler: ()=>{
     return new Promise((resolve, reject) => {
       //custom alert implementation
     });
    }
  }
})
```

### customSandboxRules
- **type**: array
- **description**: an array of custom rules for the content in the iframe. You can extend the [Luigi default sandbox rules](https://github.com/luigi-project/luigi/blob/af1deebb392dcec6490f72576e32eb5853a894bc/core/src/utilities/helpers/iframe-helpers.js#L140) by adding further rules.

### customTranslationImplementation
- **type**: object/function returning an object
- **description**: provides a custom localization implementation. It can be an object or a function returning an object. This object must provide the **getTranslation** function as property:
```javascript
{
  getTranslation: (key, interpolations, locale) => {
    // should return translation of the 'key' in the 'locale' or current locale
  }
}
```
Take a look at our [i18n](i18n.md) section for an implementation suggestion.
<!-- add-attribute:class:warning -->
> **NOTE:** You can translate Luigi internal messages by providing translation for [these keys](../core/src/utilities/defaultLuigiTranslationTable.js).


### expandCategoryByNavigation
- **type**: boolean
- **description** if you have a [category](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=category) set to `collapsible`, you can set this parameter to `true` in order to expand the category when navigating to one of its children.


### featureToggles.queryStringParam
- **description**: allows you to set the query parameter name for the feature toggles. This parameter is then used when setting feature toggles via appending to the URL like `?ft=name`. You will need this value set before using the feature toggle functionality.

### getNavFooterContainer
- **description**: in addition to **sideNavFooterText** a client can insert custom HTML under the footer section.

### header.altText
- **type**: string
- **description**: adds the HTML `alt` attribute to the logo image.
- **example**: 
```
 header: {  object / function / Promise
    logo: 'path/to/image.png', 
    altText: 'alternative text'
  },
```

### header.disabled
- **type**: boolean
- **description**: disables Luigi's default out-of-the-box top navigation when set to `true`. This means that top navigation is hidden and only the left-side navigation is visible.
- **default**: by default, the parameter is set to `false`, which means the navigation is enabled.


### header.favicon
- **type**: icon
- **description**: defines the favicon. It requires a standard favicon file with the `.ico` extension, and 16x16px or 32x32px dimensions.
- **example**: 
```
 header: {  object / function / Promise
    favicon: 'path/to/favicon.ico'
  },
```

### header.logo
- **type**: icon
- **description**: defines the top left navigation logo. It has a fixed height of 28px.
- **example**: 
```
 header: {  object / function / Promise
    logo: 'path/to/image.png'
  },
```

### header.responsiveShellbarPaddings
- **type**: boolean
- **description**: based on the browser window size, a responsive padding will be applied to the Shellbar Component when set to `true`.
- **default**: by default, the parameter is set to `false`, meaning that padding for the Shellbar Component will stay the same as inherited from the `.fd-shellbar` class.
- **example**:
```
 header: {  object / function / Promise
   responsiveShellbarPaddings: true
  },
```

### header.title
- **type**: string
- **description**: defines the top left navigation title.
- **example**: 
```
 header: {  object / function / Promise
    title: 'Luigi Demo'
  },
```

### hideNavigation
- **type**: boolean
- **description**: disables Luigi's default out-of-the-box navigation when set to `true`. This means that top, side, and tab navigation is no longer visible and you can implement your own navigation UI.
- **default**: by default, the parameter is set to `false`, which means the navigation is enabled.

### iframeCreationInterceptor
- **type**: function
- **description**: called on iframe creation, it gives you full control over the created iframe DOM element. You can modify it to your needs just before it is added to the DOM tree.
This function is called with these parameters:
  * `iframe` is the iframe DOM element. It is not yet added to the DOM tree, but all attributes are already set.
  * `viewGroup` is the view group associated with this iframe, if applicable.
  * `navigationNode` is the navigation node associated with this iframe. NOTE: the interceptor is called only once per iframe creation. If two or more navigation nodes share the same iframe (because they belong to the same view group) the interceptor is called with the first navigated node only.
  * `microFrontendType`, which is `main`, `modal`, `split-view`, `drawer` or `usersettings` depending on where it is going to be rendered.
- **example**:
For example, to allow 'fullscreen' for non-modal iframes:
```javascript
{
  iframeCreationInterceptor: (iframe, viewGroup, navigationNode, microFrontendType) => {
    if (microFrontendType !== 'modal')
      iframe.allowFullscreen = true;
  }
}
```

### profileType
- **description**: allows applying different layouts of Profile Menu in the shellbar once a user is authorized.
You can set the following values:
  * `simple` displays basic profile menu list of entities.
  * `Fiori3` displays renewed profile menu layout according to the Fiori 3 styleguides. It contains the avatar of a user, if applicable, and additional description. **since**: v1.14.0
  * `vega` displays renewed profile menu layout according to the `Vega` styleguides. **since**: v2.23.0
- **default**: if you don't specify any value for **profileType**, the `simple` layout will be used as a default one.

### responsiveNavigation
- **description**: allows customizing the navigation display settings. For example, you can define a button which shows or completely hides the left navigation, or a button which collapses the navigation to only show the icons.
You can set the following values:
  * `simple` displays the button on the left side of the top navigation regardless of the browser window´s size.
  * `simpleMobileOnly` displays the button on the left side of the top navigation when the browser window is narrower than `600px`.
  * `semiCollapsible` displays the arrow button at the bottom of the left side navigation. Once you click the button, the navigation shows up or collapses.
  * `Fiori3` displays the button on the left side of the top navigation. Once you click the button, the navigation shows up or collapses.
- **default**: if you don't specify any value for  **responsiveNavigation**, the buttons remain hidden. The same applies when you enable **hideSideNav** for the currently active navigation node.

### semiCollapsibleButtonStyle
- **description**: allows you to customize the rendering of the expand/collapse control in the left side navigation, if [responsiveNavigation](https://docs.luigi-project.io/docs/general-settings/?section=responsivenavigation) is set to **semiCollapsible**.
You can set the following values:
  * `button` renders a **button** tag.
- **default**: if you don't specify any value for  **semiCollapsibleButtonStyle**, the control is rendered as an **i** tag.

### sideNav.displayFooterWhenCollapsed
- **description**: shows the footer in the `Vega` layout even when the left navigation is collapsed.
- **since** NEXT_RELEASE

### sideNav.style
- **description**: Displays the updated side navigation layout styled according to the `Vega` design guidelines. Must be set to `vega`. 
- **since** v2.23.0

#### sideNav.subCategoryDelimiter
- **description**: With the vega layout, you can define subcategories in the side navigation. A custom delimiter can be set to separate subcategories; by default, this is `::`.
- **since** v2.23.0
- **example**:
```javascript
{
  label: 'Node',
  category: {
      id: 'myCat',
      label: 'My Category',
      collapsible: true,
      icon: 'home'
  },
  pathSegment: 'node',
  viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
}, {
  label: 'Node1',
  category: {
      id: 'myCat::subCat',
      label: 'My Subcategory',
      collapsible: true,
      icon: 'group'
  },
  pathSegment: 'node1',
  viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
  context: {
      title: 'node1',
      content: 'Click on "Modify Config" at the bottom right and play around with your Luigi configuration'
  }
}, {
  label: 'Node2',
  category: 'myCat::subCat',
  pathSegment: 'node2',
  viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
  context: {
      title: 'node2',
      content: 'Click on "Modify Config" at the bottom right and play around with your Luigi configuration'
  }
}
```

### sideNavCompactMode
- **description**: reduces the dimensions of the side navigation and allows you to display more information.

### sideNavFooterText
- **description**: is a string displayed in a sticky footer inside the side navigation. It is a good place to display the version of your application.

### theming
- **description**: a configuration element that allows you to specify a list of themes that are available on the website. The children elements are:
    * **themes** (mandatory) is an array of available themes, for example `themes: ['light', 'dark', 'sap_horizon']`.
    * **defaultTheme** (mandatory) the default theme used by the application.
    * **nodeViewURLDecorator** (optional) you can add an internal Luigi View URL decorator (an example is below). This object adds a query parameter where you can add a current theme used by the application when micro-frontends are loaded.
    * **useFioriScrollbars** (optional) if set to `true`, Fiori theming variables are applied to all scrollbars in luigi core app.
    * **variables** (optional) can either be a string set to `fiori` to get all CSS variables from the `fiori` theme, or an object with a property called `file` where you can declare your own CSS variables. The variables should be defined in a JSON file which starts with a `root` key. An example of how a CSS variables file should look like can be found [here](https://github.com/SAP/theming-base-content/blob/master/content/Base/baseLib/sap_horizon/variables.json).
- **example**:
```javascript
theming: {
  themes: () => [
    { id: 'light', name: 'Fiori3 Light' },
    { id: 'dark', name: 'Fiori3 Dark' },
    { id: 'sap_horizon', name: 'Morning Horizon' }
  ],
  defaultTheme: 'light',
  nodeViewURLDecorator: {
    queryStringParameter: {
      keyName: 'sap-theme',
      // optional
      value: themeId => {
        return themeId;
      }
    }
  }
}
```

<!-- add-attribute:class:warning -->
> **NOTE:** The Horizon theme stylesheet needs to be included. In the HEAD section of your application's `index.html` file, add:
```html
<link rel="stylesheet" href="<PATH/TO/LUIGI/PACKAGE/luigi_horizon.css" />
```

### unsavedChangesHandler
- **type**: function
- **description**: the `unsavedChangesHandler` can be implemented as an alternative to the standard unsaved changes modal. The function must return a promise."
- **example**:
```javascript
settings:{
  unsavedChangesHandler: () => {
    return Luigi.ux().showConfirmationModal({
      type: 'information',
      header: "Unsaved Changes",
      body: "You have unsaved changes. Do you want to <b>leave</b>?",
      buttonConfirm: "Yes",
      buttonDismiss: "No"
    });
  }
}
```
- **since** NEXT_RELEASE

### webcomponentCreationInterceptor
- **type**: function
- **description**: called on web component creation, it gives you full control over the created web component DOM element. You can modify it according to your needs just before it is added to the DOM tree.
This function is called with the following parameters:
* `wc` - the web component DOM element. It is not yet added to the DOM tree, but all attributes are already set.
* `currentNode` - the navigation node.
* `extendedContext` - extended settings about the current node.
* `nodeId` - an ID which is set on the web component object in your config, or, if not defined, a generated `id` from Luigi.
* `isSpecialMf` - allows you to specify whether the web component is rendered in a modal, splitView or drawer. `false` by default.

## Third-party cookies support check

You can check whether the user's browser supports third-party cookies by defining a **thirdPartyCookieCheck** object which expects a function called **thirdPartyCookieErrorHandling**, optional **disabled** and **thirdPartyCookiesScriptLocation** parameters. When **thirdPartyCookiesScriptLocation** is set, the Luigi Core application checks third-party cookie support only once and not on every micro frontend call. If it is *not* set, the Luigi Core application checks third-party cookie support whenever a micro frontend is loaded.

To detect whether the user's browser supports the mechanism, use the script in the [`third-party-cookies`](https://github.com/luigi-project/luigi/tree/main/core/third-party-cookies) catalog. Deploy this file on a domain different from your main application's and set **thirdPartyCookieScriptLocation** to the `init.html` file. During initialization, Luigi detects cookies support and produces an alert if cookies are disabled in the user's browser.

### Parameters

#### thirdPartyCookieCheck
- **type**: object
- **description**: object defined in the general settings part of the Luigi configuration file, containing the **thirdPartyCookieErrorHandling** function and optional **disabled** and **thirdPartyCookiesScriptLocation** parameters.

#### disabled
- **type**: boolean
- **description**: if set to true **thirdPartyCookieCheck** is ignored.

#### thirdPartyCookieErrorHandling
- **type**: function
- **description**: a function where you could call an alert like `Luigi.ux().showAlert({})`.

#### thirdPartyCookieScriptLocation**
- **type**: string
- **description**: the URL to the page containing third-party cookies support check.

<!-- document the schema-->
