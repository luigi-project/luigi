<!-- meta
{
  "node": {
    "label": "luigi-compound-container",
    "category": {
      "label": "Luigi Container",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 6,
      "position": 1
    }
  }
}
meta -->

# Luigi Compound Container

## Overview

The Luigi Compound Container works similarly to Luigi's compound web components [feature](web-component.md#compound-web-components) and allows you to insert multiple micro frontends on the same page.

## Installation

1. Install the Luigi Container [npm](https://www.npmjs.com/) package to use the Luigi Compound Container : `@luigi-project/container` 

```bash
npm install @luigi-project/container
```

2. Import it into your project:

```
import '@luigi-project/container';
```

3. (optional) Add VS Code HTML support to enhance HTML editing  LuigiCompoundContainer. You can do it by adding the following lines to .vscode/settings.json (since container v1.4.0)

```
{
  ...some other settings,
  "html.customData": [
    "PATH/TO/node_modules/@luigi-project/container/vscode.html-custom-data.json"
  ]
}
```

## Usage 
After importing the package, you can use the Luigi Compound Contaniner anywhere in your application. You can configure a simple example using `compoundConfig` as a starting point: 

```html
    <luigi-compound-container 
        context='{"label": "Dashboard"}'
        compoundConfig = { your config here }>
    </luigi-compound-container>
```

### Compound Container Config
The Luigi Compound Container config is used to configure how your web-component based microfrontends will be rendered. 

A simple configuration example that renders a 2x2 grid of micro frontends: 
```json
  compoundConfig = {
      renderer: {
        use: 'grid',
        config: {
          columns: '1fr 1fr',
          gap: '20px'
        }
      },
      children: [
        {
          viewUrl: './compound-container/myCompoundWebComponent1.js'
        },
        {
          viewUrl: './compound-container/myCompoundWebComponent2.js'
        },
        {
          viewUrl: './compound-container/myCompoundWebComponent3.js'
        },
        {
          viewUrl: './compound-container/myCompoundWebComponent4.js'
        }
      ]
    }
```
You can find more on the Luigi Compound Container [compoundConfig](luigi-compound-container-api.md#compoundconfig) documentation.

## Examples

### Test Application

1. You can find a Luigi Compound Container example application on [GitHub](https://github.com/luigi-project/luigi/tree/main/container/examples). First, clone the Luigi repository if you haven't already done so:

```bash
git clone git@github.com:SAP/luigi.git
cd luigi/container
```

2. Then, build the bundle and start the example app: 

```bash
npm install
npm run build
npm run start-examples
```

The Compound Container example should be available at `http://localhost:2222/#compound-wc-container` in your browser. 

3. Check the [examples folder](https://github.com/luigi-project/luigi/tree/main/container/examples) to see how Luigi Compound Container is used.

### API Reference
To make use of all of the compound container based Luigi functionalities you can take a further look at the API reference:
  - [Luigi Compound Container API](luigi-compound-container-api.md) 
