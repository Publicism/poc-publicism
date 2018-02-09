#!/usr/bin/env bash
export cwd=$(pwd) &&
cd /var/www/prd/blockchain/ &&
NODE_ENV=stage sh $cwd/ci/startOrReload.sh 'blockchain' './dist/index.js'