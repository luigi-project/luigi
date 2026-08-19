#!/usr/bin/env bash

# Replaces a string in all source and doc files

# Warning to future developers: Do not use "set -e" in this script, else grep will exit on no-match.

LUIGI_ROOT_DIR="$( cd "$(dirname "$0")" ; pwd -P )/../../../"

if [ "$1" == "" ]; then
  echo "No parameters defined. Usage: ./replaceInAllFiles.sh SEARCH REPLACE"
  exit 1;
fi
if [ "$2" == "" ]; then
  echo "Not enough parameters defined. Usage: ./replaceInAllFiles.sh SEARCH REPLACE"
  exit 1;
fi

SEARCH=$1
REPLACE=$2

SOURCES=(
  "docs"
  "core/src"
  "client/src"
  "client/luigi-client.d.ts"
  "plugins/auth/src"
)

# Mac OSX implementation done yet
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Replacing $SEARCH with $REPLACE"
  LC_CTYPE="C"
  LANG="C"
  BASE_STRLEN=${#LUIGI_ROOT_DIR}

  # Iterate over source and md directories
  for i in "${SOURCES[@]}"; do
    # On directories find matches and replace only matches
    # It could be also done a one-liner but it might lead to false-positive
    ALL_FILES=`find $LUIGI_ROOT_DIR$i -type f \( -name '*.md' -o -name '*.js' -o -name '*.ts' \)`

    # Execute replace only if there were findings
    echo $ALL_FILES | xargs grep --silent $SEARCH
    if [ $? -eq 0 ]; then # if match found, exit code is 0

      # Get files as array
      # Dev hint: xargs grep returns string of filenames separated by space, so needed cast as array ()
      FIND_RESULTS=(`echo $ALL_FILES | xargs grep --files-with-matches --no-messages $SEARCH`)
      for i in "${FIND_RESULTS[@]}"; do
        if [ ! "$i" = "" ]; then
          echo "Replacing in ${i:BASE_STRLEN}"
          sed -i '' "s@$SEARCH@$REPLACE@" "$i"
        fi
      done
    fi
  done
  echo "Done"
  exit 0
fi

echo "Unknown OS, this script requires Mac OS X"
exit 1