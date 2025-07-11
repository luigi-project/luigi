#!/usr/bin/env bash

set -e
echo ""
echo "Installing Luigi with Angular and basic configuration"
echo ""
if [[ "$1" = "" ]]; then
  read -p "Luigi project folder name: " folder
else
  folder=$1
  echo "Luigi project folder name: $folder"
fi
# steps to execute line by line
echo ""
npm i @angular/cli@latest -g
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