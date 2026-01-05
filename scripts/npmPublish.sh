#!/usr/bin/env bash

# Publishes the current version

set -e # exit on errors

BASE_DIR="$( cd "$(dirname "$0")" ; pwd -P )"

source $BASE_DIR/shared/bashHelpers.sh

# @luigi-project npm token
function setLuigiNpmToken {
  if [ "$TRAVIS" = "true" ]; then
    if [ "$NPM_LUI_AUTH_TOKEN" = "" ]; then
     echoe "NPM_LUI_AUTH_TOKEN is not set, skipping publishing."
     exit 0
    fi

    # setup token when running in travis
    echo "setLuigiNpmToken"
    echo "//registry.npmjs.org/:_authToken=$NPM_LUI_AUTH_TOKEN" > ~/.npmrc
    npm whoami
  fi
}

function prepublishChecks {
  cd $BASE_DIR/../client/public
  CLIENT_VERSION=$(node -p "require('./package.json').version")
  cd $BASE_DIR/../core/public
  CORE_VERSION=$(node -p "require('./package.json').version")

  echoe "Core Version: $CORE_VERSION, Client Version: $CLIENT_VERSION, Base Dir: $BASE_DIR"

  if [ "$CORE_VERSION" != "$CLIENT_VERSION" ]; then
    echoe "Version mismatch between Client and Core."
    exit 1
  fi

  # Check if it can be published (github release must exist)
  TAGS_GREP=`git ls-remote --tags origin | grep "v$CORE_VERSION$" | wc -l`
  if [[ "$TAGS_GREP" =~ "0" ]]; then
    echo "Tag (github release) does not exist, not going to publish $CORE_VERSION to npm"
    exit 0
  fi
}


function prepublishCheck {
  cd $BASE_DIR/../$1
  VERSION=$(node -p "require('./package.json').version")

  # Check if it can be published (github release must exist )
  TAGS_GREP=`git ls-remote --tags origin | grep "v$VERSION$" | wc -l`
  if [[ "$TAGS_GREP" =~ "0" ]]; then
    echo "Tag (github release) does not exist, not going to publish $VERSION to npm"
    exit 0
  fi
}

function publishPackage {
  BASE_FOLDER=$1
  PUBLISH_FOLDER=$2

  cd $BASE_DIR/../$PUBLISH_FOLDER
  NAME=$(node -p "require('./package.json').name")
  VERSION=$(node -p "require('./package.json').version")

  cd $BASE_DIR/../$BASE_FOLDER

  # Check if was published already
  NPM_GREP=`npm info $NAME versions | grep "'$VERSION'" | wc -l`
  if [[ "$NPM_GREP" =~ "1" ]]; then
    echo "$NAME@$VERSION already published, skipping until next release."
  else
    # echoe "Bundling $NAME@$VERSION ..."
    # npm run bundle

    echoe "Publishing $NAME@$VERSION ..."

    npm publish $BASE_DIR/../$PUBLISH_FOLDER --access public
    npm dist-tag add $NAME@$VERSION next
    if [[ $VERSION != *"rc"* ]] && [[ $VERSION != *"next."* ]]; then
      echo "Tag $NAME@$VERSION with latest and next on npm"
      npm dist-tag add $NAME@$VERSION latest
      M_TAG=`echo $VERSION | cut -d "." -f 1,2 | tr . -`
      npm dist-tag add $NAME@$VERSION v$M_TAG
      echo "Tag $NAME@$VERSION with latest, next and v${M_TAG} on npm"
    else
      echo "Release candidate $NAME@$VERSION NOT tagged as latest"
    fi

    echoe "Published $NAME@$VERSION"
  fi # end NPM_GREP
}

function removeNpmToken {
  if [ "$TRAVIS" = "true" ]; then
    # setup token when running in travis
    echo "" > ~/.npmrc
  fi
}

function checkRequiredFiles {
  args=("$@")
  for ((i=0; i<${#args[@]}; i++)); do
    if [ $i -gt 0 ]; then
      if [ ! -f $BASE_DIR/../${args[0]}/${args[i]} ]; then
        echo "Invalid release, file does not exist: ${args[0]}/${args[i]}"
        exit 1;
      fi
    fi
  done
}




setLuigiNpmToken


if [ "$1" = "cra-release" ]; then
  echo "$PWD"
  checkRequiredFiles "cra-template/template/public" "index.html" "luigi-config.js"
  publishPackage "cra-template" "cra-template"
elif [ "$1" = "luigi-container-release" ]; then
  echo "$PWD"
  checkRequiredFiles "container/public" "bundle.js" "bundle.js.map" "index.d.ts" "LuigiCompoundContainer.svelte.d.ts" "LuigiContainer.svelte.d.ts" "package.json" "README.md"
  publishPackage "container" "container/public"
elif [ "$1" = "luigi-headless-release" ]; then
  echo "$PWD"
  checkRequiredFiles "core-modular/public" "luigi.js" "luigi.js.map" "main.d.ts" "package.json" "README.md"
  publishPackage "core-modular" "core-modular/public"
elif [ "$1" = "luigi-client-support-ui5-release" ]; then
  echo "$PWD"
  checkRequiredFiles "client-frameworks-support/client-support-ui5/dist" "package.json" "README.md" "ui5-support-lib.js"
  publishPackage "client-frameworks-support/client-support-ui5" "client-frameworks-support/client-support-ui5/dist"
elif [ "$1" = "luigi-client-support-angular-release" ]; then
  echo "$PWD"
  checkRequiredFiles "client-frameworks-support/client-support-angular/dist/client-support-angular" "package.json" "README.md"
  checkRequiredFiles "client-frameworks-support/client-support-angular/dist/client-support-angular/types" "luigi-project-client-support-angular.d.ts"
  checkRequiredFiles "client-frameworks-support/client-support-angular/dist/client-support-angular/fesm2022" "luigi-project-client-support-angular.mjs" "luigi-project-client-support-angular.mjs.map"
  publishPackage "client-frameworks-support/client-support-angular" "client-frameworks-support/client-support-angular/dist/client-support-angular"
elif [ "$1" = "auth-oidc-pkce-plugin-release" ]; then
  echo "$PWD"
  checkRequiredFiles "plugins/auth/public/auth-oidc-pkce" "plugin.js" "README.md"
  publishPackage "plugins" "plugins/auth/public/auth-oidc-pkce"
else
  prepublishChecks
  # Luigi OAuth Plugin
  if ( prepublishCheck "plugins/auth/public/auth-oauth2" ); then
    checkRequiredFiles "plugins/auth/public/auth-oauth2" "plugin.js" "README.md"
    publishPackage "plugins" "plugins/auth/public/auth-oauth2"
  fi

  # Luigi Oidc Plugin
  if ( prepublishCheck "plugins/auth/public/auth-oidc" ); then
    checkRequiredFiles "plugins/auth/public/auth-oidc" "plugin.js" "README.md"
    publishPackage "plugins" "plugins/auth/public/auth-oidc"
  fi

  # Luigi Testing Utilities
  if ( prepublishCheck "client-frameworks-support/testing-utilities/dist"); then
    checkRequiredFiles "client-frameworks-support/testing-utilities/dist" "luigi-mock-util.d.ts" "index.d.ts" "README.md"
    publishPackage "client-frameworks-support/testing-utilities" "client-frameworks-support/testing-utilities/dist"
  fi

  # Luigi Client & Core
  checkRequiredFiles "core/public" "luigi.js" "luigi.css" "README.md"
  publishPackage "core" "core/public"

  checkRequiredFiles "client/public" "luigi-client.d.ts" "luigi-client.js" "README.md"
  publishPackage "client" "client/public"
fi


removeNpmToken
