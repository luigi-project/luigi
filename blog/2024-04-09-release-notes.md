---
title: Luigi v2.10
seoMetaDescription: Release notes for Luigi v2.10
author:
  - Mahati Shankar
layout: blog
---

You can read about the new features in Luigi v2.10 in the release notes below.

<!-- Excerpt -->


####  Added an On Close Promise for LuigiClient's openAsModal

We've added a promise to the Luigi Client's openAsModal that resolves when the modal is closed. You can also access the `goBackContext` When you close the modal using LuigiClient.linkManager().goBack({ foo: 'bar' }).


#### Cypress Is Now Supported by the Testing Utilities  

We have extended the scope of Luigi testing utilities to add cypress support. This will help with writing end-to-end (e2e) tests for your Luigi projects.

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).