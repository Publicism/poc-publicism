// @flow

import grpc from 'grpc'
import proto from '../lib/proto'

const client = new proto.Blockchain('localhost:5000', grpc.credentials.createInsecure())
client.addDataObject({id: {id: Buffer.from('1')}, hash: Buffer.from('2')}, function (err, response) {
  console.log(err)
  console.log(response)
})
