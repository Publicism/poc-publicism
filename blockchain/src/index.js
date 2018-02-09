// @flow

import grpc from 'grpc'
import proto from './lib/proto'
import settings from './settings'
import configuration from './settings/configuration'

const server = new grpc.Server()
configuration.blockchainController().then(blockchainController => {

  server.addService(proto.Blockchain.service, blockchainController.handlers())
  settings.grpc(server).then(() => {
    server.start()
  })
})
