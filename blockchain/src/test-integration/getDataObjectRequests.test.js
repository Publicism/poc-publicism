// @flow

import _ from 'lodash'
import assert from 'assert'
import { describe, it, before, after } from 'mocha'
import * as support from './support'
import proto from '../lib/proto'
import util from '../lib/util'
import grpc from 'grpc'
import configuration from '../settings/configuration'

describe('getDataObjectRequests', () => {
  let server = null

  before(() => {
    return support.startServer().then(s => {
      server = s
    })
  })

  it('return DataObjectRequestsList', function(done) {
    this.timeout(support.TIMEOUT)
    configuration.grpcBinding().then(binding => {
      const client = new proto.Blockchain(binding, grpc.credentials.createInsecure())
      let dataObjectId = util.randomBuffer()
      let memberId = util.randomBuffer()

      client.makeRequest( { dataObjectId: { id: dataObjectId }, memberId: { id: memberId } }, function () {
        client.getDataObjectRequests({}, function (err, response) {
          let list = response.list
          assert(!_.isEmpty(list))
          assert(_.find(list, request => _.isEqual(dataObjectId, request.dataObjectId.id)))
          done()
        })
      })
    })
  })

  after(() => {
    if (server) {
      return support.stopServer(server)
    } else {
      return null
    }
  })
})
