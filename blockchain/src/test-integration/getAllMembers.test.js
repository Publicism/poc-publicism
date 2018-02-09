// @flow

'use strict';

import _ from 'lodash';
import assert from 'assert';
import { after, before, describe, it } from 'mocha';
import grpc from 'grpc';

import * as support from './support';
import configuration from '../settings/configuration';
import proto from '../lib/proto';
import util from '../lib/util';
import Empty from '../models/Empty';
import MembersList from '../models/MembersList';

describe('getAllMembers', () => {
    let server = null;

    before(() => {
        return support.startServer().then(s => {
            server = s;
        });
    });

    it('retrieves available Members', function (done) {
        this.timeout(support.TIMEOUT);

        configuration.grpcBinding().then(binding => {
            const client = new proto.Blockchain(binding, grpc.credentials.createInsecure());

            let memberA = support.genMember(util.randomBuffer());
            let memberB = support.genMember(util.randomBuffer());

            client.updateMember(memberA.toProto(), function () {
                client.updateMember(memberB.toProto(), function () {
                    let empty = new Empty();

                    client.getAllMembers(empty.toProto(), function (err, response) {
                        let members = MembersList.fromProto(response).list;

                        assert(_.find(members, id => memberA.id.equals(memberA.id)));
                        assert(_.find(members, id => memberB.id.equals(memberB.id)));

                        done();
                    });
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
