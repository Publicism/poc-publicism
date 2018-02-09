// @flow

'use strict'

import assert from 'assert'
import { describe, it, before, after } from 'mocha'
import * as support from './support'
import configuration from '../settings/configuration'
import proto from '../lib/proto'
import grpc from 'grpc'
import util from '../lib/util'
import Member from '../models/Member'

describe('updateMember', () => {
  let server = null

  before(() => {
    return support.startServer().then(s => {
      server = s
    })
  })

  it('updates Member', function(done) {
    this.timeout(support.TIMEOUT)

    configuration.grpcBinding().then(binding => {
      const client = new proto.Blockchain(binding, grpc.credentials.createInsecure())
      let member = support.genMember(util.randomBuffer())

      client.updateMember(member.toProto(), function (err, response) {
        let returnedMember = Member.fromProto(response)
        client.getMemberInfo(returnedMember.id.toProto(), function (err, response) {
          let returnedMember = Member.fromProto(response)
          assert(returnedMember.id.equals(member.id))
          assert.equal(returnedMember.name, member.name)
          assert.deepEqual(returnedMember.info, member.info)
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
