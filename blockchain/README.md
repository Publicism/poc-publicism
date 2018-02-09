# Blockchain API

## Set up

### Prerequisites

Before installing the application make sure you have these apps running somewhere:

- MongoDB,
- Geth ethereum node,
- [Truffle](http://truffleframework.com) v3.2.2.

To set up those, please consider [MongoDB Installation Manual](https://docs.mongodb.com/manual/installation/) and
[Geth Installation Instructions](https://www.ethereum.org/cli#geth).

For Geth, please, unlock the account that will be used by the system. You could do it on start up by providing a key
`--unlock 0`. Also, you would need HTTP RPC API enabled. Keys `-rpc --rpcapi="db,eth,net,web3,personal,admin" --rpccorsdomain "*"`
turn that on.

### Installation

First, you copy contents of the project somewhere on disk. For example, you copied that to `/srv/blockchain`.
Then you go to that folder and run

```
yarn install --pure-lockfile
```

## Configuration

The application is configured by JSON files in `/config` folder. You could use `/config/default.json` as an example to
prepare your config file. For production mode, name the file `/config/production.json`.

Here is a meaning of the fields:

```
{
  "server": {
    "port": 5000, // Port that server listens to
    "address": "0.0.0.0" // Addres that server binds to
  },
  "eth": {
    "account": "0x50f550d0bbce84fa67232c33f821e202be35112f", // Ethereum account
    "api": "http://localhost:8545" // Ethereum HTTP RPC API endpoint
  },
  "mongo": {
    "address": "mongodb://localhost:27017", // MongoDB API endpoint
    "database": "blockchain" // MongoDB database
  }
}
```

## Running

After all the dependencies are installed, and configuration is done, run 

```
yarn run serve
```

## Usage

See Google Protobuf definition file for RPC methods and messages. A client looks like this:

```
import grpc from 'grpc'
import proto from '../lib/proto'

const client = new proto.Blockchain('localhost:5000', grpc.credentials.createInsecure())
client.addDataObject({id: {id: Buffer.from('1')}, hash: Buffer.from('2')}, function (err, response) {
  console.log(err)
  console.log(response)
})
```
