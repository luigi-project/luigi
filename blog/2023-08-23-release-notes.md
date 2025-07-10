---
title: Luigi v2.4
seoMetaDescription: Release notes for Luigi v2.4
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v2.4 in the release notes below.

<!-- Excerpt -->

#### Luigi Client functions for web components

With this release, we added the possibility to use more Luigi Client functions with [web-component-based](https://docs.luigi-project.io/docs/web-component) micro frontends. The following functions are now available also for web components: 
- [addNodeParams](https://docs.luigi-project.io/docs/luigi-client-api/?section=addnodeparams) - sets node parameters in Luigi Core
- [getNodeParams](https://docs.luigi-project.io/docs/luigi-client-api/?section=getnodeparams) - returns the node parameters of the active URL
- [setAnchor](https://docs.luigi-project.io/docs/luigi-client-api/?section=setanchor) - sends anchor to Luigi Core
- [modalSettings.keepPrevious](https://docs.luigi-project.io/docs/luigi-client-api?section=openasmodal) - allows you to open multiple modals

#### Added onLoad functionality for web components

We added an onLoad functionality to web component micro frontends. An event `wc_ready` is sent when the web component is ready, which should then initialize Luigi Client. It is possible to defer this initialization using `deferLuigiClientWCInit: true`. For more information, see the [pull request](https://github.com/luigi-project/luigi/pull/3352).  

#### data-testid attribute for the modal close button 

In this release, we added the possibility to configure a `data-testid` attribute for the close button of a modal. The attribute can be specified via the `modalSettings` in [openAsModal](https://docs.luigi-project.io/docs/luigi-core-api/?section=openasmodal). For more information, see the [pull request](https://github.com/luigi-project/luigi/pull/3394). 

#### Removed onunload listener 

Due to [deprecation](https://developer.chrome.com/blog/deprecating-unload/) of the `unload` event, we removed the `onunload` listener from Luigi. 

