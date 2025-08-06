---
title: Luigi v1.21.0
seoMetaDescription: Release notes for Luigi v1.21.0
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v1.21.0 in the release notes below.

<!-- Excerpt -->


#### Update to Fundamental Styles v0.20.0

With Luigi v.1.21 release, we updated to version 0.20.0 of Fundamental Styles. This included a small change in the `columns` attribute of our [product switcher](https://docs.luigi-project.io/docs/navigation-parameters-reference?section=product-switcher). You can set the number of columns to `auto`, which would result in 3 columns if the entities are less than or equal to 6, or 4 columns if not. You can find more information [here](https://github.com/luigi-project/luigi/pull/2584).

#### Automatic navigation for modalPathParam

It is now possible to keep Luigi Core and Luigi Client navigation in sync for modals with a [modalPathParam](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=modalpathparam). This means that when the user navigates to a new URL inside a modal, the Luigi Core path changes as well. You can use the [ClientSupportAngular](https://docs.luigi-project.io/docs/framework-support-libraries) library to use this feature with an Angular app. 

#### More precise settings for modal size

Instead of only having three default sizes for a modal, the user can now specify an exact size in  'px', '%', 'rem', 'em', 'vh' or 'vw'. We introduced the `modalSettings.width` and `modalSettings.height` parameters for this purpose. You can find more information in the [Luigi documentation](https://docs.luigi-project.io/docs/luigi-core-api/?section=openasmodal).

#### Removal of experimental flag for web components

As of Luigi v.1.21.0, it is not required to include the `experimental` flag to enable web components. You can find more information [here](https://github.com/luigi-project/luigi/pull/2622). 

#### keepURL in PageNotFoundHandler

A new parameter `keepURL` for the [PageNotFoundHandler](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=pagenotfoundhandler) function allows you to change the main URL behavior in case of a "Page Not Found" error. You can now define to keep the erroneous URL in the browsers address bar (e.g. to correct a typo). An example configuration would look like this: 

```js
...
 routing: {
              useHashRouting: true,
              pageNotFoundHandler: (path, anyMatch) => {
                return {
                  redirectTo: '/error',
                  keepURL: true
                };
              }
          },
...
```

#### Luigi Core navigate function returns promise

The [navigate](https://docs.luigi-project.io/docs/luigi-core-api/?section=navigate) function in Luigi returns a promise, which makes it easier to perform actions after changing the route. You can find more information [here](https://github.com/luigi-project/luigi/issues/2257). 

####  New getNavFooterContainer function 

In Luigi v.1.21, we added a new [function](https://docs.luigi-project.io/docs/general-settings/?section=getnavfootercontainer) which allows you to get the footer container. It looks like this: 
```js
 Luigi.elements().getNavFooterContainer()
```
You can find more information [here](https://github.com/luigi-project/luigi/pull/2488).

#### Url anchor support for micro frontends

Two new functions were introduced in the Luigi Client API: `getAnchor()` and `setAnchor()`. They allow the micro frontend to read and write the anchor part of the main URL to leverage in-page navigation such as scrolling. For example, if your URL is `http://example.com#myAnchor`, the function `LuigiClient.getAnchor()` would return a string `myAnchor`. You can find more information [here](https://github.com/luigi-project/luigi/pull/2599). 

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).

