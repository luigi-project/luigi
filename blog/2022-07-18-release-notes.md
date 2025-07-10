---
title: Luigi v1.24.0
seoMetaDescription: Release notes for Luigi v1.24.0
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v1.24.0 in the release notes below.

<!-- Excerpt -->
#### Custom item renderer for app switcher

With this release, we added an `itemRenderer` to the app switcher which allows you to fully customize the list of items that appear in the app switcher. It also allows you to add a function to close the custom app switcher dropdown. You can find more information in the [documentation](https://docs.luigi-project.io/docs/navigation-parameters-reference?section=app-switcher). 


#### Responsive padding for the Shellbar Component

We added a way to make the Shellbar padding responsive by using the `header.responsiveShellbarPaddings` parameter. This means the top navigation will be adapted automatically for different devices. This feature became available with the latest Fundamental Styles [release](https://github.com/SAP/fundamental-styles/releases/tag/v0.24.1).

#### Multiple modal dialogs

Luigi now allows you to open multiple modals by using the `modalSettings.keepPrevious` API function. When you set this to `true`, the previously opened modal will be kept allowing to open another model on top of it. By default, the previous modals are discarded. You can find more information in the relevant [documentation](https://docs.luigi-project.io/docs/luigi-client-api/?section=openasmodal) and [pull request](https://github.com/luigi-project/luigi/pull/2785). 

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).
