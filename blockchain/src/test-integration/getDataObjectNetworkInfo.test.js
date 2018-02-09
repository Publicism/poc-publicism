// @flow

'use strict';

import _ from 'lodash';
import assert from 'assert';
import { after, before, describe, it } from 'mocha';
import * as support from './support';
import proto from '../lib/proto';
import grpc from 'grpc';
import DataObjectNetworkInfo from '../models/DataObjectNetworkInfo';
import configuration from '../settings/configuration';

describe('getDataObjectNetworkInfo', () => {
  let server = null;

  before(() => {
    return support.startServer().then(s => {
      server = s;
    });
  });

  it('return StoredDataObject', function(done) {
    this.timeout(support.TIMEOUT);

    configuration.grpcBinding().then(binding => {
      const client = new proto.Blockchain(binding, grpc.credentials.createInsecure());

      let dataObjectId = Buffer.from('1');
      let hash = Buffer.from('2');
      let memberId = Buffer.from('BIG_MEMBER');
      let info = Buffer.from(JSON.stringify({
        type: 'html',
        name: 'name'
      })).toString();

      client.addDataObject({
        memberId: {
          id: memberId
        },
        dataObject: {
          id: {
            id: dataObjectId
          },
          hash: hash,
          info: info
        }
      }, () => {
        client.getDataObjectNetworkInfo({
          dataObjectId: {
            id: dataObjectId
          },
          memberIds: [
            {
              id: memberId
            }
          ]
        }, (err, response) => {
          let dataObjectNetworkInfo = DataObjectNetworkInfo.fromProto(response);

          assert(!_.isEmpty(dataObjectNetworkInfo.list));

          let element = dataObjectNetworkInfo.list[0];

          assert.deepEqual(element.available.id.id, dataObjectId);
          assert.deepEqual(element.available.hash, hash);

          done();
        });
      });
    });
  });

  after(() => {
    if (server) {
      return support.stopServer(server);
    } else {
      return null;
    }
  });

});
