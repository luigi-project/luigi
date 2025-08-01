---
title: Luigi v1.25.0
seoMetaDescription: Release notes for Luigi v1.25.0
author:
  - Aleksandra Simeonova
layout: blog
---

You can read about the new features in Luigi v1.25.0 in the release notes below.

<!-- Excerpt -->

#### Ignore events from inactive iframes

With the changes made in Luigi v1.25, you will have the configurable option to no longer trigger events when an iframe micro frontend is not active. For reference, see the [pull request](https://github.com/luigi-project/luigi/pull/2908).

#### getActiveFeatureToggles in Luigi Web Components

We added the function [getActiveFeatureToggleList](https://docs.luigi-project.io/docs/luigi-core-api/?section=examples-58) to the Luigi Web Components API. For more information, see the [pull request](https://github.com/luigi-project/luigi/pull/2893). 

#### Create React App Luigi Template

[Create React App](https://github.com/facebook/create-react-app) is a simple way to create React apps with no build configuration. With this release, Luigi added a new template to enable you to quickly deploy React micro frontends with Luigi. You can find the template on our [GitHub repository](https://github.com/luigi-project/luigi/tree/main/cra-template).

#### Implement tests by using luigi mock module

Starting from this release, you can test Luigi using the Luigi mock module. This feature enables you to test micro frontends standalone without depending on Luigi Core. In the usual workflow, messages coming from Luigi Client to Luigi Core are processed by the Core and a proper response is sent back. However, by adding the Luigi mock module for Angular to your imports, you can intercept all  Client calls and send a mocked Core response back. You can find more information in the [documentation](https://docs.luigi-project.io/docs/framework-support-libraries?section=luigimockmodule). 

#### ViewGroup Background Option

In Luigi v1.25, we introduced the **loadOnStartup** property, which is added to a [viewGroupSettings](https://docs.luigi-project.io/docs/navigation-advanced/?section=viewgroupsettings) entry, in order to specify that a [viewGroup](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=viewgroup) is always present in the background. To use it, set **loadOnStartup** to `true`, and it will load the respective viewGroup and **preloadUrl** in the background as soon as the app starts. For more information, see the [documentation](https://docs.luigi-project.io/docs/navigation-advanced/?section=viewgroupsettings).

#### Option to hide top navigation

Starting from this release, you can use the new parameter [header.disabled](https://docs.luigi-project.io/docs/general-settings/?section=headerdisabled) which allows you to hide only the top navigation in Luigi. Keep in mind we already have a similar hiding option for the [left navigation](https://docs.luigi-project.io/docs/navigation-parameters-reference/?section=hidesidenav) or [all navigation](https://docs.luigi-project.io/docs/general-settings/?section=hidenavigation). 

#### New js-test-application for e2e tests

We introduced a new Vanilla JS test application to replace using Luigi Fiddle locally as a test application. The new test application has no default Luigi config. A test has to call the application with a specific config. For more information, see the [pull request](https://github.com/luigi-project/luigi/pull/2861).

#### Bugfixes

For a full list of bugfixes in this release, see our [changelog](https://github.com/luigi-project/luigi/blob/main/CHANGELOG.md).
