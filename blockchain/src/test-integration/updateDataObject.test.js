// @flow

import _ from 'lodash';
import assert from 'assert';
import { after, before, describe, it } from 'mocha';
import * as support from './support';
import proto from '../lib/proto';
import grpc from 'grpc';
import configuration from '../settings/configuration';
import * as util from '../lib/util';

describe('updateDataObject', () => {
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
      let hashUpdated = Buffer.from('3');
      let memberId = util.randomBuffer();
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
        setTimeout(() => {
          client.updateDataObject({
            id: {
              id: dataObjectId
            },
            hash: hashUpdated,
            memberId: {
              id: memberId
            },
            info: info
          }, (err, response) => {
            assert.deepEqual(response.id.id, dataObjectId);
            assert.deepEqual(response.hash, hashUpdated);

            client.getMemberDataObjects({id: memberId}, (err, response) => {
               assert(!_.isEmpty(response.dataObjects));

               let found = _.filter(response.dataObjects, dataObject => _.isEqual(dataObject.id.id, dataObjectId));

               assert.equal(found.length, 1);
               assert.deepEqual(found[0].hash, hashUpdated);

               done();
            });
          });
        }, 1000);
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
