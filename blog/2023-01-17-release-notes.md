---
title: Luigi v1.26.0
seoMetaDescription: Release notes for Luigi v1.26.0
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v1.26.0 in the release notes below.

<!-- Excerpt -->

#### Enhanced Left Navigation Accessibility

In Luigi v1.26.0, we resolved issues related to accessibility in the left side navigation. We made the collapsed-state left navigation buttons accessible via keyboard and the collapsed-state category popups closeable via the `escape` key. For reference, see the [pull request](https://github.com/luigi-project/luigi/pull/3094).

#### Callback Added to OpenAsModal for Core API

We added the parameter `onCloseCallback` to [openAsModal](https://docs.luigi-project.io/docs/luigi-core-api/?section=openasmodal) in the Luigi Core API. The callback function is called upon closing the opened modal. For more information, see the [pull request](https://github.com/luigi-project/luigi/pull/3049).

#### Luigi Client Type Declaration for Web Components

In this release, we added Luigi Client type declaration for [Web Components](https://docs.luigi-project.io/docs/web-component). For more information, see the [pull request](https://github.com/luigi-project/luigi/pull/2963).

#### Alignment of StatusBadge
 
We added a new property which allows you to set the alignment of Luigi's [status badge](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=statusbadge) element. You can set the `align` attribute to `right` or `left`, and the default is `left`. For example: 
```js
statusBadge: {
    label: 'Settings',
    type: 'positive',
    align: 'right'   
```

#### Titles for Expand and Collapse Category Buttons

In the current release, we introduced a way to configure a title/label for expand and collapse buttons on navigation node categories. You can configure each button individually by using the [category](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=category) attributes `titleExpandButton` and `titleCollapseButton`, or you can set defaults for all buttons using [defaults.category](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=defaultscategory).


#### Function 'isDrawer' in Luigi Client API

In Luigi v1.26.0, we added the [isDrawer](https://docs.luigi-project.io/docs/luigi-client-api/?section=isdrawer) function to the Luigi Client API. This function checks if the current micro frontend is displayed inside a drawer. Some similar functions that were already available before this release are `isModal` and `isSplitview`. 

#### External Link Option for Intent-Based Navigation

We added the possibility to define external links for [intent-based navigation](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=intentmapping). For example, for this intentMapping: 
```js
{
      semanticObject: 'External',
      action: 'view',
      externalLink: { url: 'https://www.sap.com', openInNewTab: true }
}
```
Any of the following should navigate to `www.sap.com` in a new tab:
```js
LuigiClient.linkManager().navigateToIntent('External-view')
LuigiClient.linkManager().navigate('/#?intent=External-view')
Luigi.navigation().navigate('/#?intent=External-view')
```
See the [pull request](https://github.com/luigi-project/luigi/pull/2941) and [advanced scenarios](https://docs.luigi-project.io/docs/advanced-scenarios) for more information. 

#### LuigiElement Shadow Mode Configuration 

Luigi Client's LuigiElement no longer sets the shadow mode to `closed`. Instead, there is an option to configure it as `open` or closed. See the [pull request](https://github.com/luigi-project/luigi/pull/2932) for more information.

#### History Handling for Modals

In this release, we improved the browser history handling of [modals](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=opennodeinmodal). Due to the limitation of the `history.length` object to 50 entries in Chrome and Firefox browsers, this was changed to a `history.state` object. See the [pull request](https://github.com/luigi-project/luigi/pull/3072) for more information.

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).
