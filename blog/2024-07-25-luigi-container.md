---
title: Luigi Container v1.2 
seoMetaDescription: Release notes for Luigi Container v1.2
author:
  - Johannes Doberer
layout: blog
---

You can read about the new features in Luigi Container v1.2 in the release notes below.

<!-- Excerpt -->

#### Added new function to the api

With this release we added [navigateToIntent](https://docs.luigi-project.io/docs/luigi-core-api?section=navigatetointent) to the webcomponent client API.
In addition LuigiContainer supports [getToken](https://docs.luigi-project.io/docs/luigi-container-api?section=authdata) function for iframe based micro frontends as well as [getCurrentRoute](https://docs.luigi-project.io/docs/luigi-core-api?section=getcurrentroute) and [fromParent](https://docs.luigi-project.io/docs/luigi-core-api?section=getcurrentroute) for webcomponent micro frontends.

#### Light dom container

Furthermore we added the attribute `no-shadow` to the [Luigi Container](https://docs.luigi-project.io/docs/luigi-container-api?section=noshadow) and [Luigi Compound Container](https://docs.luigi-project.io/docs/luigi-compound-container-api?section=noshadow). With this option, the containers do not have a shadow DOM.

#### Security for iframe based micro frontends

With this version you have the possibility to specify [sandbox](https://docs.luigi-project.io/docs/luigi-compound-container-api?section=noshadow) and [allow rules](https://docs.luigi-project.io/docs/luigi-container-api?section=allowrules) for iframe based micro frontends.

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/releases/tag/container%2Fv1.2.0).