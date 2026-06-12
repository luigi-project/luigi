---
title: Luigi v2.31.0
seoMetaDescription: Release notes for Luigi v2.31.0
author:
  - Johannes Doberer
layout: blog
---

You can read about the new features in Luigi v2.31.0 in the release notes below.

<!-- Excerpt -->

#### Category selection indicator

Collapsed navigation categories in the left nav now display a selection highlight when one of their child nodes is the currently active route, providing better visual feedback for users navigating nested menu structures. See [#5175](https://github.com/luigi-project/luigi/pull/5175).

#### setDirtyStatus for Web Component Client API

The `setDirtyStatus` method is now available in the Web Component Client API, bringing parity with the iframe-based client. This allows web component micro frontends to indicate unsaved changes and trigger confirmation dialogs on navigation. See [#5166](https://github.com/luigi-project/luigi/pull/5166).

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).
