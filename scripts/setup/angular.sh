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
ng new $folder --routing --defaults --skip-git && cd $folder    # skip interactive prompts

npm i -P @luigi-project/core @luigi-project/client fundamental-styles @sap-theming/theming-base-content webpack@5.74.0 webpack-cli@4.10.0 
sed 's/"scripts": {/"scripts": {\
\   "buildConfig":"webpack --entry .\/public\/assets\/luigi-config.es6.js --output-path .\/public\/assets --output-filename luigi-config.js --mode production",/1' package.json > p.tmp.json && mv p.tmp.json package.json
mkdir public/assets

# the following steps can be copy and pasted to the terminal at once
cp src/index.html src/angular.html

# download assets
curl https://raw.githubusercontent.com/luigi-project/luigi/main/scripts/setup/assets/index.html > public/index.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/scripts/setup/assets/luigi-config.es6.js > public/assets/luigi-config.es6.js
curl https://raw.githubusercontent.com/luigi-project/luigi/main/scripts/setup/assets/basicMicroFrontend.html > public/assets/basicMicroFrontend.html

# string replacements in some files
sed 's#"src/index.html"#"src/angular.html"#g' angular.json > tmp.json && mv tmp.json angular.json

sed 's#"src/styles.css"#"src/styles.css",\
             "node_modules/fundamental-styles/dist/theming/sap_fiori_3.css",\
             "node_modules/@sap-theming/theming-base-content/content/Base/baseLib/sap_fiori_3/css_variables.css",\
             "node_modules/fundamental-styles/dist/fundamental-styles.css"#g' angular.json > tmp.json && mv tmp.json angular.json
sed 's#"src/assets"#"src/assets",\
              "src/index.html",\
              "src/logout.html",\
              {"glob": "fundamental-styles.css","input": "node_modules/fundamental-styles/dist","output": "/fundamental-styles"},\
              {"glob": "*","input": "node_modules/@sap-theming/theming-base-content","output": "/fonts"},\
              {"glob": "**","input": "node_modules/@luigi-project/core","output": "/luigi-core"},\
              {"glob": "luigi-client.js","input": "node_modules/@luigi-project/client","output": "/luigi-client"}#g' angular.json > tmp.json && mv tmp.json angular.json

npm run buildConfig
rm public/assets/luigi-config.es6.js

# match basic folder structure of an angular project
cp -r node_modules/@luigi-project/core public/luigi-core
cp -r node_modules/@luigi-project/client public/luigi-client
cp -r node_modules/fundamental-styles public/fundamental-styles

# change path to fd-styles to prevent error message
sed -i 's|<link rel="stylesheet" href="/fundamental-styles/fundamental-styles.css" />|<link rel="stylesheet" href="/fundamental-styles/dist/fundamental-styles.css" />|' public/assets/basicMicroFrontend.html

npm run start