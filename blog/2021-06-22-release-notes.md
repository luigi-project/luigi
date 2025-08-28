---
title: Luigi v1.14.0
seoMetaDescription: Release notes for Luigi v1.14.0
author:
  - Aleksandra Simeonova
layout: blog
---

Luigi v1.14.0 includes an update to a new version of Fundamental Library Styles, new options in the user settings, and a new Core API function. Read the release notes below to learn more.

<!-- Excerpt -->

#### Update Fundamental Library Styles to v0.18

In this release, we updated the version of Fundamental Styles from v0.17 to v0.18. There is a new layout for User Menu from Fiori 3. You can find more details on the [Fundamental Styles page](https://sap.github.io/fundamental-styles/?path=/docs/sap-fiori-components-user-menu--docs).

#### Extend Luigi Emulator functionality

We improved the Luigi testing utilities, which you can learn more about in our [documentation](https://docs.luigi-project.io/docs/framework-support-libraries/?section=luigi-testing-utilities).

The Luigi Emulator was extended with the following features:
- Add LuigiMockModule and LuigiMockUtil.
- LuigiMockModule is part of @luigi-project/client-support-angular
- LuigiMockUtil will be part of the new @luigi-project/testing-utils
- Luigi Mock message elements are added onto the DOM and hidden from end user.

#### Add User Settings placeholder

It is now possible to specify placeholder values for input fields in the User Settings configuration. For example:

```javascript
userAccount: {
      label: 'User Account',
      sublabel: 'username',
      icon: 'account',
      title: 'User Account',
      settings: {
        name: { type: 'string', label: 'Name', placeholder: 'Type your name' },
        ...
        }
 }
```

This feature is optional and you can find more information in the [User Settings](https://docs.luigi-project.io/docs/user-settings) Luigi documentation.

#### Reset Luigi via the Luigi Core API

There are situations where you want to completely reset Luigi's state (cached micro frontends, etc.) e.g. if a very basic thing has changed at runtime that affects the whole application, like a theme switch, but a full page refresh is not desired.

To make this easier, we included a new `reset` function in the Luigi Core API. You can find the details in the [Core API documentation](https://docs.luigi-project.io/docs/luigi-core-api/?section=reset).

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).

