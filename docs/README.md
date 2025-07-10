# Luigi Documentation

If you are new to Luigi, read the [Getting started guide](getting-started.md) to learn more about its structure and key features.

## Luigi Core

Luigi Core enables you to create web applications with an easily configurable and consistent user interface.

[Installation](application-setup.md) shows you the first steps to prepare your application for development.

### Configuration

<!-- add-attribute:class:success -->
> **TIP:** [Luigi Fiddle](https://fiddle.luigi-project.io) allows you to configure a very simple application and get a feel for the process.

To configure your Luigi application, simply edit the files in the `luigi-config` folder of your project. Luigi configuration is divided into several sections, which are outlined in the guides below:

* [Navigation (basic)](navigation-configuration.md) - configure basic top and side navigation, links, and categories.
* [Navigation (advanced)](navigation-advanced.md) - create a dynamic path, reuse micro frontends with the same origin, and configure additional navigation elements. 
* [Full parameter reference](navigation-parameters-reference.md) - find all the parameters which you can use to configure Luigi navigation in one place.
* [Authorization](authorization-configuration.md) - configure login and security features for your application.
* [Authorization events](authorization-events.md) - define event configuration used to react to Luigi authorization events.
* [General settings](general-settings.md) - fully customize a micro frontend, define a header, make your application responsive, and more.
* [Lifecycle hooks](lifecycle-hooks.md) - execute custom logic on any of the Luigi lifecycle steps.

The following guides outline Luigi Core API features and additional UI options that exist outside the configuration files:

* [Core API](luigi-core-api.md) - API features that help you enrich and use Luigi Core.
* [Luigi UI features](luigi-ux-features.md) - customization options for some of the Luigi UI components.

## Luigi Client

Luigi Client enables you to connect micro frontends to an already existing Luigi Core application.

[Installation](luigi-client-setup.md) shows you how to install the Luigi Client.

Read the Luigi Client API documentation to learn more about the functions and parameters you can use to communicate with the core application:

* [Lifecycle](luigi-client-api.md#lifecycle) - manage the lifecycle of listeners, navigation nodes, and event data.
* [Link Manager](luigi-client-api.md#linkmanager) - navigate to a specific route.
* [UX Manager](luigi-client-api.md#uxmanager) - manage appearance options such as the behavior of backdrop or loading indicators.

## Advanced

[Communication](communication.md) describes how to send custom messages between Luigi Core and Client.

## Examples

Check the Luigi [application examples](../core/examples) for an in-depth look at Luigi capabilities.

## Development

Read the [development and code formatting guidelines](https://github.com/luigi-project/luigi#development) if you are interested in contributing.
