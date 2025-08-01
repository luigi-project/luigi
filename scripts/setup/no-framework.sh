#!/usr/bin/env bash
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

# download the package.json
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/package.json > package.json

npm i 
mkdir -p public/
mkdir -p public/views

# download assets from core/examples folder
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/public/favicon.ico > public/favicon.ico
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/public/logo.png > public/logo.png
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/public/index.html > public/index.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/public/luigi-config.js > public/luigi-config.js
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/public/views/home.html > public/views/home.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-js/public/views/sample1.html > public/views/sample1.html

echo "Running server with command: npm run start"
npm run start
