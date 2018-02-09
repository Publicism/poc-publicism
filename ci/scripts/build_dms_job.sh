#!/usr/bin/env bash
export cwd=$(pwd) &&
cd ./blockchain &&
yarn install --pure-lockfile &&
NODE_ENV=test sh $cwd/ci/startOrReload.sh 'blockchain-test' './dist/index.js' &&
cd .. &&
cd ./dms &&
bash ./scripts/genkey_ci.sh . localhost blockchain &&
yarn install --pure-lockfile &&
#yarn run test &&
cd .. &&
sh ./ci/stopIfExist.sh 'blockchain-test'