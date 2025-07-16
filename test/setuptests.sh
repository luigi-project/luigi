#!/usr/bin/env bash

CLI=$1
PORT=$2
TESTURL=$3
URL=$4

killWebserver() {
  PORT=$1
  SPAPID=`lsof -i :${PORT} | tail -n 1 | tr -s ' ' | cut -d ' ' -f 2`
  if [ "$SPAPID" == "" ]; then
    # Fallback
    # the [] is a workaround to prevent ps showing up itself
    # https://unix.stackexchange.com/questions/74185/how-can-i-prevent-grep-from-showing-up-in-ps-results
    SPAPID=$(eval "ps -A -ww | grep '[p]ort $PORT' | tr -s ' ' |  cut -d ' ' -f 1")
  fi

  if [ ! -z "$SPAPID" ]; then
    echo "Stopping webserver on port $PORT"
    kill $SPAPID;
    exit 0
  fi
}

waitForWebServer() {
  PORT=$1
  TESTURL=$2
  PROC=""

  while [ "$PROC" == "" ]
  do
    PROC=`lsof -i :${PORT} | tail -n 1 | tr -s ' ' | cut -d ' ' -f 2`
    echo $PROC
    sleep 15
  done

  cypress run --env configFile=setuptest.json,url=$TESTURL --browser chrome -c video=false

  killWebserver $PORT
}

# Create new folder for setup
cd ..
mkdir setupTestFolder && cd setupTestFolder

# Install necessary dependencies
npm install -g $CLI cypress@5.3.0 tar@latest

# Create Cypress Config
echo "{}" > cypress.json
mkdir cypress
mkdir cypress/integration
pwd
cp ../luigi/test/e2e-test-application/cypress/e2e/test3/0-setuptests/setup-test.cy.js ./cypress/integration/setup-test.spec.js

#Run actual test
(set -e && waitForWebServer $PORT $TESTURL) & (
curl -s $URL > ./setup.sh &&
printf '\n' | source ./setup.sh test)