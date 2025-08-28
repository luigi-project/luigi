---
title: Luigi v2.3
seoMetaDescription: Release notes for Luigi v2.3
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v2.3 in the release notes below.

<!-- Excerpt -->

#### Write updated modal settings to URL

In this release, we added some new features to the [updateModalSettings](https://docs.luigi-project.io/docs/luigi-client-api/?section=updatemodalsettings) function. If `routing.showModalPathInUrl` is set to true, the URL will be updated with the modal settings data. With the new `addHistoryEntry` parameter, you can also add an entry in the browser history by setting it to `true`.
You can find more information in the feature's [pull request](https://github.com/luigi-project/luigi/pull/3339).

#### Expand category by navigation

We added the option to expand the left-side menu by navigating to the children of a Luigi category. You can configure this option in the Luigi [general settings](https://docs.luigi-project.io/docs/general-settings). Simply set the `expandCategoryByNavigation` to true. 

#### Transfer theme variables

This new Luigi feature allows you to transfer a dedicated list of CSS variables to the micro frontends. You can optionally set this in the Luigi [general settings](https://docs.luigi-project.io/docs/general-settings?section=theming) as part of the `theming` element. Additionally, you can use the method `getCSSVariables` in the [Luigi Core API](https://docs.luigi-project.io/docs/luigi-core-api?section=getcssvariables) and [Client API](https://docs.luigi-project.io/docs/luigi-client-api?section=getcssvariables). For more information, see the [pull request](https://github.com/luigi-project/luigi/pull/3234).

#### Semi-collapsible button style

In Luigi 2.3, we introduced the option to define a style for the button to expand/close a semi-collapsible menu. You  can do this with the help of the new [semiCollapsibleButtonStyle](https://docs.luigi-project.io/docs/general-settings?section=semicollapsiblebuttonstyle) parameter. You can find more information in the [pull request](https://github.com/luigi-project/luigi/pull/3285).

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).
