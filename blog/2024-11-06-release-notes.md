---
title: Luigi v2.18
seoMetaDescription: Release notes for Luigi v2.18
author:
  - Johannes Doberer
layout: blog
---

You can read about the new features in Luigi v2.18 in the release notes below.

<!-- Excerpt -->

#### disableTpcCheck Has Been Added

The 'disableTpcCheck' parameter has been added to [addInitListener](https://docs.luigi-project.io/docs/luigi-client-api?section=addinitlistener) the Luigi client - if set to `true` third party cookie check will be disabled via LuigiClient.

#### disable-tpc-check Has Been Added

There's an option to disable third party cookie check declaratively - the 'disable-tpc-check' attribute must be added to the entry HTML file. For more information check [authorization configuration](https://docs.luigi-project.io/docs/authorization-configuration?section=third-party-cookies-and-silent-token-refresh) in our documentation.

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).