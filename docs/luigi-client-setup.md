<!-- meta
{
  "node": {
    "label": "Installation",
    "category": {
      "label": "Luigi Client",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 5,
      "position": 0
    }
  }
}
meta -->

# Luigi Client Installation

Luigi Client contains a library that allows your application to use all features of the Luigi framework.

## Installation

Install the client in your project using npm:
```bash
npm install @luigi-project/client
```

## Configuration

Import the client in places where you want to use it, depending on the environment of your choice:

### No framework/Svelte
Add this line to the imports section of the `src/main.js` file:
```javascript
import LuigiClient from '@luigi-project/client';
```

### Angular
Add this line to the imports section of the `src/app/app.component.ts` file:
```javascript
import LuigiClient from '@luigi-project/client';
```

### SAPUI5/OpenUI5
Add this to the `webapp/home/Home.controller.js` file: 
```js 
sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/UIComponent',
    'luigi/demo/libs/luigi-client/luigi-client'
  ],
```

### Vue
Add this line to the imports section of the `src/main.js` file:
```js
import LuigiClient from '@luigi-project/client';
```

### React
Add this line to the imports section of the `src/App.js` file:

```javascript
import LuigiClient from '@luigi-project/client';
```
### Next.JS

<!-- add-attribute:class:success -->
> **TIP:** You can find an Next.JS example using Luigi Client [here](https://github.com/luigi-project/luigi/blob/main/core/examples/luigi-example-next/pages/sample1.js).

1. Add this line to the imports section of the `src/App.js` file:

```javascript
import LuigiClient from '@luigi-project/client';
```

2. Add the `useEffect` function: 
```javascript
import { useEffect } from 'react'
 
 export default function Home() {
  // recommended by https://nextjs.org/docs/migrating/from-create-react-app#safely-accessing-web-apis
  useEffect(() => {
    var luigiClient = require('@luigi-project/client');
    console.log("Load LuigiClient in useEffect: " + luigiClient);
  }, [])
```

### Other

If you are not using any bundler, Luigi is also available as a global object:
```javascript
window.LuigiClient
```

<!-- add-attribute:class:success -->
> **TIP:** You can see Luigi Client in action by running the [Angular example application](/test/e2e-test-application).

## Usage

This section contains additional instructions and guidelines you can use to work with Luigi Client.

### Luigi Client API

In the [Luigi Client API](luigi-client-api.md), you will find functions that will allow you to configure your micro frontend in the context of the main Luigi Core app.

For example, if you want to use the function `addInitListener` in order to display a Luigi [alert](luigi-client-api.md#showalert) in the micro frontend, it can look like this: 

```js
useEffect(() => {
    const LuigiClient = require('@luigi-project/client');
    LuigiClient.addInitListener(function(context) {
        LuigiClient.showAlert({text: 'Hello'});
    });
  }, []);
  ```

