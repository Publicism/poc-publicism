// @flow

'use strict';

import assert from 'assert';
import { describe, it } from 'mocha';
import * as support from './support';
import { DataObjectMemberOwnershipContract, DidAdd, Ownership } from '../storage/DataObjectMemberOwnershipContract';

const geth = (): Promise<[DataObjectMemberOwnershipContract, string]> => {
  return support.geth((account, provider) => new DataObjectMemberOwnershipContract(account, provider));
};

describe('DataObjectMemberOwnershipContract', () => {
  describe('.add', () => {
    it('add entry', function () {
      this.timeout(support.TIMEOUT);

      let memberId = Buffer.from('memberId');
      let dataObjectId = Buffer.from('dataObjectId');
      let dataObjectHash = Buffer.from('hash');
      let info = Buffer.from(JSON.stringify({
        type: 'html',
        name: 'name'
      })).toString();

      return geth().then(([contract, account]) => {
        return contract.add(memberId, dataObjectId, dataObjectHash, info);
      }).then(didAddEvent => {
        assert(didAddEvent instanceof DidAdd);
        assert.deepEqual(didAddEvent.memberId, memberId);
        assert.deepEqual(didAddEvent.dataObjectId, dataObjectId);
        assert.deepEqual(didAddEvent.dataObjectHash, dataObjectHash);
      });
    });
  });

  describe('.get', () => {
    it('return entry', function () {
      this.timeout(support.TIMEOUT);

      let memberId = Buffer.from('memberId');
      let dataObjectId = Buffer.from('dataObjectId');
      let dataObjectHash = Buffer.from('hash');
      let info = Buffer.from(JSON.stringify({
        type: 'html',
        name: 'name'
      })).toString();

      return geth().then(([contract, account]) => {
        return contract.add(memberId, dataObjectId, dataObjectHash, info).then(didAddEvent => {
          let id = didAddEvent.id;
          return contract.get(id).then(ownership => {
            assert(ownership instanceof Ownership);
            assert.deepEqual(ownership.id, id);
            assert.deepEqual(ownership.memberId.id, memberId);
            assert.deepEqual(ownership.dataObjectId.id, dataObjectId);
            assert.deepEqual(ownership.dataObjectHash, dataObjectHash);
            assert.equal(ownership.origin, account);
            assert(ownership.createdAt instanceof Date);
            assert(ownership.updatedAt instanceof Date);
          });
        });
      });
    });
  });

  describe('.getMy', () => {
    it('return entries', function () {
      this.timeout(support.TIMEOUT);

      let memberId = Buffer.from('memberId');
      let dataObjectId = Buffer.from('dataObjectId');
      let dataObjectHash = Buffer.from('hash');
      let info = Buffer.from(JSON.stringify({
        type: 'html',
        name: 'name'
      })).toString();

      return geth().then(([contract, account]) => {
        return contract.add(memberId, dataObjectId, dataObjectHash, info).then(didAddEvent => {
          let id = didAddEvent.id;

          return contract.get(id).then(ownership => {
            assert(ownership instanceof Ownership);
            assert.deepEqual(ownership.id, id);
            assert.deepEqual(ownership.memberId.id, memberId);
            assert.deepEqual(ownership.dataObjectId.id, dataObjectId);
            assert.deepEqual(ownership.dataObjectHash, dataObjectHash);
            assert.equal(ownership.origin, account);
            assert(ownership.createdAt instanceof Date);
            assert(ownership.updatedAt instanceof Date);
          });
        });
      });
    });
  });
});
