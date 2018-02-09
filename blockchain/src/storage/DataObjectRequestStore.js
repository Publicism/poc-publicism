// @flow

import _ from 'lodash';
import Db from 'mongodb/lib/db';

import DataObjectId from '../models/DataObjectId';
import StoredDataObjectRequest from '../models/StoredDataObjectRequest';
import { DataObjectRequestHistoryContract } from './DataObjectRequestHistoryContract';
import RequestId from '../models/RequestId';
import MemberId from '../models/MemberId';
import Timestamp from '../models/Timestamp';
import DataObjectRequestsList from '../models/DataObjectRequestList';

const didAddToDataObjectRequest = (didAdd: Object): StoredDataObjectRequest => {
    let id = new RequestId(didAdd.id.toString());
    let memberId = new MemberId(didAdd.memberId);
    let dataObjectId = new DataObjectId(didAdd.dataObjectId);
    let createdAt = new Timestamp(didAdd.createdAt);

    return new StoredDataObjectRequest(id, memberId, dataObjectId, createdAt);
};

export default class DataObjectRequestStore {
    contract: DataObjectRequestHistoryContract;
    db: Db;

    constructor(contract: DataObjectRequestHistoryContract, db: Db) {
        this.contract = contract;
        this.db = db;
    }

    makeRequest(memberId: MemberId, dataObjectId: DataObjectId): Promise<StoredDataObjectRequest> {
        return this.contract.add(memberId.id, dataObjectId.id).then(didAdd => {
            return didAddToDataObjectRequest(didAdd);
        });
    }

    getDataObjectRequests(): Promise<DataObjectRequestsList> {
        return this.contract.getAll().then(didAddEventsList => {
            let list = _.map(didAddEventsList, didAddToDataObjectRequest);

            return new DataObjectRequestsList(list);
        });
    }
}
