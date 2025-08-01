#!/bin/bash
echo ""
echo "Installing Luigi with static files and basic configuration"
echo ""
if [[ "$1" = "" ]]; then
  read -p "Luigi project folder name: " folder
else
  folder=$1
  echo "Luigi project folder name: $folder"
fi
# steps to execute line by line
echo ""
mkdir $folder && cd $folder

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