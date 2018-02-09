// @flow

'use strict';

import assert from 'assert';
import { after, before, describe, it } from 'mocha';
import grpc from 'grpc';

import * as support from './support';
import configuration from '../settings/configuration';
import proto from '../lib/proto';

describe('addDataObject', () => {
    let server = null;

    before(() => {
        return support.startServer().then(s => {
            server = s;
        });
    });

    it('return StoredDataObject', function (done) {
        this.timeout(support.TIMEOUT);

        configuration.grpcBinding().then(binding => {
            const client = new proto.Blockchain(binding, grpc.credentials.createInsecure());

            let dataObjectId = Buffer.from('1');
            let hash = Buffer.from('2');
            let memberId = Buffer.from('1');
            let info = Buffer.from(JSON.stringify({
                type: 'html',
                name: 'name',
                price: 1,
                permissions: ['1', '2']
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
            }, (err, response) => {
                console.log(err, response);
                assert.deepEqual(response.id.id, dataObjectId);
                assert.deepEqual(response.hash, hash);

                done();
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
