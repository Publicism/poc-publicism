#!/usr/bin/env bash
cd ./blockchain &&
# yarn run truffle-migrate ---network stage &&
cp -a ./. /var/www/prd/blockchain &&
cd ../protos &&
cp -a ./. /var/www/prd/protos &&
cd /var/www/prd/blockchain &&
rm -rf node_modules &&
yarn install --pure-lockfile