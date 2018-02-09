#!/usr/bin/env bash
export cwd=$(pwd) &&
sh $cwd/ci/stopIfExist.sh 'blockchain-test' &&
cd /var/www/prd/blockchain/ &&
sh $cwd/ci/startOrReload.sh 'blockchain' './dist/index.js' &&
cd /var/www/prd/dms/ &&
sh $cwd/ci/startOrReload.sh 'dms' './app.js'