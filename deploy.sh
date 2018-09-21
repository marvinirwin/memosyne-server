#!/usr/bin/env bash

# cp -r server/*.json ./dist/server/;
# cp -r common dist/common;
# cp -r client dist/client;
# cp -r node_modules dist/node_modules;
# cp datasources.local.js dist/server/datasources.local.js;
# cp package.json dist/package.json;
# cp -r ./.elasticbeanstalk ./dist/.elasticbeanstalk;

# cd dist;

cp datasources.local.js server/datasources.local.js;
zip memosyne-server -r * .[^.]*;
rm server/datasources.local.js;
