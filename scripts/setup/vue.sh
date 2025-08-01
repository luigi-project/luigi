#!/usr/bin/env bash

if ! command -v vue 2>/dev/null; then
  echo "Vue CLI required, please install it globally and try again."
  echo "npm i -g @vue/cli"
  exit 1;
fi

echo ""
echo "Installing Luigi with static files and basic configuration"
echo ""
if [[ "$1" = "" ]]; then
  read -p "Luigi project folder name: " folder
else
  folder=$1
  echo "Luigi project folder name: $folder"
fi

# create sample vue app
vue create -d $folder && cd $folder

# install dependencies
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/package.json > package.json
npm i

mkdir -p src/views src/router 

# cleanup default installation
rm public/index.html src/app.vue # remove default index, will be replaced with example assets
rm -rf src/components

curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/vite.config.mjs > vite.config.mjs
# fetch assets from vue example
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/index.html > index.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/public/index.html > public/index.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/public/sampleapp.html > sampleapp.html
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/src/app.vue > src/app.vue
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/src/main.js > src/main.js
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/public/luigi-config.js > public/luigi-config.js

curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/src/router/index.js > src/router/index.js

curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/src/views/home.vue > src/views/home.vue
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/src/views/sample1.vue > src/views/sample1.vue
curl https://raw.githubusercontent.com/luigi-project/luigi/main/core/examples/luigi-example-vue/src/views/sample2.vue > src/views/sample2.vue

npm run build
npm run serve
