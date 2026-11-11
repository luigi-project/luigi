#!/usr/bin/env bash

set +e # don't exit on errors
BASE_DIR="$( cd "$(dirname "$0")" ; pwd -P )"

source $BASE_DIR/../scripts/shared/bashHelpers.sh


# We assume, Angular example is ran with `npm run build`
# and root dependencies are installed
NG_EXAMPLE="$BASE_DIR/../test/e2e-test-application"
NG_MODULES="$NG_EXAMPLE/node_modules"
if [[ ! -L $NG_MODULES ]] && [[ ! -d $NG_MODULES ]]; then
  echo "Creating symlink for example node_modules";
  ln -s "$BASE_DIR/../node_modules" $NG_MODULES
fi


NG_MODULES_EXTERNALMF="$BASE_DIR/e2e-test-application/externalMf"
if [[ ! -L $NG_MODULES ]] && [[ ! -d $NG_MODULES ]]; then
  echo "Creating symlink for example node_modules";
  ln -s $NG_MODULES $NG_MODULES_EXTERNALMF
fi


echo ""
echo "Angular App"
cd $NG_EXAMPLE
killWebserver 4200
runWebserver 4200 dist /luigi-core/luigi.js
WS_NG_PID=$PID


echo ""
echo "External Micro frontend"
cd "$BASE_DIR/e2e-test-application/externalMf"
killWebserver 8090
runWebserver 8090
WS_EXT_PID=$PID

set -e # exit on errors

cd $NG_EXAMPLE
if [ "$USE_CYPRESS_DASHBOARD" == "true" ] && [ -n "$CYPRESS_DASHBOARD_RECORD_KEY" ]; then
  echo "Running tests in parallel with recording"
  # obtain the key here: https://dashboard.cypress.io/#/projects/czq7qc/settings
  npm run e2e:run:angular -- --record --key $CYPRESS_DASHBOARD_RECORD_KEY
else
  echo "Running tests without parallelization"
  npm run e2e:run:angular
fi

if [ "$USE_CYPRESS_DASHBOARD" == "true" ] && [ -n "$CYPRESS_DASHBOARD_RECORD_KEY" ]; then
  echo "Running tests in parallel with recording"
  # obtain the key here: https://dashboard.cypress.io/#/projects/czq7qc/settings
  npm run e2e:run:external -- --record --key $CYPRESS_DASHBOARD_RECORD_KEY
else
  echo "Running tests without parallelization"
  npm run e2e:run:external
fi
RV=$?


kill $WS_NG_PID
kill $WS_EXT_PID
exit $RV
