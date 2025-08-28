---
title: Luigi v1.16.0
seoMetaDescription: Release notes for Luigi v1.16.0
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v1.16.0 in the release notes below.

<!-- Excerpt -->

#### Extended intent based navigation

A new API method [navigateToIntent](https://docs.luigi-project.io/docs/luigi-client-api/?section=navigatetointent) was introduced. The method internally generates a URL of the form `#?intent=<semantic object>-<action>?<param_name>=<param_value>` through the given input arguments. This then follows a call to the original `linkManager.navigate(...)` function. Consequently, the following calls will have the exact same effect:

```javascript
linkManager().navigateToIntent('Sales-settings', {project: 'pr2', user: 'john'})
linkManager().navigate('/#?intent=Sales-settings?project=pr2&user=john')
```

#### newTab option in linkManager

This is another improvement to the Luigi Client linkManager API. It is an option that allows you to open paths in a new window through Luigi Client linkManager:

```javascript
LuigiClient.linkManager().newTab().navigate('/projects/xy/foobar');
```

You can read more in the documentation [here](https://docs.luigi-project.io/docs/luigi-client-api/?section=newtab).

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).

