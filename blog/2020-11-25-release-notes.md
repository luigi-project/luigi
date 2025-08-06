---
title: Luigi v1.6.0
seoMetaDescription: Release notes for Luigi v1.6.0
author:
  - Aleksandra Simeonova
layout: blog
---

Luigi v1.6.0 offers new features related to the Luigi APIs. New functions for local storage can help developers create more efficient applications. A new drawer component was also added. To learn more, read the release notes below.
<!-- Excerpt -->

#### Storage API for micro frontends

In Luigi 1.6.0, we implemented a few API functions that will enable the use of local storage with Luigi Core and Luigi Client. The Client can send storage messages which are received by the Core. This means different micro frontends can now share or persist items using the browser's local storage. To learn more, read the [documentation](https://docs.luigi-project.io/docs/luigi-client-api/?section=storagemanager).

#### Drawer component

It is now possible to open a micro frontend in a drawer. This feature can be implemented using the Luigi APIs. The drawer size, backdrop, and header can be configured by the developer using simple parameters. You can find the corresponding functions in our documentation for the [Luigi Core](https://docs.luigi-project.io/docs/luigi-core-api/?section=openasdrawer) and [Luigi Client](https://docs.luigi-project.io/docs/luigi-client-api/?section=openasdrawer).

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).