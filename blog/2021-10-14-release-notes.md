---
title: Luigi v1.17.0
seoMetaDescription: Release notes for Luigi v1.17.0
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v1.17.0 in the release notes below.

<!-- Excerpt -->

#### New replaceIntentRoute parameter

A new parameter [replaceIntentRoute](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=replaceintentroute) was introduced. It defines whether the intent navigation route resolves to actual path automatically or not.

For example, when the parameter is defined, an address `http://localhost:4200/#?intent=Sales-settings?param1=abc&param2=bcd`
will be translated to its actual path: `http://localhost:4200/projects/pr2/settings?~param1=abc&~param2=bcd`. And with hashRouting enabled, the example `http://localhost:4200/#?intent=Sales-settings?param1=abc&param2=bcd` will translate to:`http://localhost:4200/#/projects/pr2/settings?~param1=abc&~param2=bcd`.

#### Improved user settings

The dropdown in Luigi's [user settings](https://docs.luigi-project.io/docs/user-settings) dialog was refactored to the latest Fiori3 specifications to be easily accessible via keyboard. You can find more information [here](https://github.com/luigi-project/luigi/pull/2293).

Also, the Profile dropdown entities in user settings are now accessible via keyboard. You can learn more [here](https://github.com/luigi-project/luigi/pull/2256).

#### getCurrentLocale works with Luigi Client Web Components

With our newest release, you can use the [getCurrentLocale](https://docs.luigi-project.io/docs/luigi-client-api/?section=getcurrentlocale) function within [Web Components](https://docs.luigi-project.io/docs/web-component) of Luigi Client. For more information see the changes [here](https://github.com/luigi-project/luigi/pull/2219).

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).

