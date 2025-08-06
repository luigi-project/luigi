---
title: Luigi Container v1.0
seoMetaDescription: Release notes for Luigi Container v1.0
author:
  - Aleksandra Simeonova
layout: blog
---

Luigi's newest feature, Luigi Container, has recently had its first release. You can find more details about it in this blog post. 

<!-- Excerpt -->

#### Luigi Container 

[Luigi Container](https://docs.luigi-project.io/docs/luigi-container) recently had its v1.0 release. This is Luigi's newest feature which aims to make micro frontend development even easier. It is a [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) that can be used to render a Luigi micro frontend without the need of a Luigi Core application. It can work with any framework that supports HTML. The Luigi Compound Container can be used to include multiple micro frontends on the same page.

#### Installation 

Luigi Container can be installed via an [npm](https://www.npmjs.com/) package: 

```bash
npm install @luigi-project/container
```

To import it into your project, use: 

```
import '@luigi-project/container';
```


#### Usage

After importing the package, you can use the Luigi Container anywhere in your application. You can configure it just like a regular Luigi application, for example by using [parameters](https://docs.luigi-project.io/docs/navigation-parameters-reference) such as [viewURL](https://docs.luigi-project.io/docs/navigation-parameters-reference?section=viewurl) (which specifies the URL of the micro frontend):

```html
    <luigi-container 
        viewURL="https://www.example-microfronted.com" 
        webcomponent="false" 
        label="my label"
        context='{"label": "Calendar"}'>
    </luigi-container>
```

The **Luigi Compound Container** works similarly to Luigi's compound web components [feature](https://docs.luigi-project.io/docs/web-component?section=compound-web-components) and it allows you to insert multiple micro frontends on the same page:

```html
    <luigi-compound-container 
        context='{"label": "Dashboard"}'
        compoundConfig = { your config here }>
    </luigi-compound-container>
```


#### Examples

You can find a Luigi Container test application on [GitHub](https://github.com/luigi-project/luigi/tree/main/container/test-app). Check out the [documentation](https://docs.luigi-project.io/docs/luigi-container?section=examples) for installation instructions.

You can also take a look at our [Luigi Container UI5 tutorial](https://developers.sap.com/tutorials/luigi-container.html) which shows you how to install and use Luigi Container inside an UI5 app.

