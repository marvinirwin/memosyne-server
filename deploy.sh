#!/usr/bin/env bash

cp datasources.local.js server/datasources.local.js;
zip memosyne-server -r * .[^.]*;
rm server/datasources.local.js;
