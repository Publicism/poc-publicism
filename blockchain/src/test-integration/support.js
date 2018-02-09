// @flow

import grpc from 'grpc';
import Promise from 'bluebird';
import Web3 from 'web3';

import proto from '../lib/proto';
import settings from '../settings';
import configuration from '../settings/configuration';
import Member from '../models/Member';
import MemberId from '../models/MemberId';

export const TIMEOUT = 500000;

export function startServer(): Promise<grpc.Server> {
    let server = new grpc.Server();

    return configuration.blockchainController().then(blockchainController => {
        server.addService(proto.Blockchain.service, blockchainController.handlers());

        return settings.grpc(server).then(() => {
            server.start();

            return server;
        });
    });
}

export function stopServer(server: grpc.Server): Promise<grpc.Server> {
    let promisified = Promise.promisify(server.tryShutdown);

    return promisified().then(() => {
        return server;
    });
}

export function genMember(id: Buffer): Member {
    let name = 'm';
    let info = JSON.stringify({
        host: 'example.com',
        dmsport: '9999',
        paymentPort: '9998',
    });

    return new Member(new MemberId(id), name, info);
}

export type ContractBuilder<A> = (string, Web3.providers.HttpProvider) => A

export function geth<A>(builder: ContractBuilder<A>): Promise<[A, string]> {
    return configuration.web3().then(web3 => {
        const provider = web3.currentProvider;
        const account = web3.eth.accounts[0];
        const contract = builder(account, provider);

        return [contract, account];
    });
}
