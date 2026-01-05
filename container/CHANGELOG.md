# Changelog

<!--Generate the changelog using release cli. -->



## [v1.7.6] (2025-12-18)

#### :bug: Fixed

* [#4667](https://github.com/luigi-project/luigi/pull/4667) Add promise support openAsModal ([@JohannesDoberer](https://github.com/JohannesDoberer))





## [v1.7.5] (2025-12-04)

#### :rocket: Added

* [#4645](https://github.com/luigi-project/luigi/pull/4645) Added close current modal event ([@JohannesDoberer](https://github.com/JohannesDoberer))
* [#4519](https://github.com/luigi-project/luigi/pull/4519) Added loading indicator for webcomponent client api ([@walmazacn](https://github.com/walmazacn))





## [v1.7.4] (2025-09-24)

#### :bug: Fixed

* [#4508](https://github.com/luigi-project/luigi/pull/4508) Add missing internal data for iframe based microfrontends ([@JohannesDoberer](https://github.com/JohannesDoberer))





## [v1.7.3] (2025-09-17)

#### :bug: Fixed

* [#4473](https://github.com/luigi-project/luigi/pull/4473) Fix: Send theme, locale and featureToggleList via internal data to iframes ([@JohannesDoberer](https://github.com/JohannesDoberer))





## [v1.7.2] (2025-08-14)

#### :bug: Fixed

* [#4438](https://github.com/luigi-project/luigi/pull/4438) Fix: LuigiContainer should not be initialized if no view url ([@JohannesDoberer](https://github.com/JohannesDoberer))





## [v1.7.1] (2025-08-06)

#### :bug: Fixed

* [#4420](https://github.com/luigi-project/luigi/pull/4420) Fix updateContext in Luigi container ([@JohannesDoberer](https://github.com/JohannesDoberer))





## [v1.7.0] (2025-04-23)

#### :rocket: Added

* [#4236](https://github.com/luigi-project/luigi/pull/4236) Adds addCoreSearchParams fn for wc client ([@JohannesDoberer](https://github.com/JohannesDoberer))
* [#4234](https://github.com/luigi-project/luigi/pull/4234) Adds updateModalPathInternalNavigation to WC client ([@walmazacn](https://github.com/walmazacn))
* [#4232](https://github.com/luigi-project/luigi/pull/4232) Adds setDirtyStatus to WC client ([@walmazacn](https://github.com/walmazacn))
* [#4231](https://github.com/luigi-project/luigi/pull/4231) Adds setCurrentLocale to WC client ([@walmazacn](https://github.com/walmazacn))
* [#4228](https://github.com/luigi-project/luigi/pull/4228) Adds updateModalSettings for wc client ([@JohannesDoberer](https://github.com/JohannesDoberer))





## [v1.6.0] (2025-02-12)

#### :rocket: Added

* [#4127](https://github.com/luigi-project/luigi/pull/4127) rename closeAlert fn ([@JohannesDoberer](https://github.com/JohannesDoberer))
* [#4115](https://github.com/luigi-project/luigi/pull/4115) showAlert promise for webcomponents ([@JohannesDoberer](https://github.com/JohannesDoberer))

#### :bug: Fixed

* [#4133](https://github.com/luigi-project/luigi/pull/4133) Missing context properties ([@JohannesDoberer](https://github.com/JohannesDoberer))
* [#4132](https://github.com/luigi-project/luigi/pull/4132) Container iframe get node params function missing ([@JohannesDoberer](https://github.com/JohannesDoberer))
* [#4106](https://github.com/luigi-project/luigi/pull/4106) Fix: dismissKey optional in closeAlert ([@JohannesDoberer](https://github.com/JohannesDoberer))





## [v1.5.0] (2024-11-29)

#### :rocket: Added

* [#4031](https://github.com/luigi-project/luigi/pull/4031) Adds possibility to change route/viewUrl in iframe based mfe ([@walmazacn](https://github.com/walmazacn))



## [v1.4.0] (2024-11-05)

#### :rocket: Added

* [#3985](https://github.com/luigi-project/luigi/pull/3985) Add custom elements manifest for Luigi(Compound)Container ([@JohannesDoberer](https://github.com/JohannesDoberer))
* [#3936](https://github.com/luigi-project/luigi/pull/3936) Adds theme property for compound container ([@walmazacn](https://github.com/walmazacn))
* [#3934](https://github.com/luigi-project/luigi/pull/3934) Adds node params to compound container typings ([@walmazacn](https://github.com/walmazacn))
* [#3937](https://github.com/luigi-project/luigi/pull/3937) Adds activeFeatureToggleList property to LuigiCompoundContainer ([@walmazacn](https://github.com/walmazacn))
* [#3935](https://github.com/luigi-project/luigi/pull/3935) Adds locale property to Luigi Compound Container ([@ndricimrr](https://github.com/ndricimrr))

#### :bug: Fixed

* [#3988](https://github.com/luigi-project/luigi/pull/3988) fix wrong msg target resolution ([@hardl](https://github.com/hardl))




## [v1.3.0] (2024-08-27)

#### :rocket: Added

* [#3831](https://github.com/luigi-project/luigi/pull/3831) Improves context updating method ([@walmazacn](https://github.com/walmazacn))



## [v1.2.0] (2024-07-25)

* [#3797](https://github.com/luigi-project/luigi/pull/3797) Adds navigateToIntent to wc client api ([@walmazacn](https://github.com/walmazacn))
* [#3785](https://github.com/luigi-project/luigi/pull/3785) Add getToken function support to Luigi Container ([@ndricimrr](https://github.com/ndricimrr))
* [#3780](https://github.com/luigi-project/luigi/pull/3780) Add getCurrentRoute function support to Luigi Container ([@JohannesDoberer](https://github.com/JohannesDoberer))
* [#3697](https://github.com/luigi-project/luigi/pull/3697) Light dom container - no-shadow option for Luigi Container ([@hardl](https://github.com/hardl))
* [#3695](https://github.com/luigi-project/luigi/pull/3695) Value validation for webcomponent attribute ([@VincentUllal](https://github.com/VincentUllal))
* [#3650](https://github.com/luigi-project/luigi/pull/3650) Specify iframe sandbox and allow rules ([@JohannesDoberer](https://github.com/JohannesDoberer))
* [#3643](https://github.com/luigi-project/luigi/pull/3643) Align Luigi Container wc clientAPI with core ([@ndricimrr](https://github.com/ndricimrr))

#### :bug: Fixed
* [#3742](https://github.com/luigi-project/luigi/pull/3742) Fixes show confirmation modal method ([@walmazacn](https://github.com/walmazacn))




## [v1.1.0] (2024-02-02)

#### :bug: Fixed
* [#3600](https://github.com/luigi-project/luigi/pull/3600) Avoid browser history change from luigi client on context update ([@JohannesDoberer](https://github.com/JohannesDoberer))


[v1.1.0]: https://github.com/luigi-project/luigi/compare/container/v1.0.0...container/v1.1.0
[v1.2.0]: https://github.com/luigi-project/luigi/compare/container/v1.1.0...container/v1.2.0
[v1.3.0]: https://github.com/luigi-project/luigi/compare/container/v1.2.0...container/v1.3.0
[v1.4.0]: https://github.com/luigi-project/luigi/compare/container/v1.3.0...container/v1.4.0
[v1.5.0]: https://github.com/luigi-project/luigi/compare/container/v1.4.0...container/v1.5.0
[v1.6.0]: https://github.com/luigi-project/luigi/compare/container/v1.5.0...container/v1.6.0
[v1.7.0]: https://github.com/luigi-project/luigi/compare/container/v1.6.0...container/v1.7.0
[v1.7.1]: https://github.com/luigi-project/luigi/compare/container/v1.7.0...container/v1.7.1
[v1.7.2]: https://github.com/luigi-project/luigi/compare/container/v1.7.1...container/v1.7.2
[v1.7.3]: https://github.com/luigi-project/luigi/compare/container/v1.7.2...container/v1.7.3
[v1.7.4]: https://github.com/luigi-project/luigi/compare/container/v1.7.3...container/v1.7.4
[v1.7.5]: https://github.com/luigi-project/luigi/compare/container/v1.7.4...container/v1.7.5
[v1.7.6]: https://github.com/luigi-project/luigi/compare/container/v1.7.5...container/v1.7.6