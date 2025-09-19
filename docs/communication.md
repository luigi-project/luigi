<!-- meta
{
  "node": {
    "label": "Core/Client communication",
    "category": {
      "label": "Advanced",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 8,
      "position": 1
    }
  }
}
meta -->

# Communication

<!-- add-attribute:class:success -->

> **TIP:** For learning and testing purposes, use the [Luigi Fiddle](https://fiddle.luigi-project.io) page where you can configure a sample Luigi application.

## Overview

The Luigi configuration file can include a section called `communication:`. In it, you can define custom messages to be exchanged between Luigi Core and Luigi Client, as well as configure additional communication options.

## Custom messages

Luigi Core and Luigi Client can exchange custom messages in both directions.

### Luigi Client to Luigi Core

For Luigi Client to send messages to Luigi Core, use the [sendCustomMessage](luigi-client-api.md#sendCustomMessage) method from Client API.

For Luigi Core to process custom messages, define a configuration similar to the following at the root level of your Luigi configuration object:

```javascript
{
  ...
  communication: {
    customMessagesListeners: {
      'my-custom-message.update-top-nav': () => {
        Luigi.navigation().updateTopNavigation();
      }
    }
  }
  ...
}
```

where the `my-custom-message.update-top-nav` key is the message ID, and the value is the listener function for the custom message. The listener receives the following input parameters:

- **customMessage** the [message](luigi-client-api.md#sendCustomMessage) sent by Luigi Client.
- **microfrontend** a micro frontend object as specified [here](luigi-core-api.md#getMicrofrontends).
- **navigation node** a [navigation node object](navigation-parameters-reference.md#Node-parameters).

### Luigi Core to Luigi Client

For Luigi Core to send messages, use the [customMessages](luigi-core-api.md#customMessages) section from Core API. You can send a custom message to all rendered micro frontends, or to a specific one. For the latter, use the Core API [elements](luigi-core-api.md#elements) methods to retrieve micro frontends and select the one you want to send the custom message to.

For Luigi Client to process the message, add and remove message listeners as described [here](luigi-client-api.md#addCustomMessageListener).

## Ignore events from inactive iframes

In the `communication:` section of the Luigi config, you can add the `skipEventsWhenInactive` parameter in order to ignore events normally sent from Luigi Client to Luigi Core when an iframe/micro frontend is not currently selected or active.

For example, you can ignore any of these events (or others, as needed):

- [luigi.navigation.open](https://github.com/luigi-project/luigi/blob/main/client/src/linkManager.ts#L115) - skipping this event will prevent the inactive iframe from opening
- [luigi.navigate.ok](https://github.com/luigi-project/luigi/blob/main/client/src/lifecycleManager.ts#L155) - skipping this event will prevent navigation
- [luigi.ux.confirmationModal.show](https://github.com/luigi-project/luigi/blob/main/client/src/uxManager.ts#L114) - skipping this event will prevent the showing of a [confirmation modal](luigi-client-api.md#showconfirmationmodal)
- [luigi.ux.alert.show](https://github.com/luigi-project/luigi/blob/main/client/src/uxManager.ts#L198) - skipping this event will prevent the showing of an [alert](luigi-client-api.md#showalert)

### skipEventsWhenInactive

- **type**: array of strings
- **description**: a list of strings specifying the names of events which you want to ignore. When specified, the events will be ignored when an iframe is inactive.
- **default**: undefined
- **example**:

```javascript
{
  ...
  communication: {
    skipEventsWhenInactive: ["luigi.navigation.open", "luigi.ux.alert.show"]
  }
  ...
}
```
