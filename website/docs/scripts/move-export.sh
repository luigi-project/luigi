#!/usr/bin/env bash
set -e # exit on errors
B_DIR="$( cd "$(dirname "$0")" ; pwd -P )"
BASE_DIR=$B_DIR/../

Color_Off='\033[0m'       # Text Reset
BIBlue='\033[1;34m'      # Light Blue, bold

PUBLIC_DIR=$BASE_DIR/public
STATIC_DIR=$BASE_DIR/static

LUIGI_CORE=$PUBLIC_DIR/luigi-core
LUIGI_CLIENT=$PUBLIC_DIR/luigi-client
SRC=$BASE_DIR/src
SVELTE_BUILD=$BASE_DIR/build


NODE_MODULES_CORE=$BASE_DIR/node_modules/@luigi-project/core
NODE_MODULES_CLIENT=$BASE_DIR/node_modules/@luigi-project/client

# docsearch.js is deprecated and has security issues. Need to use the docsearch.min.css standalone instead
# NODE_MODULES_DOCSEARCH=$BASE_DIR/node_modules/docsearch.js/dist/cdn/docsearch.min.css
DOCS_IMG_ASSETS=$BASE_DIR/../../docs/assets


# SITEMAP_FILE=$BASE_DIR/sitemap.xml
ROBOTSTXT_FILE=$BASE_DIR/robots.txt

mkdir -p $LUIGI_CORE
mkdir -p $LUIGI_CLIENT
mkdir -p $STATIC_DIR/assets
mkdir -p $SRC/assets
mkdir -p $SRC/images
mkdir -p $PUBLIC_DIR/docs
mkdir -p $PUBLIC_DIR/docu-microfrontend
mkdir -p $STATIC_DIR/luigi-client
mkdir -p $PUBLIC_DIR/assets
mkdir -p $PUBLIC_DIR/images

# copy luigi client to static dir for serving in development mode only
cp -R $NODE_MODULES_CLIENT/* $STATIC_DIR/luigi-client

# copy luigi client and luigi core to public folder or wherever needed, to avoid using extra dependencies on vite side
cp -R $NODE_MODULES_CLIENT/* $LUIGI_CLIENT
cp $NODE_MODULES_CORE/* $LUIGI_CORE

echo "----------------------------------------------------------------"
ls $LUIGI_CLIENT
ls $LUIGI_CORE
echo "DONE: Client and Core copied from node_modules $LUIGI_CLIENT , $LUIGI_CORE"
echo "----------------------------------------------------------------"
echo "-"

# copy docu image assets to assets folder for development use
cp $DOCS_IMG_ASSETS/* $STATIC_DIR/assets
cp $STATIC_DIR/images/* $SRC/images
echo "----------------------------------------------------------------"
ls $STATIC_DIR/assets
echo "DONE: Docu image assets copied from root repository /docs folder"
echo "----------------------------------------------------------------"
echo "-"

# copy docu image assets to assets folder for production use
cp $DOCS_IMG_ASSETS/* $PUBLIC_DIR/assets
cp $STATIC_DIR/images/* $PUBLIC_DIR/images
echo "----------------------------------------------------------------"
ls $PUBLIC_DIR/assets
ls $PUBLIC_DIR/images
echo "DONE: Docu image assets copied from root repository /docs folder and local /static folder into /public/assets and /public/images for production"
echo "----------------------------------------------------------------"
echo "-"

# copy robots text file and other files to public folder for production use
cp $ROBOTSTXT_FILE $PUBLIC_DIR
cp -R $STATIC_DIR/public/* $PUBLIC_DIR

# copy redirects file for netlify
cp $BASE_DIR/src/_redirects $PUBLIC_DIR/
ls $PUBLIC_DIR
echo "DONE: Miscellaneous docu production assets into /public folder for production use"
echo "----------------------------------------------------------------"
echo "-"


echo "----------------------------------------------------------------"
echo "DONE: Documentation files were exported to respective folders"
echo "----------------------------------------------------------------"
echo "-"