// @flow

'use strict'

import _ from 'lodash'
import assert from 'assert'
import { describe, it } from 'mocha'

import { DidAdd, DataObjectRequestHistoryContract, Request } from '../storage/DataObjectRequestHistoryContract'
import * as util from '../lib/util'
import * as support from './support'

const geth = (): Promise<[DataObjectRequestHistoryContract, string]> => {
  return support.geth((account, provider) => new DataObjectRequestHistoryContract(account, provider))
}

describe('DataObjectRequestHistoryContract', () => {
  describe('.add', () => {
    it('add entry', function () {
      this.timeout(support.TIMEOUT)
      let memberId = Buffer.from('memberId')
      let dataObjectId = Buffer.from('dataObjectId')
      return geth().then(([contract, account]) => {
        return contract.add(memberId, dataObjectId).then(didAddEvent => {
          assert(didAddEvent instanceof DidAdd)
          assert.deepEqual(didAddEvent.memberId, memberId)
          assert.deepEqual(didAddEvent.dataObjectId, dataObjectId)
        })
      })
    })
  })

  describe('.get', () => {
    it('return entry', function () {
      this.timeout(support.TIMEOUT)

      let memberId = Buffer.from('memberId')
      let dataObjectId = Buffer.from('dataObjectId')
      return geth().then(([contract, account]) => {
        return contract.add(memberId, dataObjectId).then(didAdd => {
          let id = didAdd.id

          return contract.get(id).then(request => {
            assert(request instanceof Request)
            assert.deepEqual(request.id, id)
            assert.deepEqual(request.memberId.id, memberId)
            assert.deepEqual(request.dataObjectId.id, dataObjectId)
            assert.equal(request.origin, account)
            assert(request.createdAt instanceof Date)
          })
        })
      })
    })
  })

  describe('.getAll', () => {
    it('return all entries', function () {
      this.timeout(support.TIMEOUT)

      let memberId = Buffer.from('memberId')
      let dataObjectIdA = util.randomBuffer()
      let dataObjectIdB = util.randomBuffer()
      return geth().then(([contract, account]) => {
        return contract.add(memberId, dataObjectIdA).then(didAdd => {
          let idA = didAdd.dataObjectId
          assert.deepEqual(idA, dataObjectIdA)

          return contract.add(memberId, dataObjectIdB).then(didAdd => {
            let idB = didAdd.dataObjectId
            assert.deepEqual(idB, dataObjectIdB)

            return contract.getAll().then(didAddEventsList => {
              let foundIdA = _.find(didAddEventsList, i => _.isEqual(i.dataObjectId, idA))
              assert(!_.isEmpty(foundIdA))

              let foundIdB = _.find(didAddEventsList, i => _.isEqual(i.dataObjectId, idB))
              assert(!_.isEmpty(foundIdB))
            })
          })
        })
      })
    })
  })
})
