#!/bin/bash

geth --datadir ./datadir --networkid 3 --verbosity 3 --rpc --rpcapi="db,eth,net,web3,personal,web3" --ipcpath ~/Library/Ethereum/geth.ipc
