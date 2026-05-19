#!/bin/sh

# netlify is using this file for deployment

cd dev
npm ci
npm run build
