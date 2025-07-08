<!-- meta
{
  "node": {
    "label": "Quick setup",
    "category": {
      "label": "Luigi Core",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 2,
      "position": 0
    }
  }
}
meta -->

# Quick setup

<!-- add-attribute:class:warning -->
> **NOTE:** The setup scripts are a quick and easy way to create a running Luigi Core app and micro frontend hosted by the same webserver, but they don't represent a real-life scenario where the different pieces are distributed.

This document shows you how to quickly set up a Luigi web application by installing some of our [examples](https://github.com/luigi-project/luigi/tree/main/core/examples). They can be a good way to learn about setting up a Luigi project, but how you add Luigi to your application will depend on the framework you use and the application itself. 

In the quick setup examples on this page, you can use a single **installer** script which executes these steps: 
* Add Luigi's `npm` packages (e.g. for Luigi [Core](https://www.npmjs.com/package/@luigi-project/core)/[Client](https://www.npmjs.com/package/@luigi-project/client)) to your project dependencies.
* Give Luigi exclusive control over your entry `index.html` file.
* Start the server to run your application. It's necessary to run the application to make sure the existing router doesn't interfere.  

You can find quick setup scripts for the following frameworks: 
* [Application setup without a framework](#application-setup-without-a-framework)
* [Angular](#application-setup-for-angular)
* [SAPUI5/OpenUI5](#application-setup-for-sapui5openui5)
* [VUE.JS](#application-setup-for-vuejs)
* [React](#application-setup-for-react)

You can see how to quickly start an Angular Luigi application in this video:

<iframe width="560" height="315" src="https://www.youtube.com/embed/kEzTZ2U9KMM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Application setup without a framework

<!-- add-attribute:class:warning -->
> **NOTE:** You need a development server capable of hosting Single Page Applications. The recommended server is Serve.

1. Use the following installer to create a directory for your application, install Luigi, make assets available, and start your local server:

```bash
bash <(curl -s https://raw.githubusercontent.com/luigi-project/luigi/main/scripts/setup/no-framework.sh)
```
or execute these commands manually to get the same result:
<!-- accordion:start -->
### Click to expand
```bash
mkdir my-new-app && cd my-new-app

# Download the package.json
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/package.json > package.json


# Install packages and create folder structure
npm i 
mkdir -p public/assets
mkdir -p src/luigi-config

# download assets from core/examples folder
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/public/favicon.ico > public/favicon.ico
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/public/logo.png > public/logo.png
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/public/index.html > public/index.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/public/luigi-config.js > public/luigi-config.js
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/public/views/home.html > public/views/home.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/public/views/sample1.html > public/views/sample1.html

echo "Running server with command: npm run start"
npm run start


```
<!-- accordion:end -->

2. Open the directory where Luigi is installed. Search for the `luigi-config.js` file which you can use to configure Luigi [navigation](navigation-configuration.md), [authorization](authorization-configuration.md), [general settings](general-settings.md) and more.

## Application setup for Angular

<!-- add-attribute:class:warning -->
> **NOTE:** The Angular CLI is a prerequisite for this example.

1. If you do not have the Angular CLI installed, download and install it from [here](https://cli.angular.io/).

2. Use the installer to create your application, install Luigi, make assets available, and serve your application:

```bash
bash <(curl -s https://raw.githubusercontent.com/luigi-project/luigi/main/scripts/setup/angular.sh)
```
or execute these commands manually to get the same result:
<!-- accordion:start -->
### Click to expand
```bash
ng new $folder --defaults --minimal --routing --skip-tests --skip-git && cd $folder # skip interactive prompts
ng generate c home -s -t
ng generate c sample1 -s -t
ng generate c sample2 -s -t
ng generate app mfe --defaults --routing=false --skip-tests

npm i -P @luigi-project/core @luigi-project/client fundamental-styles @sap-theming/theming-base-content webpack@5.74.0 webpack-cli@4.10.0
sed 's/"scripts": {/"scripts": {\
\    "serveApps":"ng serve mfe --live-reload=false --port=4300 --watch=false | ng serve",\
\    "buildConfig":"webpack --entry .\/public\/assets\/luigi-config.es6.js --output-path .\/public\/assets --output-filename luigi-config.js --mode production",/1' package.json > p.tmp.json && mv p.tmp.json package.json
mkdir public/assets
rm src/index.html

# download assets
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-angular/src/logo.svg > src/logo.svg
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-angular/src/index.html > src/index.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-angular/src/sampleapp.html > src/sampleapp.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-angular/src/app/app.ts > src/app/app.ts
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-angular/src/app/app.html > src/app/app.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-angular/src/app/app.css > src/app/app.css
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-angular/src/app/home/home.ts > src/app/home/home.ts
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-angular/src/app/sample1/sample1.ts > src/app/sample1/sample1.ts
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-angular/src/app/sample2/sample2.ts > src/app/sample2/sample2.ts
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-angular/src/app/app.config.ts > src/app/app.config.ts
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-angular/src/app/app.routes.ts > src/app/app.routes.ts
curl https://raw.githubusercontent.com/luigi-project/luigi/main/scripts/setup/assets/luigi-config.es6.js > public/assets/luigi-config.es6.js

# adjust Angular configuration
ng config projects.$folder.architect.build.options.index src/sampleapp.html
ng config projects.$folder.architect.build.options.assets "[\"src/assets\"]"

# string replacements in some files
sed 's#"provideRouter"#"provideRouter,\
          "withHashLocation"#g' src/app/app.config.ts > src/app/tmp.ts && mv src/app/tmp.ts src/app/app.config.ts
sed 's#"provideRouter(routes)"#"provideRouter(routes,\
          "withHashLocation())"#g' src/app/app.config.ts > src/app/tmp.ts && mv src/app/tmp.ts src/app/app.config.ts
sed 's#"src/styles.css"#"src/styles.css",\
          "node_modules/fundamental-styles/dist/theming/sap_fiori_3.css",\
          "node_modules/@sap-theming/theming-base-content/content/Base/baseLib/sap_fiori_3/css_variables.css",\
          "node_modules/fundamental-styles/dist/fundamental-styles.css"#g' angular.json > tmp.json && mv tmp.json angular.json
sed 's#"src/assets"#"src/assets",\
          "src/index.html",\
          "src/logo.svg",\
          {"glob": "**/*","input": "public/assets","output": "/assets"},\
          {"glob": "fundamental-styles.css","input": "node_modules/fundamental-styles/dist","output": "/fundamental-styles"},\
          {"glob": "*","input": "node_modules/@sap-theming/theming-base-content","output": "/fonts"},\
          {"glob": "**","input": "node_modules/@luigi-project/core","output": "/luigi-core"},\
          {"glob": "luigi-client.js","input": "node_modules/@luigi-project/client","output": "/luigi-client"}#g' angular.json > tmp.json && mv tmp.json angular.json

# build Luigi configuration
npm run buildConfig
rm public/assets/luigi-config.es6.js

# match basic folder structure of an angular project
cp -r node_modules/@luigi-project/core public/luigi-core
cp -r node_modules/@luigi-project/client public/luigi-client
cp -r node_modules/fundamental-styles public/fundamental-styles

# run Angular apps
npm run serveApps
```
<!-- accordion:end -->

3. Open the directory where Luigi is installed. Search for the `luigi-config.js` file which you can use to configure Luigi [navigation](navigation-configuration.md), [authorization](authorization-configuration.md), [general settings](general-settings.md) and more.

## Application setup for SAPUI5/OpenUI5

1. Use the installer to create a directory for your application, install Luigi, make assets available, and start your local server:

```bash
bash <(curl -s https://raw.githubusercontent.com/luigi-project/luigi/main/scripts/setup/openui5.sh)
```
or execute these commands manually to get the same result:

<!-- accordion:start -->
### Click to expand
```bash
mkdir my-ui5-app && cd my-ui5-app
echo "Creating folders and downloading example assets"
mkdir -p ./webapp/home ./webapp/libs ./webapp/sample1 ./webapp/sample2 ./webapp/i18n

export UI5EX_REPO_URL="https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-openui5"

curl --silent $UI5EX_REPO_URL/webapp/sample2/Sample2.view.xml > ./webapp/sample2/Sample2.view.xml
curl --silent $UI5EX_REPO_URL/webapp/sample2/sample2.html > ./webapp/sample2/sample2.html
curl --silent $UI5EX_REPO_URL/webapp/sample2/index.js > ./webapp/sample2/index.js
curl --silent $UI5EX_REPO_URL/webapp/sample2/Sample2.controller.js > ./webapp/sample2/Sample2.controller.js
curl --silent $UI5EX_REPO_URL/webapp/home/Home.view.xml > ./webapp/home/Home.view.xml
curl --silent $UI5EX_REPO_URL/webapp/home/Home.controller.js > ./webapp/home/Home.controller.js
curl --silent $UI5EX_REPO_URL/webapp/favicon.ico > ./webapp/favicon.ico
curl --silent $UI5EX_REPO_URL/webapp/index.html > ./webapp/index.html
curl --silent $UI5EX_REPO_URL/webapp/luigi-config.js > ./webapp/luigi-config.js
curl --silent $UI5EX_REPO_URL/webapp/openui5.html > ./webapp/openui5.html
curl --silent $UI5EX_REPO_URL/webapp/libs/.gitignore > ./webapp/libs/.gitignore
curl --silent $UI5EX_REPO_URL/webapp/Component.js > ./webapp/Component.js
curl --silent $UI5EX_REPO_URL/webapp/sample1/index.js > ./webapp/sample1/index.js
curl --silent $UI5EX_REPO_URL/webapp/sample1/Sample1.controller.js > ./webapp/sample1/Sample1.controller.js
curl --silent $UI5EX_REPO_URL/webapp/sample1/sample1.html > ./webapp/sample1/sample1.html
curl --silent $UI5EX_REPO_URL/webapp/sample1/Sample1.view.xml > ./webapp/sample1/Sample1.view.xml
curl --silent $UI5EX_REPO_URL/webapp/logo.png > ./webapp/logo.png
curl --silent $UI5EX_REPO_URL/webapp/manifest.json > ./webapp/manifest.json
curl --silent $UI5EX_REPO_URL/webapp/i18n/i18n_en.properties > ./webapp/i18n/i18n_en.properties
curl --silent $UI5EX_REPO_URL/webapp/i18n/i18n.properties > ./webapp/i18n/i18n.properties
curl --silent $UI5EX_REPO_URL/ui5.yaml > ./ui5.yaml
curl --silent $UI5EX_REPO_URL/README.md > ./README.md
curl --silent $UI5EX_REPO_URL/.gitignore > ./.gitignore
curl --silent $UI5EX_REPO_URL/package-lock.json > ./package-lock.json
curl --silent $UI5EX_REPO_URL/package.json > ./package.json

npm i
npm run build
npm run start
```
<!-- accordion:end -->

2. Open the directory where Luigi is installed. Open the `webapp/luigi-config.js` file which you can use to configure Luigi [navigation](navigation-configuration.md), [authorization](authorization-configuration.md), [general settings](general-settings.md) and more.


## Application setup for VUE.JS

<!-- add-attribute:class:warning -->
> **NOTE:** The VUE CLI is a prerequisite for this example.

1. If you do not have VUE CLI installed, use this command to install it.

```bash
npm install -g @vue/cli
```

2. Use the installer to create your application, install Luigi, make assets available, and serve your application:
```bash
bash <(curl -s https://raw.githubusercontent.com/luigi-project/luigi/main/scripts/setup/vue.sh)
```
or execute these commands manually to get the same result:

<!-- accordion:start -->
### Click to expand
```bash

# create sample vue app
vue create -d my-vue-app && cd my-vue-app

# install dependencies
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/package.json > package.json
npm i

mkdir -p src/views src/router 

# cleanup default installation
rm public/index.html src/app.vue # remove default index, will be replaced with example assets
rm -rf src/components

# set scripts
echo "const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {

  chainWebpack: config => {
    config.resolve.symlinks(false)
  },
  pages: {
    sampleapp: {
      entry: 'src/main.js',
      template: 'public/sampleapp.html',
      filename: 'sampleapp.html'
    }
  },
  runtimeCompiler: true,
  outputDir: 'dist',
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            context: 'public',
            to: 'index.html',
            from: 'index.html'
          },
          {
            from: 'node_modules/@luigi-project/core',
            to: './luigi-core',
          }
        ]
      }),
    ]
  }
};" > vue.config.js


# fetch assets from vue example
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/public/index.html > public/index.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/public/sampleapp.html > public/sampleapp.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/src/app.vue > src/app.vue
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/src/main.js > src/main.js
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/public/luigi-config.js > public/luigi-config.js

curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/src/router/index.js > src/router/index.js

curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/src/views/home.vue > src/views/home.vue
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/src/views/sample1.vue > src/views/sample1.vue
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/src/views/sample2.vue > src/views/sample2.vue

# generic assets

npm run build
npm run serve
```
<!-- accordion:end -->

3. Open the directory where Luigi is installed. Search for the `luigi-config.js` file you can use to configure Luigi [navigation](navigation-configuration.md), [authorization](authorization-configuration.md), [general settings](general-settings.md) and more.

## Application setup for React

1. Use the installer to create your application, install Luigi, make assets available, and serve your application:
```bash
bash <(curl -s https://raw.githubusercontent.com/luigi-project/luigi/main/scripts/setup/react.sh)
```
or execute these commands manually to get the same result:

<!-- accordion:start -->
### Click to expand
```bash
npx create-react-app my-react-app && cd my-react-app

# eject project to customize webpack configs
echo yes | npm run eject


# install dependencies
npm i -P @luigi-project/core @luigi-project/client fundamental-styles@0.11.0 @sap-theming/theming-base-content react-router-dom@5.1.2
npm i copy-webpack-plugin@5 webpack webpack-cli @babel/core @babel/preset-env babel-loader --save-dev

# replace strings in some places
sed "s/const HtmlWebpackPlugin = require('html-webpack-plugin');/const HtmlWebpackPlugin = require('html-webpack-plugin');const CopyWebpackPlugin = require('copy-webpack-plugin');/g" config/webpack.config.js > config/webpack.config.tmp.js && mv config/webpack.config.tmp.js config/webpack.config.js
sed "s/new HtmlWebpackPlugin(/new CopyWebpackPlugin([\
  {context: 'public', to: 'index.html', from: 'index.html'  },\
  {context: 'node_modules\/@luigi-project\/core',to: '.\/luigi-core',from: {glob: '**',dot: true}}],\
  {ignore: ['.gitkeep', '**\/.DS_Store', '**\/Thumbs.db'],debug: 'warning'\
  }),\
  new HtmlWebpackPlugin(/g" config/webpack.config.js > config/webpack.config.tmp.js && mv config/webpack.config.tmp.js config/webpack.config.js
sed "s/template: paths.appHtml,/template: paths.appHtml,\
  filename: 'sampleapp.html',/g" config/webpack.config.js > config/webpack.config.tmp.js && mv config/webpack.config.tmp.js config/webpack.config.js
sed "s/public\/index.html/public\/sampleapp.html/g" config/paths.js > config/paths.tmp.js && mv config/paths.tmp.js config/paths.js
sed "s/publicUrl + '\/index.html',/publicUrl + '\/sampleapp.html',/g" config/webpack.config.js > config/webpack.config.tmp.js && mv config/webpack.config.tmp.js config/webpack.config.js
sed "s/const isWsl = require('is-wsl');//g" config/webpack.config.js > config/webpack.config.tmp.js && mv config/webpack.config.tmp.js config/webpack.config.js
sed "s/!isWsl/true/g" config/webpack.config.js > config/webpack.config.tmp.js && mv config/webpack.config.tmp.js config/webpack.config.js

echo "const path = require('path');

module.exports = {
    entry: './src/luigi-config/luigi-config.es6.js',
    output: {
        filename: 'luigi-config.js',
        path: path.resolve(__dirname, 'public'),
    },
};">webpack.config.js

sed 's/"scripts": {/"scripts": {\
\    "buildConfig":"webpack --config webpack.config.js",/1' package.json > p.tmp.json && mv p.tmp.json package.json

echo '{
    "globals": {
        "Luigi": "readonly"
    }
}'>.eslintrc.json

# downloads
mkdir -p src/luigi-config
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-react/public/index.html > public/index.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-react/public/sampleapp.html > public/sampleapp.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-react/public/luigi-config.js > src/luigi-config/luigi-config.es6.js


# add index.js
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-react/src/index.js > src/index.js
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-react/src/index.css > src/index.css

# add views
mkdir src/views
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-react/src/views/home.js > src/views/home.js
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-react/src/views/sample1.js > src/views/sample1.js
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-react/src/views/sample2.js > src/views/sample2.js

npm i
npm run buildConfig
npm start
```
<!-- accordion:end -->

2. Open the directory where Luigi is installed. Search for the `luigi-config.js` file which you can use to configure Luigi [navigation](navigation-configuration.md), [authorization](authorization-configuration.md), [general settings](general-settings.md) and more.
