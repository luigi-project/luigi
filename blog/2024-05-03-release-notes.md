---
title: Luigi v2.12
seoMetaDescription: Release notes for Luigi v2.12
author:
  - Mahati Shankar
layout: blog
---

You can read about the new features in Luigi v2.12 in the release notes below.

<!-- Excerpt -->


#### Opt Out of Luigi Error Handling for 404s

If you have implemented your own `page not found` error handler function, then you can set [**ignoreLuigiErrorHandling**](https://docs.luigi-project.io/docs/navigation-parameters-reference?section=pagenotfoundhandler) to `true` in your routing configuration.

#### Update Context via Core API

This addition lets you update the context values for visible iframes and Luigi web components.

#### Remove Favicon Console Warning

The console warning that appears when the favicon isn't present or is in the wrong format has been removed.




#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).