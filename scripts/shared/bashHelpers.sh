#!/usr/bin/env bash

LUIGI_BASE_DIR="$( cd "$(dirname "$BASH_SOURCE")" ; pwd -P )/../.."

echoe() {
  # find all colors here: https://stackoverflow.com/questions/5947742/how-to-change-the-output-color-of-echo-in-linux#5947802
  # Reset
  Color_Off='\033[0m'       # Text Reset

  # Bold High Intensity
  BIBlack='\033[1;90m'      # Black

  # High Intensity backgrounds
  On_IYellow='\033[0;103m'  # Yellow

  echo ""
  echo ""
  echo -e " ${On_IYellow}${BIBlack}${1}${Color_Off} "
  echo ""
}

#
# runWebserver PORT FOLDER TESTLINK
# runWebserver 4200 dist /luigi-core/luigi.js
# returns/exposes $PID
#
runWebserver() {
  local PORT=$1
  local FOLDER=$2
  local TESTPATH=$3
  PATH="$PATH:$LUIGI_BASE_DIR/node_modules/.bin"

  echo ""
  echo "Starting webserver on port $PORT"

  sirv $FOLDER --single --cors --port $PORT --quiet &
  PID=$!

  echo "Webserver running with PID $PID"
  # wait until example is built and running
  local SLEEPSECS=1 # sleep time between webserver availability check
  local WAITCOUNT=0
  until $(curl --output /dev/null --silent --head --fail http://localhost:$PORT$TESTPATH); do
    if [ $WAITCOUNT -gt 15 ]; then
      echo "Starting Webserver on $PORT timed out."
      exit 1;
    fi
    printf '.'
    sleep $SLEEPSECS
    WAITCOUNT=$(($WAITCOUNT + $SLEEPSECS))
  done
  echo ""
  echo "Webserver was ready after $WAITCOUNT seconds"
}

#
# killWebserver PORT
# killWebserver 4200
#
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
    kill -9 $SPAPID
    echoe "Cleanup: webserver stopped"
  else
    echoe "Cleanup: webserver was not running"
  fi
}