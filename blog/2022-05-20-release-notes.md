---
title: Luigi v1.22.0
seoMetaDescription: Release notes for Luigi v1.22.0
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v1.22.0 in the release notes below.

<!-- Excerpt -->


#### Update to Fundamental Styles v0.23.0

With the new release, we updated Luigi Core to version 0.23.0 of Fundamental Styles. You can read about all changes in the [release notes](https://github.com/SAP/fundamental-styles/releases/tag/v0.23.0). This update brought breaking changes and was described in the [Fundamental Library blog post](https://blogs.sap.com/2022/04/14/fundamental-library-styles-update/). You can also review the Luigi changes [here](https://github.com/luigi-project/luigi/pull/2698). 

#### Disable keyboard accessibility on all elements outside drawers and modals

When a drawer, modal, or confirmation modal is opened, keyboard actions outside of them are now disabled. Pressing TAB key will no longer select elements in the background that are not part of the modal/drawer. For more information, see the Luigi issues [2411](https://github.com/luigi-project/luigi/issues/2411) and [2690](https://github.com/luigi-project/luigi/issues/2690).

#### Add functionality for allow attribute to be separated by semicolons

Luigi [allowRules](https://docs.luigi-project.io/docs/general-settings/?section=allowrules) now follow the [Feature Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Feature_Policy) convention and allow the attributes to be separated by semicolons. You can find more information [here](https://github.com/luigi-project/luigi/pull/2642). 

#### Bugfixes

For a full list of bugfixes, see the [GitHub release page](https://github.com/luigi-project/luigi/releases/tag/v1.22.0).
