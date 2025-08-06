## Overview

# Contributing to Luigi
We want to make contributing to this project as easy and transparent as possible.

## Our development process
We use GitHub to track issues and feature requests, as well as accept pull requests.

## Pull requests
You are welcome to contribute with your pull requests. These steps explain the contribution process:

1. Fork the repository and create your branch from `main`.
2. Run `npm install` in the root folder. This will install pre-commit and pre-push hooks that will take care about certain required preconditions.
3. [Add tests](#testing) for your code, especially if you are updating the Luigi Core and Client API.
4. If you've changed APIs, update the documentation. You can find more details on how to do that [here](docs/content-guidelines.md/#API-documentation).
5. If you are adding documentation, follow the [content guidelines](docs/content-guidelines.md).
6. Make sure the tests pass. Our [pipeline](https://github.com/luigi-project/luigi/actions) is running the unit and e2e tests for your PR and will indicate any issues.
7. Sign the Developer Certificate of Origin (DCO).

## Testing

> **NOTE:** You should always add [*unit tests*](https://github.com/luigi-project/luigi/tree/main/core/test) if you are adding code to our repository.

If you've added code that is exposed as an API or configuration, additionally add e2e tests to [js-test-app](https://github.com/luigi-project/luigi/tree/main/test/e2e-test-application/cypress/e2e/tests/0-js-test-app).

To let tests run locally, run `cd test/e2e-js-test-application && npm run dev` and `cd test/e2e-test-application && npm run e2e:open` and click on the test in the *js-test-application* category.

## Issues
We use GitHub issues to track bugs. Please ensure your description is
clear and includes sufficient instructions to reproduce the issue.

## Contributing with AI-generated code
As artificial intelligence evolves, AI-generated code is becoming valuable for many software projects, including open-source initiatives. While we recognize the potential benefits of incorporating AI-generated content into our open-source projects there a certain requirements that need to be reflected and adhered to when making contributions.

Please see our [guideline for AI-generated code contributions to SAP Open Source Software Projects](https://github.com/SAP/.github/blob/main/CONTRIBUTING_USING_GENAI.md) for these requirements.

## License
By contributing to Luigi, you agree that your contributions will be licensed under its [Apache-2.0 license](LICENSE).
