#!/usr/bin/env bash
cd ./blockchain &&
yarn install --pure-lockfile
#NODE_ENV=test yarn run test &&
#yarn run truffle-migrate -- --network test &&
#yarn run truffle-test -- --network test
#NODE_ENV=test yarn run test-integration