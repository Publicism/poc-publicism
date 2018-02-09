#!/bin/sh
geth --datadir ./datadir removedb
geth --datadir ./datadir init ./CustomGenesis.json