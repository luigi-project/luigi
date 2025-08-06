---
title: Luigi Container v1.6 
seoMetaDescription: Release notes for Luigi Container v1.6
author:
  - Johannes Doberer
layout: blog
---

You can read about the new features in Luigi Container v1.6 in the release notes below.

<!-- Excerpt -->


#### Renamed `closeAlert` to `notifyAlertClosed`

We deprecated the function `closeAlert` and renamed it to `notifyAlertClosed`.

#### showAlert promise for micro frontends based on webcomponents

The `showAlert` function returns a promise for micro frontends based on web components. The promise resolves to either a `dismissKey`, if defined in the alert settings, or the unique ID of the alert.

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/releases/tag/container%2Fv1.6.0).