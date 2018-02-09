// @flow

import contract from 'truffle-contract';
import Promise from 'bluebird';
import Web3 from 'web3';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import util from '../lib/util';
import data from '../../build/contracts/DataObjectMemberOwnerships.json';
import DataObjectId from '../models/DataObjectId';
import MemberId from '../models/MemberId';

export class Ownership {
    id: BigNumber;
    memberId: MemberId;
    dataObjectId: DataObjectId;
    dataObjectHash: Buffer;
    dataObjectInfo: string;
    origin: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(id: BigNumber, memberId: MemberId, dataObjectId: DataObjectId, dataObjectHash: Buffer, dataObjectInfo: string, origin: string, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.memberId = memberId;
        this.dataObjectId = dataObjectId;
        this.dataObjectHash = dataObjectHash;
        this.dataObjectInfo = dataObjectInfo;
        this.origin = origin;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class DidAdd {
    id: BigNumber;
    origin: string;
    memberId: Buffer;
    dataObjectId: Buffer;
    dataObjectHash: Buffer;
    dataObjectInfo: string;

    constructor(id: BigNumber, origin: string, memberId: Buffer, dataObjectId: Buffer, dataObjectHash: Buffer, dataObjectInfo: string) {
        this.id = id;
        this.origin = origin;
        this.memberId = memberId;
        this.dataObjectId = dataObjectId;
        this.dataObjectHash = dataObjectHash;
        this.dataObjectInfo = dataObjectInfo;
    }

    static fromLogEvent(logEvent: object): DidAdd {
        let id = logEvent.args.id;
        let origin = logEvent.args.origin;
        let memberId = util.unpadHex(logEvent.args.memberId);
        let dataObjectId = util.unpadHex(logEvent.args.dataObjectId);
        let dataObjectHash = util.unpadHex(logEvent.args.dataObjectHash);
        let dataObjectInfo = logEvent.args.dataObjectInfo;

        return new DidAdd(id, origin, memberId, dataObjectId, dataObjectHash, dataObjectInfo);
    }
}

export class DataObjectMemberOwnershipContract {
    constructor(account: string, provider: Web3.providers.HttpProvider) {
        this.account = account;
        this.contract = contract(data);
        this.contract.setProvider(provider);

        this.didAddEventsToOwnerships = this.didAddEventsToOwnerships.bind(this);
        this.compactifyOwnerships = this.compactifyOwnerships.bind(this);
    }

    /**
     * Returns id of the added record.
     */
    add(memberId: Buffer, dataObjectId: Buffer, dataObjectHash: Buffer, dataObjectInfo: string): Promise<DidAdd> {
        let memberIdHexString = util.padHex(memberId);
        let dataObjectIdHexString = util.padHex(dataObjectId);
        let dataObjectHashHexString = util.padHex(dataObjectHash);

        return this.contract.deployed().then(instance => {
            return instance.add(memberIdHexString, dataObjectIdHexString, dataObjectHashHexString, dataObjectInfo, {
                from: this.account,
                gas: 400000
            }).then(({logs}) => {
                let didAddLog = _.find(logs, entry => entry.args && entry.args.memberId === memberIdHexString && entry.args.dataObjectId === dataObjectIdHexString);

                if (didAddLog) {
                    return DidAdd.fromLogEvent(didAddLog);
                } else {
                    return null;
                }
            });
        });
    }

    get(id: string | BigNumber): Promise<Ownership> {
        return this.contract.deployed().then(instance => {
            return instance.get(id);
        }).then(rawOwnership => {
            let memberId = new MemberId(util.unpadHex(rawOwnership[0]));
            let dataObjectId = new DataObjectId(util.unpadHex(rawOwnership[1]));
            let dataObjectHash = util.unpadHex(rawOwnership[2]);
            let dataObjectInfo = rawOwnership[3];
            let origin = rawOwnership[4];
            let createdAt = util.ethereumTimestampToDate(rawOwnership[5].toNumber());
            let updatedAt = util.ethereumTimestampToDate(rawOwnership[6].toNumber());

            return new Ownership(new BigNumber(id), memberId, dataObjectId, dataObjectHash, dataObjectInfo, origin, createdAt, updatedAt);
        });
    }

    didAddEvents(instance: Object, filter: Object, fromBlock: number = 0): Promise<Array<Object>> {
        return new Promise((resolve, reject) => {
            instance.DidAdd(filter, {
                fromBlock: fromBlock,
                toBlock: 'latest'
            }).get((err, events) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(events);
                }
            });
        });
    }

    didAddEventsToOwnerships(didAddEvents: Array<Object>): Promise {
        let ids = _.map(didAddEvents, event => event.args.id);

        return Promise.all(_.map(ids, id => this.get(id)));
    }

    compactifyOwnerships(ownerships: Array<Ownership>): Array<Ownership> {
        let intermediate = {};

        _.forEach(ownerships, o => {
            let id = o.dataObjectId.id;
            let existing = intermediate[id];

            if (existing) {
                if (existing.createdAt < o.createdAt) {
                    intermediate[id] = o;
                }
            } else {
                intermediate[id] = o;
            }
        });

        return _.values(intermediate);
    }

    getByDataObjectId(dataObjectId: Buffer): Promise<Array<Ownership>> {
        return this.contract.deployed().then(instance => {
            return this.didAddEvents(instance, {
                dataObjectId: util.toHex(util.padStart(dataObjectId))
            });
        }).then(this.didAddEventsToOwnerships).then(this.compactifyOwnerships);
    }

    getByMemberId(memberId: Buffer): Promise<Array<Ownership>> {
        return this.contract.deployed().then(instance => {
            return this.didAddEvents(instance, {
                memberId: util.toHex(util.padStart(memberId))
            });
        }).then(this.didAddEventsToOwnerships).then(this.compactifyOwnerships);
    }
}
