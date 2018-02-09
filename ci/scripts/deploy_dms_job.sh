#!/usr/bin/env bash
cd ./dms &&
bash ./scripts/genkey_ci.sh . $1 blockchain &&
cp -a ./. /var/www/prd/dms &&
cd /var/www/prd/dms &&
rm -rf node_modules &&
yarn install --pure-lockfile