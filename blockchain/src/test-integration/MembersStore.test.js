// @flow

'use strict'

import _ from 'lodash'
import assert from 'assert'
import { describe, it } from 'mocha'

import * as support from './support'
import * as util from '../lib/util'
import {MembersContract} from '../storage/MembersContract'
import MembersStore from '../storage/MembersStore'

const geth = (): Promise<MembersStore> => {
  return support.geth((account, provider) => new MembersContract(account, provider)).then(([contract, account])=> {
    return new MembersStore(contract)
  })
}

describe('MembersStore', () => {
  describe('.getAll', () => {
    it('return all ids ever added', function () {
      this.timeout(support.TIMEOUT)

      let memberA = support.genMember(util.randomBuffer())
      let memberB = support.genMember(util.randomBuffer())

      return geth().then(store => {
        return store.update(memberA).then(() => {
          return store.update(memberB)
        }).then(() => {
          return store.getAll()
        }).then(members => {
          assert(_.find(members, id => memberA.id.equals(memberA.id)))
          assert(_.find(members, id => memberB.id.equals(memberB.id)))
        })
      })
    })
  })
})
