---
title: Luigi v1.13.0
seoMetaDescription: Release notes for Luigi v1.13.0
author:
  - Aleksandra Simeonova
layout: blog
---

Luigi v1.13.0 includes updates of Fundamental Library Styles, new options in the user settings, as well as other features and bug fixes. Read the release notes below to learn more.

<!-- Excerpt -->

#### Breaking changes in Fundamental Library Styles

> **NOTE:** The Fundamental Library Styles changes will only affect you if you have customized Fundamentals CSS in your application.

With Luigi v1.13.0, the new v0.17.0 of Fundamental Library Styles was included. It led to having breaking changes in the Luigi Dialog/Modal layout and Shellbar Counter. New HTML attributes were added to those components to increase accessibility. You can see the new layout of these components here: [Dialog](https://sap.github.io/fundamental-styles/?path=/docs/sap-fiori-components-dialog--docs) and [Shellbar Counter](https://sap.github.io/fundamental-styles/?path=/docs/sap-fiori-components-counter--docs).

#### Extend options of enum type in user settings

In Luigi's [user settings](https://docs.luigi-project.io/docs/user-settings), an `enum` array can now store options objects. You can use them if you want to add more options in the user settings for the user to choose from. These objects need `value` and `label` as key. For example:
```javascript
language: {
  type: 'enum',
  label: 'Language and Region',
  options: [
    { value: 'de', label: 'German' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' }
  ]
}
```
For more information, read the [documentation](https://docs.luigi-project.io/docs/user-settings?section=parameters).

#### Dispatch hashchange event

For viewGroup navigation, a new hashchange event is dispatched if the hash was changed, in order to support UI frameworks whose routers rely on this event. You can see the [PR](https://github.com/luigi-project/luigi/pull/2011) for more details.

#### Introduce i18n variable in viewUrl

In this release, we introduced the environment variable `{i18n.currentLocale}` which can be used in a Luigi viewUrl to indicate the page needs to be translated to a certain language. For example:
```javascript
{
  pathSegment: 'home',
  label: 'Home',
  viewUrl: 'https://example.com/{i18n.currentLocale}/microfrontend.html',
}
  ...
```
`{i18n.currentLocale}` will be replaced by the current locale automatically. You can read more about [viewUrl](https://docs.luigi-project.io/docs/navigation-advanced?section=dynamically-changeable-paths) or [localization](https://docs.luigi-project.io/docs/i18n) in our documentation.

#### Disable browser history option

We added a new parameter that can be added to Luigi's routing configuration section. If the **disableBrowserHistory** parameter is set to `true`, this will prevent any navigation changes from being added to browser history. You can find more details [here](https://docs.luigi-project.io/docs/navigation-parameters-reference?section=routing-parameters).

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).
