<!-- meta
{
  "node": {
    "label": "Getting started",
    "category": {
      "label": "Basics",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 1,
      "position": 0
    }
  }
}
meta -->

# Getting started

This document contains the following sections:
* [Overview](#overview)
* [Quick setup](#quick-setup)
* [Examples](#examples)
* [How to obtain support](#how-to-obtain-support)

## Overview

Luigi is an open source JavaScript framework for **micro frontends**. Micro frontend architecture breaks down big frontend monoliths into smaller and simpler chunks which can be developed by independent teams.

The Luigi framework provides configuration options, API functions, and out-of-the-box features which make migrating to a micro frontend architecture easier. Luigi provides a consistent user navigation for all your micro frontends, ensuring a better user experience. 

Most importantly, Luigi is **technology-agnostic**, which means you can use virtually any toolkit (including, but not limited to: Angular, React, Vue, or UI5) to create your frontend. 

### Benefits

Some benefits of a micro frontend architecture include:

* Future-proof and scalable 
* Multiple technologies can co-exist in the same app
* Can be managed by independent teams
* Fast deployment of new features and bugfixes
* Smaller, more manageable codebase
* Reduced maintenance cost

### Main features

<img src="https://github.com/luigi-project/luigi/blob/main/docs/assets/luigi-overview-diagram.jpg?raw=true" alt="Graphic showing main Luigi components" width="600"/>

Luigi consists of two main parts:

**Luigi Core** - refers to the "main app", in which your micro frontends (a.k.a. views) will be embedded. It offers some of the following configurable features:
* [Navigation](navigation-configuration.md) - consistent user navigation created using specific Luigi [parameters](navigation-parameters-reference.md).
* [Authorization](authorization-configuration.md) - integration with an authentication provider, allowing users to log in.
* [Localization](i18n.md) - displaying an application in multiple languages.
* [General settings](general-settings.md) - other settings that can be configured in Luigi, such as HTML attributes, third-party cookie configuration and more.
* [API](luigi-core-api.md) - functions to help with almost every part of your app: navigation, authorization, adding a [search box](luigi-core-api.md#globalsearch), configuring a light/dark [theme](luigi-core-api.md#theming) and others.

<!-- add-attribute:class:success -->
>**NOTE:** You can also use [Luigi Container](luigi-container.md) to embed a Luigi micro frontend into any existing application without it being a Luigi Core app. 

**Luigi Client** - refers to Luigi options related to micro frontends:
* [API](luigi-client-api.md)  - diverse API functions which can be used on the micro frontend side.
* [Communication](communication.md)  - sending messages between the micro frontend and the main application (Luigi Core module).

## Quick setup

### Luigi Core

You can find Luigi setup examples for different frameworks [here](application-setup.md). 

### Luigi Client

Follow these steps to add Luigi Client features to your existing **micro frontends**:

1. [Install Luigi Client](luigi-client-setup.md).
2. Use the functions and parameters provided by the Luigi Client API. You can find them in the [Luigi Client API documentation](luigi-client-api.md).


## Examples

Here you can find some Luigi example applications and scenarios, starting from simple to more complex:

<!-- accordion:start -->

 ### HTML file

This is a simple example of a Luigi application inside a single HTML file. It is not intended for any real-life use.

You can run it by copying and pasting this code in a text editor, then saving it as an HTML file:

```html
<!DOCTYPE html>
<html lang="en">

<head>
	  <title>Hello Luigi</title>
	  <link rel='stylesheet' href='https://unpkg.com/@luigi-project/core/luigi.css'>
      <meta charset="utf-8">
</head>

<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <script src="https://unpkg.com/@luigi-project/core/luigi.js"></script>
	<script>
        Luigi.setConfig({
            navigation: {
                nodes: [{
                    pathSegment: 'home',
                    hideFromNav: true,
                    children: [{
                        pathSegment: 'hello',
                        label: 'Hello Luigi',
                        viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
                        isolateView: true,
                        context: {
                            title: 'Hello Luigi!',
                            content: " ",
                            imgUrl: "https://fiddle.luigi-project.io/img/logos/Luigi-logo_rgb.svg",
                            imgWidth: "300",
                            imgTopMargin: true
                        }
                    },{
                        pathSegment: 'hello2',
                        label: 'Hello Maryna',
                        viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
                        isolateView: true,
                        context: {
                            title: 'Hello Maryna!',
                            content: " ",
                            imgUrl: "https://fiddle.luigi-project.io/img/logos/Luigi-logo_rgb.svg",
                            imgWidth: "300",
                            imgTopMargin: true
                        }
                    }]
                }]
            },
            routing: {
                useHashRouting: true
            },
            settings: {
                responsiveNavigation: 'semiCollapsible',
                header: {
                    title: 'Hello Luigi',
                    logo: 'https://fiddle.luigi-project.io/img/luigi.png'
                }
            }
        });
    </script>
</body>

</html>
```

### Luigi Fiddle

The [Luigi Fiddle](https://fiddle.luigi-project.io/) website is a sandbox playground where you can test Luigi. Simply click on **Modify Config** at the bottom right of the page to make changes to the Luigi application.

### "Hello World" examples

In the **Examples** section of our documentation, you can find links to several "Hello World" example applications which can help you explore Luigi's functions:
* [Angular](https://github.com/luigi-project/luigi/tree/main/core/examples/luigi-example-angular)
* [React](https://github.com/luigi-project/luigi/tree/main/core/examples/luigi-example-react)
* [Vue](https://github.com/luigi-project/luigi/tree/main/core/examples/luigi-example-vue)
* [OpenUI5](https://github.com/luigi-project/luigi/tree/main/core/examples/luigi-example-openui5)
* [Svelte](https://github.com/luigi-project/luigi/tree/main/core/examples/luigi-example-svelte)
* [Plain JavaScript](https://github.com/luigi-project/luigi/tree/main/core/examples/luigi-example-js)
* [NextJS](https://github.com/luigi-project/luigi/tree/main/core/examples/luigi-example-next)

You can install them by following the instructions in the `README` file of each example.

### Luigi shopping app (tutorial)

Our [tutorial](https://developers.sap.com/group.luigi-app.html) on how to create a React and UI5 web-shopping application is intended for beginners, but it still delves deeper into Luigi's functions. It covers topics such as:
- how to create a Luigi app from scratch
- how to use the Luigi Core and Client APIs
- how to create a micro frontend
- how to add localization to your app and display it in multiple languages

Alternatively, the tutorial app can be installed directly by following the `README` file of [this GitHub repository](https://github.com/SAP-samples/luigi-micro-frontend-application).

### e2e example

This example application was created for testing purposes and it includes all possible Luigi features in one place. It is useful if you want to explore our framework in more detail or [contribute](https://github.com/luigi-project/luigi/blob/main/CONTRIBUTING.md) to the Luigi project.

You can find the e2e test application and instructions on how to install it [here](https://github.com/luigi-project/luigi/tree/main/test/e2e-test-application#luigi-sample-and-e2e-test-application-written-in-angular).

### Advanced scenarios

In the [expert scenarios](advanced-scenarios.md) section of the documentation, you can find implementations of more complex Luigi use cases, such as using feature toggles or authenticating with Google Cloud Identity.

<!-- accordion:end -->

## How to obtain support

* [GitHub Discussions](https://github.com/luigi-project/luigi/discussions) - ask (or answer) questions related to Luigi, search for previously answered questions, and rate the answers for helpfulness.

* [Slack Channel](https://luigi-project.slack.com) - get Luigi updates, contact the Luigi team on Slack, and explore previous discussions.

* [GitHub contribution](https://github.com/luigi-project/luigi) - if you have a specific improvement idea or want to contribute to Luigi, you can create an [issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues) and [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests). Please follow our [contribution guidelines](https://github.com/luigi-project/luigi/blob/main/CONTRIBUTING.md) when doing so.