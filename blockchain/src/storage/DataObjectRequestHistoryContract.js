// @flow

import contract from "truffle-contract";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import _ from "lodash";

import data from "../../build/contracts/DataObjectRequestHistory.json";
import util from "../lib/util";
import MemberId from "../models/MemberId";
import DataObjectId from "../models/DataObjectId";
import RequestId from "../models/RequestId";

export class Request {
  id: RequestId;
  memberId: MemberId;
  dataObjectId: DataObjectId;
  origin: string;
  createdAt: Date;

  constructor(id: RequestId, memberId: MemberId, dataObjectId: DataObjectId, origin: string, createdAt: Date) {
    this.id = id;
    this.memberId = memberId;
    this.dataObjectId = dataObjectId;
    this.origin = origin;
    this.createdAt = createdAt;
  }
}

export class DidAdd {
  id: BigNumber;
  memberId: Buffer;
  dataObjectId: Buffer;
  origin: string;
  createdAt: Date;

  static fromLogEvent(logEvent: Object): DidAdd {
    let id = logEvent.args.id;
    let memberId = util.unpadHex(logEvent.args.memberId);
    let dataObjectId = util.unpadHex(logEvent.args.dataObjectId);
    let origin = logEvent.args.origin;
    let createdAt = util.ethereumTimestampToDate(logEvent.args.createdAt.toNumber());

    return new DidAdd(id, memberId, dataObjectId, origin, createdAt)
  }

  constructor(id: BigNumber, memberId: Buffer, dataObjectId: Buffer, origin: string, createdAt: Date) {
    this.id = id;
    this.memberId = memberId;
    this.dataObjectId = dataObjectId;
    this.origin = origin;
    this.createdAt = createdAt;
  }
}

export class DataObjectRequestHistoryContract {
  account: string;
  contract: Object;

  constructor(account: string, provider: Web3.providers.HttpProvider) {
    this.account = account;
    this.contract = contract(data);
    this.contract.setProvider(provider);
  }

  add(memberId: Buffer, dataObjectId: Buffer): Promise<DidAdd> {
    let memberIdHexString = util.padHex(memberId);
    let dataObjectIdHexString = util.padHex(dataObjectId);

    return this.contract.deployed().then(instance => {
      return instance.add(memberIdHexString, dataObjectIdHexString, {
        from: this.account,
        gas: 200000
      }).then(({tx, receipt, logs}) => {
        let didAddLog = _.find(logs, entry => entry.args && entry.args.memberId === memberIdHexString && entry.args.dataObjectId === dataObjectIdHexString);

        if (didAddLog) {
          return DidAdd.fromLogEvent(didAddLog)
        } else {
          return null
        }
      })
    })
  }

  get(id: string | BigNumber): Promise<Request> {
    return this.contract.deployed().then(instance => {
      return instance.get(id);
    }).then(raw => {
      let memberId = new MemberId(util.unpadHex(raw[0]));
      let dataObjectId = new DataObjectId(util.unpadHex(raw[1]));
      let origin = raw[2];
      let createdAt = util.ethereumTimestampToDate(raw[3].toNumber());

      return new Request(new BigNumber(id), memberId, dataObjectId, origin, createdAt);
    })
  }

  didAddEvents(instance: Object, filter: Object, fromBlock: number = 0): Promise<Array<Object>> {
    return new Promise((resolve, reject) => {
      instance.DidAdd(filter, {fromBlock: fromBlock, toBlock: 'latest'}).get((err, events) => {
        if (err) {
          reject(err);
        } else {
          resolve(events);
        }
      })
    })
  }

  getAll(): Promise<Array<DidAdd>> {
    return this.contract.deployed().then(instance => {
      return this.didAddEvents(instance, {});
    }).then(didAddEvents => {
      return _.map(didAddEvents, event => DidAdd.fromLogEvent(event));
    })
  }
}
