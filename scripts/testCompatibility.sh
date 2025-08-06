#!/usr/bin/env bash

# We're considering the branch checked out that we want to test against.

set -e # exit on errors

# xtrace https://wiki-dev.bash-hackers.org/scripting/debuggingtips#making_xtrace_more_useful
# set -v # verbose output
# set -x # print everything as if it were executed
export PS4='+(${BASH_SOURCE}:${LINENO}): ${FUNCNAME[0]:+${FUNCNAME[0]}(): }'


showHelp() {
  echo ""
  echo ""
  echo "Be sure to stop all other running luigi related"
  echo "frontend projects (ports 4200 and 8080 must not be in use)"
  echo ""
  echo ""
  echo "Usage:"
  echo ""
  echo "./scripts/testCompatibility --tag latest"
  echo "./scripts/testCompatibility --tag latest --install"
  echo "or"
  echo "npm run test:compatibility -- --tag latest"
  echo "npm run test:compatibility -- --tag v4.4.0"
  echo "npm run test:compatibility -- --tag v4.4.0 --install"
  echo ""
  echo "npm run test:compatibility -- --test-only"
  echo ""
  echo ""
  echo "--tag latest"
  echo "Run with latest tag to specify the latest released version to test"
  echo "against the currently checked out version."
  echo ""
  echo "--install"
  echo "Run with --install flag if current luigi installation requires "
  echo "install and bundling, eg. directly after CI checkout. By default"
  echo "we assume that luigi is installed and npm run bundle was executed in root folder."
  echo ""
  echo "Test only usage:"
  echo "--test-only"
  echo "Runs only local webserver and test suite, it assumes the bundling and"
  echo "building has been done already"
  echo ""
  echo ""
}

BASE_DIR="$( cd "$(dirname "$0")" ; pwd -P )"

cd $BASE_DIR/../

source $BASE_DIR/shared/bashHelpers.sh

declare -a APP_FOLDERS=(
  "test/e2e-client-api-test-app"
  "test/e2e-test-application"
  "test/e2e-js-test-application"
  "test/e2e-test-application/externalMf"
)

# Used for setting up webserver and killing them
declare -a APP_PORTS=(
  3000 # e2e-client-api-test-app
  4200 # e2e-test-application
  4500 # e2e-js-test-application
  8090 # externalMf
)

declare -a APP_PUBLIC_FOLDERS=(
  "public" # e2e-client-api-test-app
  "dist" # e2e-test-application
  "public" # e2e-js-test-application
  "externalMf" # externalMf
)

declare -a APP_PATH_CHECK=(
  "/index.html" # e2e-client-api-test-app
  "/luigi-core/luigi.js" # e2e-test-application
  "/index.html" # e2e-js-test-application
  "/customUserSettingsMf.html" # externalMf
)

killWebServers() {
  for PORT in "${APP_PORTS[@]}"; do
    killWebserver $PORT
  done
}

promptForTag() {
  # PROMPT FOR TAG
  git reset --hard HEAD
  if [ "latest" = "$TAG" ]; then
    git config pull.ff only       # fast-forward only
    echo "Fetch with depth 500 and tags"
    git fetch --depth 500 --tags
    echo "Set config remote.origin.fetch"
    git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*" # get access to all origin branches
    echo "Get latest tag"
    git tag -l --sort=committerdate | tail -1
    LATEST_LOCAL_TAG=`(git tag -l --sort=committerdate | tail -1)`
    if [ "" = "$LATEST_LOCAL_TAG" ]; then
        echo "No tags available, raise depth on git pull"
        exit 2
    fi
    TAG=$LATEST_LOCAL_TAG
    echo "Using latest Tag: $TAG"
  else
    echo "Fetching tags"
    git fetch --tags
  fi
  if [ "" = "$TAG" ]; then
    # LATEST_LOCAL_TAG=`(git tag -l | tail -1)`
    echoe "Choose Luigi Version to test against"
    echo "No tag provided, pick one of the last releases;"
    echo "Fetching current releases are being fetched from github."
    echo ""
    rawReleases=`curl -s https://api.github.com/repos/luigi-project/luigi/releases`
    # rawReleases=`cat releases`

    count=1;
    showNumReleases=4
    releases=()
    while read name id; do
      if [ "$count" -gt "$showNumReleases" ]; then
        break
      fi
      newName=`echo $name | sed 's/\"//g' | sed 's/,//g'`
      if [[ "${newName:0:1}" == "v" ]]; then
        echo "$count) $newName"
        releases[count]=$newName;
        count=`expr $count + 1`
      fi;
    done < <(echo $rawReleases | jq 'map(.tag_name)')

    echo ""
    read -p "Tag #: " selectedIndex
    echo "Selected Tag: ${releases[selectedIndex]}"
    TAG=${releases[selectedIndex]};
  fi
}

### This function verifies that the local current luigi is properly built/bundled
### TODO / Since this is already done in build stage, it might not be needed here. Check again after release if tests run properly
verifyInstallation() {
  ### VERIFY LOCAL CURRENT LUIGI
  if [ "$INSTALL" == "true" ]; then
    echoe "Verifying current Luigi"

    echoe "Installing all packages and symlink cross dependencies"
    cd "$LUIGI_DIR"
    npm run bootstrap

    echoe "Bundling packages"
    npm run bundle

    echoe "Luigi installation & bundling done"
  fi
}

### CHECKOUT THE SELECTED VERSION
checkoutLuigiToTestfolder() {
  # check if lfolder exists, else only walk into it
  if [ ! -d $LUIGI_DIR_TESTING ]; then
    echoe "Creating test folder"
    if [ "$CI" == "true" ]; then
      # gh actions
      echoe "Clone using gh cli"
      gh repo clone https://github.com/luigi-project/luigi.git $LUIGI_DIR_TESTING
    else
      # osx localhost
      echoe "Clone using ssh"
      git clone git@github.com:SAP/luigi.git $LUIGI_DIR_TESTING
    fi
  fi

  if [ ! -d $LUIGI_DIR_TESTING ]; then
    echoe "There was an issue cloning the repository (github permissions?)"
    exit 2
  fi

  cd $LUIGI_DIR_TESTING
  echoe "Checking out selected release tag $TAG"
  git checkout tags/$TAG
  for FOLDER in "${APP_FOLDERS[@]}"; do
    echoe "Installing app $FOLDER in $LUIGI_DIR_TESTING"
    cd $LUIGI_DIR_TESTING/$FOLDER
    npm i
  done
}

linkLuigi() {
  for FOLDER in "${APP_FOLDERS[@]}"; do
    NODE_MODULES_LUIGI=$LUIGI_DIR_TESTING/$FOLDER/node_modules/@luigi-project
    echoe "Linking current Luigi to selected version in $FOLDER"
    # remove installed luigi versions and symlink with latest
    mkdir -p $NODE_MODULES_LUIGI
    rm -rf $NODE_MODULES_LUIGI/*
    ln -s $LUIGI_DIR/core/public $NODE_MODULES_LUIGI/core
    ln -s $LUIGI_DIR/client/public $NODE_MODULES_LUIGI/client
    ln -s $LUIGI_DIR/plugins/auth/public/auth-oauth2 $NODE_MODULES_LUIGI/plugin-auth-oauth2
    ln -s $LUIGI_DIR/plugins/auth/public/auth-oidc $NODE_MODULES_LUIGI/plugin-auth-oidc
    ln -s $LUIGI_DIR/plugins/auth/public/auth-oidc-pkce $NODE_MODULES_LUIGI/plugin-auth-oidc-pkce
    ln -s $LUIGI_DIR/client-frameworks-support/client-support-angular/dist/client-support-angular $NODE_MODULES_LUIGI/client-support-angular
    ln -s $LUIGI_DIR/client-frameworks-support/testing-utilities/dist $NODE_MODULES_LUIGI/testing-utilities

    # Print content of folders for debugging
    echoe "Contents of node_modules/@luigi-project/* packages ..."
    ls -la $NODE_MODULES_LUIGI
    ls $NODE_MODULES_LUIGI/core
    ls $NODE_MODULES_LUIGI/client
    ls $NODE_MODULES_LUIGI/plugin-auth-oauth2
    ls $NODE_MODULES_LUIGI/plugin-auth-oidc
    ls $NODE_MODULES_LUIGI/plugin-auth-oidc-pkce
    ls $NODE_MODULES_LUIGI/client-support-angular
    ls $NODE_MODULES_LUIGI/testing-utilities
    echoe "Finished printing contents"


    if [ ! -f $NODE_MODULES_LUIGI/core/package.json ]; then
      echoe "There was an issue linking the core module"
      exit 2
    fi
    if [ ! -f $NODE_MODULES_LUIGI/client/package.json ]; then
      echoe "There was an issue linking the client module"
      exit 2
    fi
    if [ ! -f $NODE_MODULES_LUIGI/plugin-auth-oauth2/package.json ]; then
      echoe "There was an issue linking the auth-oauth2 module"
      exit 2
    fi
    if [ ! -f $NODE_MODULES_LUIGI/plugin-auth-oidc-pkce/package.json ]; then
      echoe "There was an issue linking the auth-oidc-pkce module"
      exit 2
    fi
    if [ ! -f $NODE_MODULES_LUIGI/plugin-auth-oidc/package.json ]; then
      echoe "There was an issue linking the auth-oidc module"
      exit 2
    fi
    if [ ! -f $NODE_MODULES_LUIGI/client-support-angular/package.json ]; then
      echoe "There was an issue linking the client-support-angular module"
      exit 2
    fi
  done
}

bundleApp() {
  echoe "Bundling e2e test app"
  cd $LUIGI_DIR_TESTING/test/e2e-test-application
  npm run build
}

verifyAndStartWebserver() {
  killWebServers

  for i in "${!APP_FOLDERS[@]}"; do
    echoe "Run app webserver on ${APP_PORTS[$i]}"
    cd $LUIGI_DIR_TESTING/${APP_FOLDERS[$i]}
    if [ "${APP_FOLDERS[$i]}" == "test/e2e-test-application/externalMf" ]; then
      # required for starting externalMF, otherwise webserver tries to start on /test/e2e-test-application/externalMf/externalMf
      echoe "Stepping out"
      cd ..
    fi
    if [ "${APP_FOLDERS[$i]}" != "test/e2e-client-api-test-app" ] && [ "${APP_FOLDERS[$i]}" != "test/e2e-js-test-application" ]; then
      runWebserver ${APP_PORTS[$i]} ${APP_PUBLIC_FOLDERS[$i]} ${APP_PATH_CHECK[$i]}
    else
      npm run dev &
    fi
  done
}

startE2eTestrunner() {
  echoe "Starting e2e test headless"
  cd $LUIGI_DIR_TESTING/${APP_FOLDERS[1]}

  if [ "$USE_CYPRESS_DASHBOARD" == "true" ] && [ -n "$CYPRESS_DASHBOARD_RECORD_KEY" ]; then
    echo "Running compatibility tests with recording"
    echo "Check the link https://dashboard.cypress.io/#/projects/czq7qc for the recording"
    # obtain the key here: https://dashboard.cypress.io/#/projects/czq7qc/settings
    npm run e2e:run:angular -- --record --key $CYPRESS_DASHBOARD_RECORD_KEY
  else
    echo "Running tests without recording"
    npm run e2e:run:angular
  fi

  # Check and kill webservers again
  killWebServers
}


# Script

LUIGI_DIR="${BASE_DIR}/.."
LUIGI_FOLDERNAME="luigi-compatibility-testing"
LUIGI_DIR_TESTING="$LUIGI_DIR/../$LUIGI_FOLDERNAME"

EXAMPLE_DIR="$LUIGI_DIR_TESTING"
NODE_MODULES=$EXAMPLE_DIR/node_modules/@luigi-project

TESTONLY=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    # commands with input value, shift 2
    -t|--tag) TAG="$2"; shift 2;;

    # validity check for argumenst with input value
    -t|--tag) echoe "$1 requires an argument" >&2; exit 1;;

    # commands without input value, shift 1
    -i|--install) INSTALL="true"; shift 1;;

    -to|--test-only) TESTONLY="true"; shift 1;;

    -*) echoe "unknown argument: $1" >&2; showHelp; exit 1;;
    *) handle_argument "$1"; shift 1;;
  esac
done


if [ "" == "$TESTONLY" ]; then
  promptForTag
  verifyInstallation
  checkoutLuigiToTestfolder
  linkLuigi
  ls -lah $LUIGI_DIR_TESTING/test/e2e-test-application/node_modules/@luigi-project
  cd $LUIGI_DIR_TESTING/test/e2e-test-application/node_modules/@luigi-project
  ls *
  bundleApp
else
  echoe "Running bunded example and e2e tests"
fi

echoe "Running verifyAndStartWebserver:"
verifyAndStartWebserver

echoe "Running startE2eTestrunner:"
startE2eTestrunner

echoe "Compatibility tests finished successfully"
