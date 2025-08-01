---
title: Luigi v1.18.0
seoMetaDescription: Release notes for Luigi v1.18.0
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v1.18.0 in the release notes below.

<!-- Excerpt -->

#### customAlertHandler function

The new **customAlertHandler** function allows you to disable the default Luigi alerts and configure your own. It receives `settings` and `openFromClient` as parameters. For example:

```javascript
Luigi.setConfig({
  ...,
  settings: {
    customAlertHandler: ()=>{
     return new Promise((resolve, reject) => {
       //custom alert implementation
     });
    }
  }
})
```

You can find more information [here](https://github.com/luigi-project/luigi/pull/2304) or in the [general settings](https://docs.luigi-project.io/docs/general-settings) documentation.


#### TooltipText parameter

We implemented a new `TooltipText` parameter which allows you to set a custom tooltip which will be shown when you hover over the nodes in the navigation. The parameter needs to be added to the `navigation:` section of the Luigi configuration file. Additionally, there is a `defaults.tooltipText` [parameter](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=defaultstooltiptext) which allows you to set (or disable) the tooltip for all nodes. For more information, read the [documentation](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=tooltiptext).


#### updateModalSettings method

The new Luigi Client method `updateModalSettings` allows you to change the size and title of a modal. This means that if the open micro frontend changes route internally, it can be reflected in the modal header. You can find more information in the [Luigi Client API](https://docs.luigi-project.io/docs/luigi-client-api/?section=updatemodalsettings).

#### Core API templating for compound children and external link nodes

We enabled Core API templating for compound children and external link nodes, meaning it's possible to use `{i18n.currentLocale}` with a viewUrl. You can find more information [here](https://github.com/luigi-project/luigi/pull/2288).

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).

