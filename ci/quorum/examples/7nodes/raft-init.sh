#!/bin/bash
set -u
set -e

echo "[*] Cleaning up temporary data directories"
rm -rf qdata
mkdir -p qdata/logs

echo "[*] Configuring node 1"
mkdir -p qdata/dd1/{keystore,geth}
cp raft/static-nodes.json qdata/dd1
cp keys/key1 qdata/dd1/keystore
cp keys/UTC--2017-08-02T08-46-45.350859358Z--d8cc7da026c44af04dc73578b17efb7f6f87a0f9 qdata/dd1/keystore
cp keys/UTC--2017-08-02T08-47-16.765501189Z--05e8e3f35582003646c5ad20b54e122128449d45 qdata/dd1/keystore
cp keys/UTC--2017-08-02T08-47-35.774979951Z--9422e11a4f6fe3dae5ea4716674140952de2a698 qdata/dd1/keystore
cp raft/nodekey1 qdata/dd1/geth/nodekey
geth --datadir qdata/dd1 init genesis.json

echo "[*] Configuring node 2"
mkdir -p qdata/dd2/{keystore,geth}
cp raft/static-nodes.json qdata/dd2
cp keys/key2 qdata/dd2/keystore
cp keys/key3 qdata/dd2/keystore
cp raft/nodekey2 qdata/dd2/geth/nodekey
geth --datadir qdata/dd2 init genesis.json

echo "[*] Configuring node 3"
mkdir -p qdata/dd3/{keystore,geth}
cp raft/static-nodes.json qdata/dd3
cp raft/nodekey3 qdata/dd3/geth/nodekey
geth --datadir qdata/dd3 init genesis.json

echo "[*] Configuring node 4 as voter"
mkdir -p qdata/dd4/{keystore,geth}
cp raft/static-nodes.json qdata/dd4
cp keys/key4 qdata/dd4/keystore
cp raft/nodekey4 qdata/dd4/geth/nodekey
geth --datadir qdata/dd4 init genesis.json

echo "[*] Configuring node 5 as voter"
mkdir -p qdata/dd5/{keystore,geth}
cp raft/static-nodes.json qdata/dd5
cp keys/key5 qdata/dd5/keystore
cp raft/nodekey5 qdata/dd5/geth/nodekey
geth --datadir qdata/dd5 init genesis.json

echo "[*] Configuring node 6"
mkdir -p qdata/dd6/{keystore,geth}
cp raft/static-nodes.json qdata/dd6
cp raft/nodekey6 qdata/dd6/geth/nodekey
geth --datadir qdata/dd6 init genesis.json

echo "[*] Configuring node 7"
mkdir -p qdata/dd7/{keystore,geth}
cp raft/static-nodes.json qdata/dd7
cp raft/nodekey7 qdata/dd7/geth/nodekey
geth --datadir qdata/dd7 init genesis.json
