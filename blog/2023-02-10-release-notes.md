---
title: Luigi v2.0
seoMetaDescription: Release notes for Luigi v2.0
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v2.0 in the release notes below.

<!-- Excerpt -->

The Luigi project has reached a new milestone and released Luigi 2.0! There are some important changes in this release which users should take note of.

#### Ending support for IE11 

As of v2.0, Luigi will no longer be able to support the Internet Explorer 11 browser. IE11 is also no longer supported by [Microsoft](https://learn.microsoft.com/en-us/lifecycle/products/internet-explorer-11) and Edge is recommended instead.

#### Updating to Angular 14 and 15 

Luigi v2.0 will no longer be able to support Angular versions 13 or below. The [Luigi Angular support library](https://docs.luigi-project.io/docs/framework-support-libraries) can now be used with Angular 14 or 15 instead. You can read about how to update your Angular version [here](https://angular.io/guide/updating). 

#### Renaming GitHub branch to `main`

For Luigi v2.0, we renamed our GitHub default branch from `master` to `main`. This means that if you have cloned the [Luigi repository](https://github.com/luigi-project/luigi), you need to switch to the `main` branch. You can use the following commands to do so:

```bash
git branch -m master main
git fetch upstream
git branch -u upstream/main main
```

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).

