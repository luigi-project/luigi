<!-- meta
{
  "node": {
    "label": "Web components",
    "category": {
      "label": "Luigi Core",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 2,
      "position": 5
    }
  }
}
meta -->

# Web components

<!-- add-attribute:class:success -->
>**TIP:** You can find some examples of web components in our test application [Luigi Fiddle](https://fiddle.luigi-project.io) in the last navigation entry on the left.

### Overview

Luigi offers the possibility to open micro frontends as web components. For more information, please have a look at the page: [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).

Web components can provide a fast-loading alternative for non-complex micro frontends. All micro frontends from trusted sources will be loaded in a single Javascript file.

In this page you wil find:
-   [Navigation Configuration](#navigation-configuration) - how to configure web components in your Luigi Core navigation
-   [Write a Web Component](#write-a-web-component) - quick description of how to write a web component compatible with the Luigi Framework
-   [Luigi Client for web components](#luigi-client-for-web-components) - Javascript object injected in a web component to leverage Luigi Core features
-   [Tip: how to inject HTML Template code in Web Component](#tip-how-to-inject-html-template-code-in-web-component) - recommendation for how to inject HTML in a web component
-   [Compound web components](#compound-web-components) - how to create compound web components, allowing you to include multiple micro frontends on the same page
-   [Examples](#examples) - more examples of Luigi web components 

## Navigation Configuration

If you want a navigation node to be open as a web component, you need to specify this in the Luigi configuration:
```javascript
Luigi.setConfig({
    navigation: {
   		// To enable CORS web component Loading: you need to add external domains where the web components are hosted;
   		// in this example, we specify that we can load web components from everywhere
	    validWebcomponentUrls:['.*?'],
	    nodes: [
		...
		{
		    pathSegment: 'wc',
		    ………
		    viewUrl: '/wc/luigiExampleWC.js',
		    webcomponent: true,
		    ………
		}
		...
		]
	}
})
```

> **NOTE:** With Luigi version 1.21.0, we removed the experimental flag for web components. 

### Write a Web Component

There are a couple of differences between Luigi web components and standard ones:
- You don’t need to declare any special tag definition inside the web component such as `customElements.define(….., ….)`
- Inside the component, Luigi Core will inject an object in your class called `LuigiClient`

Below is a simple Hello World web component example:
```javascript
export default class ExampleWC extends HTMLElement {
  constructor() {
    super();
    const template = document.createElement('template');
    template.innerHTML = `<section><p>Hello World!</p></section>`;

    const templateBtn = document.createElement('template');
    templateBtn.innerHTML = '<button>Click me!</button>';

    this._shadowRoot = this.attachShadow({
      mode: 'open',
      delegatesFocus: false
    });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this._shadowRoot.appendChild(templateBtn.content.cloneNode(true));

    this.$paragraph = this._shadowRoot.querySelector('p');
    this.$button = this._shadowRoot.querySelector('button');
    this.$button.addEventListener('click', () => {
      if (this.LuigiClient) {
        this.LuigiClient.uxManager().showAlert({
          text: 'Hello from uxManager in Web Component',
          type: 'info'
        });
      }
    });
  }

  set context(ctx) {
    this.$paragraph.innerHTML = ctx.title;
  }
}
```

As shown in the example, you can use a LuigiClient instance inside your web component class.
It is really important to note that this Luigi Client instance is different from the one than you can find in our [Client library](https://docs.luigi-project.io/docs/luigi-client-setup).

Normal micro frontends are embedded inside iframe: Luigi offers a library to allow the frontend to communicate with Luigi Core.
In a web component the situation is quite different: they are not encapsulated into an iframe, they are just loaded inside a shadow element. When Luigi Core loads a web component, it injects a Luigi Client instance.

### Luigi Client for Web Components

In this Javascript object, you can find two elements:
- `this.LuigiClient.uxManager()` : you can use all methods described in [Luigi Core UX](https://docs.luigi-project.io/docs/luigi-core-api?section=ux)
- `this.LuigiClient.linkManager()` : you can use all methods described in [Luigi Navigation](https://docs.luigi-project.io/docs/luigi-core-api?section=luiginavigation)

Below you have a simple Hello World web component example which shows an alert:
```javascript
export default class ExampleWC extends HTMLElement {
  constructor() {
    ........
    this.LuigiClient.uxManager().showAlert({
      text: 'Hello from uxManager in Web Component',
      type: 'info'
    });
    ........
  }
}
```

This example opens a drawer:
```javascript
export default class ExampleWC extends HTMLElement {
  constructor() {
    ........
     this.LuigiClient.linkManager().openAsDrawer('Your Drawer Url', {header:true, backdrop:true, size:'s'});
    ........
  }
}
```


## Tip: how to inject HTML Template code in web component

Sometimes, your web component has an HTML template that you would like to use instead of creating DOM elements one by one.
We suggest putting your HTML template inside a variable at the beginning of the Javascript file, and appending it to the Web Component root in the constructor. An example is given below:
```javascript
const template = document.createElement('template');
template.innerHTML = `
<!DOCTYPE html>
<html lang="EN">
<head>
    <meta charset="utf-8">
    <title></title>
    <link href="//unpkg.com/fundamental-styles@latest/dist/fundamental-styles.css" rel="stylesheet">
    <style>     </style>
    <script></script>
</head>
<body>
      ......
      <main class="fd-page">.....</main>
      ......
</body>
`;

export default class ExampleWC extends HTMLElement {
  constructor() {
     super();
     this.attachShadow({ mode: 'open' });
     this.shadowRoot.appendChild(template.content.cloneNode(true));
     ..........
  }
}
```

## Compound web components 

It is possible to create compound web components using the [compound](navigation-parameters-reference.md#compound) parameter. This can allow you to include several micro frontends on the same page or embed micro frontends within each other. 

In the case of nested web components, [slots](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) need to be defined which will then be filled by Luigi with the corresponding compound children from your Luigi config. The parent web component has to be defined by a slot with a name to plug in the child web component, for example `<header><slot name="header">header</slot></header>`. Web components can communicate over an event bus.

Compound web components can support lazy loading of the child web components. See the [compound](navigation-parameters-reference.md#compound) parameter for details.

Keep in mind that this feature may not work properly if you are importing the Luigi library from an external source (like a CDN). We recommend downloading our packages from [npm](https://www.npmjs.com/package/@luigi-project/core). 

Below is a Luigi web component example configuration which shows 3 web components in a grid layout. It also includes the configuration for the event bus. The input web component sends the typed input. The header web component listens to a `sendInput` event from a web component with the id `input1`. Received data will be converted. An update event will be triggered, changing the header web component where an update event listener is registered.

```js
{
        pathSegment: 'wc_grid',
        label: 'Grid',
        category: {
          label: 'Compound',
          icon: 'attachment-html',
          collapsible: true
        },
        compound: {
          renderer:
          {
            use: 'grid',
            config: {
              columns: '1fr 1fr 1fr',
              /*rows: '150px',*/
              /*gap: '30px',*/
              layouts: [{
                minWidth: 0,
                maxWidth: 600,
                columns: '1fr',
                gap: 0
              }, {
                minWidth: 600,
                maxWidth: 1024,
                columns: '1fr 1fr',
                gap: '30px'
              }]
            }
          },
          children: [{
            viewUrl: 'URL_TO_HEADER_WEBCOMPONENT/panelHeader.js',
            context: {
              title: 'My Awesome Grid',
              description: 'Really awesome'
            },
            layoutConfig: {
              row: "1",
              column: "1 / -1"
            },
            eventListeners: [{
              source: 'input1',
              name: 'sendInput',
              action: 'update',
              dataConverter: (data) => {
                return 'new text: ' + data;
              }
            }]
          }, {
            id: 'input1',
            viewUrl: 'URL_TO_SOME_WEBCOMPONENT/input.js',
            context: {
              title: 'Some input test',
              instant: true
            }
          },
          {
            viewUrl: 'URL_TO_FOOTER_WEBCOMPONENT/panelFooter.js',
            context: {
              footer: 'This is the end of awesomeness'
            },
            layoutConfig: {
              column: "1 / -1"
            }
          }]
        }
      }
```

## Examples 

You can find an example of Luigi web components in [Luigi Fiddle](https://fiddle.luigi-project.io) in the last navigation entry on the left. The source code for Fiddle is available on [GitHub](https://github.com/luigi-project/luigi/tree/main/website/fiddle) as well.

Additionally, our e2e test application includes [web components](https://github.com/luigi-project/luigi/blob/main/test/e2e-test-application/src/luigi-config/extended/projectDetailNav.js#L319) and [compound](https://github.com/luigi-project/luigi/blob/main/test/e2e-test-application/src/luigi-config/extended/projectDetailNav.js#L11) examples as well. To install the e2e app, follow the instructions on [GitHub](https://github.com/luigi-project/luigi/tree/main/test/e2e-test-application#luigi-sample-and-e2e-test-application-written-in-angular). 