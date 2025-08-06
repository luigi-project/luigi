---
title: Luigi v1.4.0
seoMetaDescription: Release notes for Luigi v1.4.0
author:
  - Aleksandra Simeonova
layout: blog
---

Luigi v1.4.0 includes new features such as support for theming and feature toggles. You can find more information in the release notes below.
<!-- Excerpt -->

#### Theming API

Luigi now supports theming, which can help you provide a better user experience. For example, you can enable a light and dark theme for your app. For more details on how to use theming, go to the Luigi Core API [theming section](https://docs.luigi-project.io/docs/luigi-core-api/?section=theming).

#### Feature toggles

As of v1.4.0, Luigi also offers support for feature toggles. [Feature toggles](https://martinfowler.com/articles/feature-toggles.html) are a technique that can make development teams more efficient. Luigi allows you to add feature toggles through the Core API or through URL parameters. The full documentation can be found [here](https://docs.luigi-project.io/docs/advanced-scenarios).

#### Luigi example with NextJS

Have you ever wondered if you can use Luigi with NextJS? The answer is "yes", and in this release we included a new example Luigi application that is running on top of NextJS. You can install the example and try it yourself by following the steps [here](https://github.com/luigi-project/luigi/tree/main/core/examples/luigi-example-next).

#### Fundamental Styles update

With Luigi v1.4.0, the new v0.11.0 of Fundamental Library Styles were included. As a result, there were breaking changes to the Luigi Alerts. The classes `fd-overlay fd-overlay--message-strip` were removed from Fundamental Library Styles and we added a new class `luigi-alert--overlay` to keep the same look and feel as in the past. You can see all breaking changes of Fundamental Library Styles [here](https://github.com/SAP/fundamental-styles/wiki/Breaking-Changes#0110).

#### Core and Client API additions

Two new functions were added to the Luigi Core API, [setDocumentTitle](https://docs.luigi-project.io/docs/luigi-core-api/?section=setdocumenttitle) and [getDocumentTitle](https://docs.luigi-project.io/docs/luigi-core-api/?section=getdocumenttitle). They allow you to set and get a document title without configuring the Luigi header.

The Luigi Client API also includes a new function, [closeCurrentModal](https://docs.luigi-project.io/docs/luigi-client-api/?section=closecurrentmodal), which fires a `luigi.close-modal` event.

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).