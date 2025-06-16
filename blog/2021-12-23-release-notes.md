---
title: Luigi v1.20.0
seoMetaDescription: Release notes for Luigi v1.20.0
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v1.20.0 in the release notes below.

<!-- Excerpt -->

#### New SAP icon styles support

In addition to basic SAP icons, Luigi now supports the use of different SAP Icon suites like TNT and businessSuiteInAppSymbols.
In order to use these icons, it is recommended to add `@font-face` from the [Fundamental Styles](https://sap.github.io/fundamental-styles/?path=/docs/docs-introduction--docs) project configuration to your **custom styles**. You can find more information [here](https://github.com/luigi-project/luigi/pull/2432).

#### Global search improvements

We added two new parameters related to our [global search](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=global-search): [globalSearchCenteredCancelButton](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=globalsearchcenteredcancelbutton) and [searchFieldCentered](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=searchfieldcentered).

When the `searchFieldCentered` boolean is set to `true`, the search input field in Luigi will be rendered in the center of the shellbar.

You can use `globalSearchCenteredCancelButton` to define the label of the cancel button. It will be displayed if you want to hide the search field on a smaller viewport. This property is only available if `searchFieldCentered` is active.

#### Dynamic pathSegment for breadcrumbs and navheader

As of Luigi 1.20, [dynamic pathSegments](https://docs.luigi-project.io/docs/navigation-advanced/?section=dynamic-path-parameters) are also available for breadcrumbs and navheader. You can find more information [here](https://github.com/luigi-project/luigi/pull/2370).

#### Parameter handlers improvements

In Luigi 1.20, we added an optional boolean argument called `keepBrowserHistory` to [addCoreSearchParams](https://docs.luigi-project.io/docs/luigi-client-api/?section=addcoresearchparams). It allows for the change of params without an additional browser history entry.
We also added a function to manipulate current node parameters called [addNodeParams](https://docs.luigi-project.io/docs/luigi-client-api/?section=addnodeparams) which provides the same functionality. It gives you the option to keep browser history or not. You can find more information [here](https://github.com/luigi-project/luigi/pull/2409).

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).

