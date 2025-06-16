<!-- meta
{
  "node": {
    "label": "luigi-container",
    "category": {
      "label": "Luigi Container",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 6,
      "position": 0
    }
  }
}
meta -->

# Luigi Container

## Overview

Luigi Container is a [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) that can be used to render a Luigi micro frontend without the need of a Luigi Core application. Luigi Container can work with any framework that supports HTML. It can be an easy solution for integrating micro frontends inside already existing apps without the cost of refactoring. You can also have [multiple](luigi-compound-container.md#) micro frontends on the same page.

## Installation

1. Install the Luigi Container [npm](https://www.npmjs.com/) package: `@luigi-project/container` 

```bash
npm install @luigi-project/container
```

2. Import it into your project:

```
import '@luigi-project/container';
```

3. (optional) Add VS Code HTML support to enhance HTML editing for LuigiContainer and LuigiCompoundContainer. You can do it by adding the following lines to .vscode/settings.json (since container v1.4.0)

```
{
  ...some other settings,
  "html.customData": [
    "PATH/TO/node_modules/@luigi-project/container/vscode.html-custom-data.json"
  ]
}
```

## Usage 

After importing the package, you can use the Luigi container anywhere in your application. You can configure it just like a regular Luigi application, for example by using [parameters](navigation-parameters-reference.md) such as [viewURL](navigation-parameters-reference.md#viewurl) (which specifies the URL of the micro frontend):

```html
    <luigi-container 
        viewURL="https://www.example-microfronted.com" 
        webcomponent="false" 
        label="my label"
        context='{"label": "Calendar"}'>
    </luigi-container>
```

## Examples

### Test Application

1. You can find a Luigi Container example application on [GitHub](https://github.com/luigi-project/luigi/tree/main/container/examples). First, clone the Luigi repository if you haven't already done so:

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

The app should be available at `http://localhost:2222` in your browser. 

3. Check the [examples folder](https://github.com/luigi-project/luigi/tree/main/container/examples) to see how Luigi Container is used.

### API Reference
To make use of all of the container based Luigi functionalities you can take a further look at the API reference:
  - [Luigi Container API](luigi-container-api.md) 

### UI5 tutorial

You can follow the [Luigi Container UI5 tutorial](https://developers.sap.com/tutorials/luigi-container.html) to learn how to: 
- Install Luigi Container in an UI5 app with the help of the UI5 Tooling modules
- Use Luigi Container to implement micro frontends  
