<!-- meta
{
  "node": {
    "label": "Versions",
    "category": {
      "label": "Basics",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 1,
      "position": 4
    }
  }
}
meta -->

# Versions

Read about the versions of Luigi in this document.

- [Changelog](#changelog)
- [Luigi 1.x upgrades](#luigi-1x-upgrades)
- [Luigi 2.x upgrades](#luigi-2x-upgrades)
- [Docs for earlier versions](#docs-for-earlier-versions)

## Changelog

Our [changelog](https://bit.ly/2W47Ewv) contains information on all the updates and features which were added to Luigi starting from its initial release.

## Luigi 1.x upgrades

Luigi versions 1.0 and above differ from earlier versions in some important ways. Luigi npm packages (previously under `kyma-project`) are under a new npm org. The new packages are:
- @luigi-project/client
- @luigi-project/core
- @luigi-project/plugin-auth-oauth2
- @luigi-project/plugin-auth-oidc

You can read more about the other changes below:

<!-- accordion:start -->

### Authorization Providers

We have excluded the default authorization providers from Luigi Core and published them as separate modules.
The property `customIdpProvider` has been renamed to `idpProvider`, since you now always need to define a provider.
Additionally, you need to copy callback assets to your Core application.

To install the plugins, follow these installation guides:

- [OAuth2 Implicit Grant](https://github.com/luigi-project/luigi/tree/main/plugins/auth/public/auth-oauth2)
- [OpenID Connect (OIDC)](https://github.com/luigi-project/luigi/tree/main/plugins/auth/public/auth-oidc)
- [OpenID Connect (OIDC) with PKCE](https://github.com/luigi-project/luigi/tree/main/plugins/auth/public/auth-oidc-pkce)

<!-- add-attribute:class:warning -->
> **NOTE:** If you already had a custom provider defined, you only need to rename the provider key to `idpProvider`.

### Fundamental Library Styles

Following an upgrade from SAP Fundamentals to Fundamental Library Styles, there were changes in the HTML structure. Some classes were renamed or removed completely. You can find the full list of Fundamental Library Styles changes [here](https://github.com/SAP/fundamental-styles/wiki/Breaking-Changes).

Within Luigi, we renamed the `lui-tendant-menu__control` class to `lui-ctx-switch-menu`.

With Luigi version v1.3.0, the new v0.10.0 of Fundamental Library Styles were included. As a result, there were breaking changes to the Luigi side navigation. You can see the updated layout [here](https://sap.github.io/fundamental-styles/?path=/docs/sap-fiori-deprecated-components-side-navigation--docs).

With Luigi v1.4.0, the new v0.11.0 of Fundamental Library Styles were included. As a result, there were breaking changes to the Luigi Alerts. The classes `fd-overlay fd-overlay--message-strip` were removed from Fundamental Library Styles and we added a new class `luigi-alert--overlay` to keep the same look and feel as in the past. You can see all breaking changes of Fundamental Library Styles [here](https://github.com/SAP/fundamental-styles/wiki/Breaking-Changes#0110).

With Luigi v1.9.0, the new v0.14.0 of Fundamental Library Styles were included. Its previous v0.12.0 led to having breaking changes in the Luigi left side navigation and the shellbar. All icons were moved out from pseudo-classes into a dedicated tag `<i class="sap-icon sap-icon--{modifier}"></i>` under the button. You can see all breaking changes of Fundamental Library Styles v0.12.0 [here](https://github.com/SAP/fundamental-styles/releases?after=v0.12.1-rc.7).

With Luigi v1.13.0, the new v0.17.0 of Fundamental Library Styles were included. It led to having breaking changes in the Luigi Dialog/Modal layout and Shellbar Counter. New HTML attributes were added to those components to increase accessibility. You can see the new layout of these components here: [Dialog](https://sap.github.io/fundamental-styles/?path=/docs/sap-fiori-components-dialog--docs) and [Shellbar Counter](https://sap.github.io/fundamental-styles/?path=/docs/sap-fiori-components-counter--docs)

In order to use TNT icons or businessSuiteInAppSymbols icons suite, it is recommended to add ```@font-face``` from [Fundamental Styles](https://sap.github.io/fundamental-styles/?path=/docs/docs-introduction--docs) project configuration, to your custom styles.
<!-- accordion:end -->

## Luigi 2.x upgrades

Luigi v2.0 introduced two new important changes in regards to previous versions.

<!-- accordion:start -->

### Internet Explorer 11 (IE11)

As of Luigi v2.0, **Internet Explorer 11 is no longer supported**. Luigi is compatible with all other modern browsers. We recommend that you switch to another web browser such as Chrome or Edge. If you still need to use IE11, you can use Luigi versions lower than 2.0, all of which can be found on our [GitHub repository](https://github.com/luigi-project/luigi/releases).

### Update to Angular 14 and 15

With Luigi 2.0, we are updating to a newer version of Angular. This means that **Angular v.13 and below are no longer supported**. The [Luigi Angular support library](https://docs.luigi-project.io/docs/framework-support-libraries) can now be used with Angular 14 or 15 instead. You can read about how to update your Angular version [here](https://angular.io/guide/updating).

<!-- accordion:end -->

## Docs for earlier versions

The current documentation page describes the latest Luigi version. The documentation for earlier Luigi versions is provided as Markdown files in our GitHub repository.


<!-- oldVersionsDropdown -->