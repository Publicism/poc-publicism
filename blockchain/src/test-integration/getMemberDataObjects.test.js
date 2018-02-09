// @flow

'use strict';

import _ from 'lodash';
import util from '../lib/util';
import assert from 'assert';
import { after, before, describe, it } from 'mocha';
import * as support from './support';
import proto from '../lib/proto';
import grpc from 'grpc';
import configuration from '../settings/configuration';


describe('getMemberDataObjects', () => {
  let server = null;

  before(() => {
    return support.startServer().then(s => {
      server = s;
    });
  });

  it('return DataObjectsList', function(done) {
    this.timeout(support.TIMEOUT);

    configuration.grpcBinding().then(binding => {
      const client = new proto.Blockchain(binding, grpc.credentials.createInsecure());

      let dataObjectId = util.randomBuffer();
      let hash = util.randomBuffer();
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
        client.getMemberDataObjects({id: memberId}, (err, response) => {
          assert(!_.isEmpty(response.dataObjects));

          let found = _.filter(response.dataObjects, dataObject => _.isEqual(dataObject.id.id, dataObjectId) && _.isEqual(dataObject.hash, hash));

          assert(!_.isEmpty(found));

          done();
        });
      });
    });
  });

/*  it('return updated DataObjects', function(done) {
    this.timeout(support.TIMEOUT);

    configuration.grpcBinding().then(binding => {
      const client = new proto.Blockchain(binding, grpc.credentials.createInsecure());

      let dataObjectId = util.randomBuffer();
      let hash = util.randomBuffer();
      let updatedHash = util.randomBuffer();
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
        client.addDataObject({
          memberId: {
            id: memberId
          },
          dataObject: {
            id: {
              id: dataObjectId
            },
            hash: updatedHash,
            info: info
          }
        }, () => {
          client.getMemberDataObjects({}, (err, response) => {
            let ids = _.map(response.dataObjects, dataObject => dataObject.id.id.toString());
            let uniqueIds = _.uniq(ids);

            assert.equal(ids.length, uniqueIds.length);

            done();
          });
        });
      });
    });
  });*/

  after(() => {
    if (server) {
      return support.stopServer(server);
    } else {
      return null;
    }
  });

});
