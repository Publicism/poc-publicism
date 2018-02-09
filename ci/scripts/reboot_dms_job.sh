#!/usr/bin/env bash
export cwd=$(pwd) &&
cd /var/www/prd/dms/ &&
> ~/.machinomy/storage.db &&
NODE_ENV=stage machinomyAccount=$3 memberid=$2 host=$1 sh $cwd/ci/startOrReload.sh 'dms' './app.js'