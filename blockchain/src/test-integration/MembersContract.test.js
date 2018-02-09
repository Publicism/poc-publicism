// @flow

'use strict'

import _ from 'lodash'
import assert from 'assert'
import { describe, it } from 'mocha'

import * as support from './support'
import {MembersContract} from '../storage/MembersContract'
import * as util from '../lib/util'

const geth = (): Promise<[MembersContract, string]> => {
  return support.geth((account, provider) => new MembersContract(account, provider))
}

describe('MembersContract', () => {
  describe('.update', () => {
    it('add entry', function () {
      this.timeout(support.TIMEOUT)

      let member = support.genMember(util.randomBuffer())

      return geth().then(([contract, account]) => {
        return contract.update(member).then(returnedMember => {
          assert.deepEqual(member.id, returnedMember.id)
          assert.deepEqual(member.name, returnedMember.name)
          assert.deepEqual(member.info, returnedMember.info)
        })
      })
    })
  })

  describe('.get', () => {
    it('retrieve entry', function () {
      this.timeout(support.TIMEOUT)

      let member = support.genMember(util.randomBuffer())
      return geth().then(([contract, account]) => {
        return contract.update(member).then(() => {
          return contract.get(member.id.id)
        }).then(returnedMember => {
          assert.deepEqual(member.id, returnedMember.id)
          assert.deepEqual(member.name, returnedMember.name)
          assert.deepEqual(member.info, returnedMember.info)
        })
      })
    })
  })

  describe('.remove', () => {
    it('removes entry', function () {
      this.timeout(support.TIMEOUT)

      let member = support.genMember(util.randomBuffer())

      return geth().then(([contract, account]) => {
        return contract.update(member).then(() => {
          return contract.remove(member.id.id)
        }).then(() => {
          return contract.get(member.id.id)
        }).then(returnedMember => {
          assert.equal(returnedMember, null)
        })
      })
    })
  })

  describe('.getAllIds', () => {
    it('return all ids ever added', function () {
      this.timeout(support.TIMEOUT)

      let memberA = support.genMember(util.randomBuffer())
      let memberB = support.genMember(util.randomBuffer())

      return geth().then(([contract, account]) => {
        return contract.update(memberA).then(() => {
          return contract.update(memberB)
        }).then(() => {
          return contract.getAllIds()
        }).then(ids => {
          assert(_.find(ids, id => memberA.id.id.equals(id)))
          assert(_.find(ids, id => memberB.id.id.equals(id)))
        })
      })
    })
  })
})
