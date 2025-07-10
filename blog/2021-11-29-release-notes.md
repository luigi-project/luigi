---
title: Luigi v1.19.0
seoMetaDescription: Release notes for Luigi v1.18.0
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v1.19.0 in the release notes below.

<!-- Excerpt -->

#### Replacing CSS static value with SAP Fiori 3 variable

We replaced the CSS static value in LeftNav with a SAP Fiori 3 variable. Now, in [Luigi background themes](https://docs.luigi-project.io/docs/luigi-core-api/?section=theming), Fiori 3 variables are used instead of plain colors. To switch theme, you can replace the CSS variables stylesheet.

You can find more information [here](https://github.com/luigi-project/luigi/pull/2369).


#### Node category merging improvements

We improved the Luigi [category property](https://docs.luigi-project.io/docs/navigation-configuration/?section=category). Now, the  first node with a "non-string" category can define the category's configuration and the category config object includes a new property `id`. If defined, it serves as the "collection key" for categorized nodes instead of the `label` property. You can find more information [here](https://github.com/luigi-project/luigi/pull/2352).


#### New Core API function clearNavigationCache

We introduced a new Core API function called `clearNavigationCache`. It allows you to clean nodeData cache for children resolution and titleResolver cache. For more information, see the [documentation](https://docs.luigi-project.io/docs/luigi-core-api/?section=clearnavigationcache) and [PR](https://github.com/luigi-project/luigi/pull/2383).

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).

