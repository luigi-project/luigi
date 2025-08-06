---
title: Luigi v2.5
seoMetaDescription: Release notes for Luigi v2.5
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v2.5 in the release notes below.

<!-- Excerpt -->

#### Global context

In Luigi v2.5, we added a new `globalContext` navigation parameter and a set of Luigi Core API functions: `setGlobalContext` and `getGlobalContext`. The global context contains key-object pairs which are inherited from all node [contexts](https://docs.luigi-project.io/docs/navigation-advanced?section=contexts). You can find more information in the [pull request](https://github.com/luigi-project/luigi/pull/3416). 

#### Return empty object for getContext 

Within the [Client Support Angular](https://docs.luigi-project.io/docs/framework-support-libraries?section=angular-support-library) library, the [LuigiContextService.getContext](https://github.com/luigi-project/luigi/blob/main/client-frameworks-support/client-support-angular/projects/client-support-angular/src/lib/service/luigi-context.service.impl.ts#L30) function can now return an empty object if not set yet. Previously, this value could be null/undefined. You can find more information in the [pull request](https://github.com/luigi-project/luigi/pull/3405). 

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).
