
# Luigi Container

## Overview
[Luigi Container](https://docs.luigi-project.io/docs/luigi-container) is a [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) that can be included in an arbitrary application, in order to render a Luigi micro frontend (iframe or web component based) without the need of being a Luigi Core application.

## Installation
1. Install the container package: `@luigi-project/container`

```
npm install @luigi-project/container
```

2. Import it into your project:

```
import '@luigi-project/container';
```

## Usage
You can now use the Luigi container as follows anywhere in your application:

```
    <luigi-container
        viewURL="https://www.example-microfronted.com"
        webcomponent="false"
        label="my label"
        context='{"label": "Calendar"}'>
    </luigi-container>
```
You can find simple examples that use [webcomponents](https://github.com/luigi-project/luigi/tree/main/container/examples/container-wc) and [iframes](https://github.com/luigi-project/luigi/tree/main/container/examples/container-iframe).

4. In a similar way you can use the Luigi **compound container** to insert multiple microfrontends as follows:

```
    <luigi-compound-container
        context='{"label": "Dashboard"}'
        compoundConfig = { your config here }>
    </luigi-compound-container>
```
An example can be found at [./examples/compound-container/index.html](https://github.com/luigi-project/luigi/tree/main/container/examples/compound-container).

## Code coverage
It is possible to get code coverage stats for both unit and e2e tests. In the first step trigger unit tests by running the following commands:

```
npm install
npm run test
```

After running unit tests execute the following bash script to trigger e2e tests in code coverage mode:

```
./run-container-e2e.sh
```

When both `coverage` and `e2e-coverage` folders are present in the main directory then a summary report might be created by running the following command:

```
npm run coverage-summary
```

New HTML file called `index.html` should be created in the `coverage-summary` directory - just open it in a browser to see the summary report.