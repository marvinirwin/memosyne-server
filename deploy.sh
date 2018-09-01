#!/usr/bin/env bash

rm -rf dist/*;

./node_modules/.bin/babel ./server --experimental --source-maps-inline -d ./dist/server;

cp -r server/*.json ./dist/server/;
cp -r common dist/common;
cp -r client dist/client;
cp -r node_modules dist/node_modules;
cp datasources.local.js dist/server/datasources.local.js;
cp package.json dist/package.json;
cp -r ./.elasticbeanstalk ./dist/.elasticbeanstalk;

cd dist;

zip memosyne-server -r * .[^.]*;
