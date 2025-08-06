---
title: Luigi v2.2
seoMetaDescription: Release notes for Luigi v2.2
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v2.2 in the release notes below.

<!-- Excerpt -->

#### setViewGroupData function

A new `setViewGroupData` function was added to the [Luigi Client API](https://docs.luigi-project.io/docs/luigi-client-api). It allows you to conveniently change node labels within the same [view group](https://docs.luigi-project.io/docs/navigation-advanced?section=view-groups). In your Luigi node configuration, you can enable it with e.g. `label: 'my Node {viewGroupData.vg1}'` and use the function to add a label: `LuigiClient.setViewGroupData({'vg1':' Luigi rocks!'})`. You can find more information in the [documentation](https://docs.luigi-project.io/docs/luigi-client-api/?section=setviewgroupdata).

#### TabNav header micro frontend

In Luigi v2.2, we added a new feature that allows you to create a micro frontend header in the horizontal navigation, a.k.a. [tabNav](https://docs.luigi-project.io/docs/navigation-advanced?section=tab-navigation). This feature can only be used if [web components](https://docs.luigi-project.io/docs/web-component) are enabled and the `showAsTabHeader` parameter is set to `true`. You can find more information in the [documentation](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=tabnav).

#### Breadcrumbs feature

Luigi v2.2 allows you to add a [breadcrumbs](https://developer.mozilla.org/en-US/docs/Web/CSS/Layout_cookbook/Breadcrumb_Navigation) element to your navigation. You have the freedom to configure the look and feel of the breadcrumbs by creating your own custom code for them. At the end, your code should return a variable called `breadcrumbs`. You can find a couple of examples in the [documentation](https://docs.luigi-project.io/docs/navigation-advanced?section=breadcrumbs).

#### Prevent re-rendering of web components 

In certain cases, such as when web components got a context update, they were re-rendered. We fixed this in Luigi v2.2. For more information, see the [pull request](https://github.com/luigi-project/luigi/pull/3226). 

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).

