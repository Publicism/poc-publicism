// @flow

'use strict'

import _ from 'lodash'
import assert from 'assert'
import { describe, it, before, after } from 'mocha'
import * as support from './support'
import proto from '../lib/proto'
import grpc from 'grpc'
import configuration from '../settings/configuration'

describe('makeRequest', () => {
  let server = null

  before(() => {
    return support.startServer().then(s => {
      server = s
    })
  })

  it('return StoredDataObjectRequest', function(done) {
    this.timeout(support.TIMEOUT)
    configuration.grpcBinding().then(binding => {
      const client = new proto.Blockchain(binding, grpc.credentials.createInsecure())
      let dataObjectId = Buffer.from('1')
      let memberId = Buffer.from('BIG_MEMBER')

      client.makeRequest({dataObjectId: { id: dataObjectId }, memberId: { id: memberId }}, function (err, response) {
        assert(!_.isEmpty(response.id.id))
        assert(!_.isEmpty(response.memberId.id))
        assert.deepEqual(response.dataObjectId.id, dataObjectId)
        done()
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
