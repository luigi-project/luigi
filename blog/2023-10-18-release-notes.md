---
title: Luigi v2.7
seoMetaDescription: Release notes for Luigi v2.7
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v2.7 in the release notes below.

<!-- Excerpt -->

#### New webcomponentCreationInterceptor function

We added the function `webcomponentCreationInterceptor` which can be included in the [general settings](https://docs.luigi-project.io/docs/general-settings) configuration. The function is called on web component creation, and it gives you full control over the created web component DOM element. You can modify it according to your needs just before it is added to the DOM tree. You can find more details in the [documentation](https://docs.luigi-project.io/docs/general-settings/?section=webcomponentcreationinterceptor).

#### Option to disable topNav for children of root node

In this release, we added the `topNav` navigation parameter. It is a boolean which determines whether children of the root node will be shown in the top navigation. If set to `false`, children of the root node will not be rendered in the top navigation, but in the left navigation (default) or in the horizontal navigation (tabNav) if this is configured on the node. You can find more information as well as an example in the [documentation](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=topnav).

#### Luigi Client functions for web components 

In this release, we added the possibility to use more Luigi Client functions with [web-component-based](https://docs.luigi-project.io/docs/web-component) micro frontends. The following functions are now also available for web components: 
- [getPathParams](https://docs.luigi-project.io/docs/luigi-client-api/?section=getpathparams) - returns the dynamic path parameters of the active URL
- [getCoreSearchParams](https://docs.luigi-project.io/docs/luigi-client-api/?section=getcoresearchparams) - reads search query parameters which are sent from Luigi Core
- [getClientPermissions](https://docs.luigi-project.io/docs/luigi-client-api/?section=getclientpermissions) - returns the current Client permissions as specified in the navigation node.
- [getAnchor](https://docs.luigi-project.io/docs/luigi-client-api/?section=getanchor) - returns the current anchor based on the active URL.

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).
