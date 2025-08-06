<!-- meta
{
  "node": {
    "label": "Expert scenarios",
    "category": {
      "label": "Advanced",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 8,
      "position": 0
    }
  }
}
meta -->

# Expert scenarios

This is a collection of advanced use cases and example implementations. If you are new to Luigi, take a look at our [Getting Started](getting-started.md) section first.

<!-- accordion:start -->

### Authenticate Luigi with Google Cloud Identity

#### Overview

This example shows you how to use Luigi with a Google account.

#### Steps

1. Register a project and generate an OAuth2 Web Client based on [Google Developers Identity - OAuth2UserAgent](https://developers.google.com/identity/protocols/OAuth2UserAgent).
2. To get your app running locally, set the Authorized JavaScript Origins URIs to `http://localhost:[PORT]` (replace PORT by the port of your locally running luigi app, e.g. `4200` for Angular). Then, set Authorized redirect URIs to `http://localhost:[PORT]/luigi-core/auth/oauth2/callback.html?storageType=localStorage`.
3. Copy the Client ID which ends with `apps.googleusercontent.com`.
4. Update the LuigiConfig auth section. In this example, we have also provided a configuration for logout and getting user information:

```javascript
  {
    auth: {
      use: 'oAuth2ImplicitGrant',
      oAuth2ImplicitGrant: {
        authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        oAuthData: {
          response_type: 'id_token token',
          client_id: 'YOUR_CLIENT_ID...apps.googleusercontent.com',
          scope: 'openid https://www.googleapis.com/auth/userinfo.email profile',
        }
      },
      logoutFn: async (settings, authData, logoutCallback) => {
        console.log('revoking token');
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${authData.accessToken}`);
        logoutCallback('/logout.html');
      }
    }
  }
```

Google's `id_token` contains basic identity data like name and user ID, which allows for this data to be shown in the profile.
5. If you would also like to show the user picture, add the following code to enrich the user profile information:

```javascript
  userInfoFn: async (settings, authData) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + authData.accessToken
      }
    });
    const json = await response.json();
    return json;
  },
```

### Use Feature Toggles in Luigi
There are two possibilities to add feature toggles to the active feature toggles list. On the one hand, you can use the Core API and on the other hand, it is possible to add a feature toggle through URL parameters.

#### Overview
Luigi allows you to implement and configure feature toggles. They can be used to organize and compartmentalize your code.

#### Usage
* Before using feature toggles, you first have to include the feature toggle query parameter in the [general settings](general-settings.md) part of your Luigi configuration file. This allows you to enable setting the feature toggles via URL :
  ```
  featureToggles = { queryStringParam: 'ft' };
  ```
* To **set** feature toggles, you have two possibilities:
   1. Set feature toggles to the active feature toggle list through [Luigi Core API](luigi-core-api.md#featuretoggles):
  ```javascript
    Luigi.featureToggles().setFeatureToggle('ft1');
  ```
  2. Set feature toggles to the active feature toggle list via URL parameters by appending a comma-separated list of strings. The parameter name is the predefined **featureToggles.queryStringParam** :
  ```
  http://localhost:4200/projects/pr1?ft=ft1,ft2
  ```

* To **unset** feature toggles, you have to use the Core API:
  ```javascript
    Luigi.featureToggles().unsetFeatureToggle('ft1');
  ```
* To **restrict node visiblity with feature toggles**:
  You can define a list of feature toggles for a particular top or left navigation node. For that you can use the [visibleForFeatureToggles](navigation-parameters-reference.md#visibleForFeatureToggles) parameter in order to display the node for certain feature toggles.
  For example, this node will be visible if `ft1` is added to the active feature toggle list:
  ```javascript
  {
      category: { label: 'Feature Toggle: Settings 2', icon: 'action-settings' },
      pathSegment: 'settings_ft',
      label: 'Project Settings 2',
      viewUrl: '/sampleapp.html#/projects/' + projectId + '/settings',
      icon: 'settings',
      visibleForFeatureToggles: ['ft1']
  }
  ```
  If you define a list of multiple feature toggles, the node will be restricted and it will be shown only if **all** of the specified feature toggles are set.

  It is also possible to negate the visibility of a node by adding an exclamation mark at the beginning of the feature toggle name.
  In this example, the node is always visible except if `ft1` is set as an active feature toggle:
  ```javascript
  {
      category: { label: 'Feature Toggle: Settings 2', icon: 'action-settings' },
      pathSegment: 'settings_ft',
      label: 'Project Settings 2',
      viewUrl: '/sampleapp.html#/projects/' + projectId + '/settings',
      icon: 'settings',
      visibleForFeatureToggles: ['!ft1']
  }
  ```
* To **use feature toggles in a micro frontend**:
  It is possible to restrict content in a micro frontend using feature toggles. The active feature toggle list is available in the Luigi [Client API](luigi-client-api.md#getActiveFeatureToggles).
  ```javascript
    if (LuigiClient.getActiveFeatureToggles().includes('ft1')) {
      //display content
    }
  ```

### Use Intent-Based Navigation in Luigi Client

#### Overview
Luigi Client allows you to navigate through micro frontends by using an intent-based navigation. This type of navigation decouples navigation triggers from the actual navigation targets. Rather than directly encoding the name of the target app into the URL fragment, app developers provide a navigation intent such as `display` or `edit` as shown in the examples below.

#### Usage
* To **enable** intent-based navigation, you need to first identify the necessary target mappings. This can be done by defining `intentMapping` in the Luigi configuration under `navigation` as in the example below:
  ```javascript
  intentMapping = [
    {
      semanticObject: 'Sales',
      action: 'display',
      pathSegment: '/projects/sap/munich/database/sales/display'
    },
    {
      semanticObject: 'Sales',
      action: 'edit',
      pathSegment: '/projects/sap/munich/database/sales/edit'
    }
  ];
  ```
  1. The intent link is built using the `semanticObject`, `action` and optional parameters in the following format:
  `#?intent=semanticObject-action?params`.
  An example of an intent link would be as follows:
  ```javascript
    #?intent=Sales-edit?id=100
  ```
  2. Navigation to a micro frontend through this intent is then made possible by using the [linkManager navigate method](luigi-client-api.md#navigate) from Luigi Client API:
  ```javascript
    LuigiClient.linkManager().navigate('#?intent=Sales-edit?id=100');
  ```

  3. This method would then be navigating to the translated real path segment:
  ```javascript
    https://example.com/projects/sap/munich/database/sales/edit?~id=100;
  ```

  4. Alternatively, the intent link can also be accessed through the browser URL and accessed from outside:
  ```javascript
    https://example.com/#?intent=Sales-edit?id=100;
  ```

### Defer Luigi Client Initialization

#### Overview

In some scenarios, the micro frontend application needs to decide when to finalize the Luigi Client initialization. By default, Luigi Client is initialized when you import the library in your micro frontend application.
However, it can be the case that a complex application takes too long to load all the modules. Since Luigi Client initialization is done automatically when it is imported, Luigi Core will assume that the micro frontend is fully loaded and ready for further actions when it is not.
This may lead to some problems, such as UI synchronization issues where the side menu highlights an item, but the micro-frontend application shows different content.

#### Usage

These are the steps you can use to defer Luigi Client initialization :

  1. In your micro frontend HTML that serves as entry file, you must add the `defer-luigi-init` attribute into the `<head>` element as follows:
  ```html
      <html>
        <head defer-luigi-init>
        ....
        </head>
        .....
      </html>
    ```
  2. Then, you can use the Luigi Client API inside your micro frontend:
  ```javascript
      LuigiClient.luigiClientInit();
  ```
 <!-- add-attribute:class:warning -->
> **NOTE**: This will only initialize Luigi Client if it hasn't already been initialized.

<!-- accordion:end -->
