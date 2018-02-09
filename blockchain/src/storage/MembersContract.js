// @flow

import contract from 'truffle-contract';
import Promise from 'bluebird';
import _ from 'lodash';
import Web3 from 'web3';

import util from '../lib/util';
import data from '../../build/contracts/Members.json';
import MemberId from '../models/MemberId';
import Member from '../models/Member';

export class MembersContract {
    account: string;
    contract: contract;

    constructor(account: string, provider: Web3.providers.HttpProvider) {
        this.account = account;
        this.contract = contract(data);
        this.contract.setProvider(provider);
    }

    update(member: Member): Promise<Member> {
        let idHexString = util.padHex(member.id.id);
        let name = member.name;
        let info = JSON.stringify(member.info);

        return this.contract.deployed().then(instance => {
            return instance.update(idHexString, name, info, {
                from: this.account,
                gas: 5000000
            }).then(({logs}) => {
                let didUpdateLog = _.find(logs, entry => entry.args && entry.args.id === idHexString);

                if (didUpdateLog) {
                    return member;
                } else {
                    throw new Error('Can not get DidUpdate event');
                }
            });
        });
    }

    get(id: Buffer): Promise<?Member> {
        let idHexString = util.padHex(id);

        return this.contract.deployed().then(instance => {
            return instance.get(idHexString);
        }).then(rawMember => {
            let name = rawMember[0];
            let rawInfo = rawMember[1];

            if (name && rawInfo) {
                let info = JSON.parse(rawInfo);

                return new Member(new MemberId(id), name, info);
            } else {
                return null;
            }
        });
    }

    remove(id: Buffer): Promise<Buffer> {
        let idHexString = util.padHex(id);

        return this.contract.deployed().then(instance => {
            return instance.remove(idHexString, {
                from: this.account,
                gas: 400000
            }).then(({logs}) => {
                let didRemoveLog = _.find(logs, entry => entry.args && entry.args.id === idHexString);

                if (didRemoveLog) {
                    return id;
                } else {
                    throw new Error('Can not get DidRemove event');
                }
            });
        });
    }

    getAllIds(): Promise<Array<Buffer>> {
        let fromBlock = 0;

        return this.contract.deployed().then(instance => {
            return new Promise((resolve, reject) => {
                instance.DidUpdate({}, {
                    fromBlock: fromBlock,
                    toBlock: 'latest'
                }).get((err, events) => {
                    if (err) {
                        reject(err);
                    } else {
                        let ids = _.uniqBy(_.map(events, e => util.unpadHex(e.args.id)), id => id.toString());

                        resolve(ids);
                    }
                });
            });
        });
    }
}
