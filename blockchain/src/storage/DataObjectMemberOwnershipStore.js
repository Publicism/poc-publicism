// @flow

import _ from 'lodash';
import Promise from 'bluebird';
import Db from 'mongodb/lib/db';

import { DataObjectMemberOwnershipContract, Ownership } from './DataObjectMemberOwnershipContract';
import DataObject from '../models/DataObject';
import StoredDataObject from '../models/StoredDataObject';
import DataObjectsList from '../models/DataObjectList';
import DataObjectUpdate from '../models/DataObjectUpdate';
import DataObjectNetworkInfo from '../models/DataObjectNetworkInfo';
import DataObjectId from '../models/DataObjectId';
import MemberId from '../models/MemberId';
import DataObjectNetworkInfoItem from '../models/DataObjectNetworkInfoItem';

const ownershipToStoredDataObject = (ownership: Ownership) => {
    let dataObjectInfo = JSON.parse(ownership.dataObjectInfo);

    return new StoredDataObject(ownership.dataObjectId, ownership.dataObjectHash, dataObjectInfo, ownership.createdAt, ownership.updatedAt);
};

export class DataObjectMemberOwnershipStore {
    contract: DataObjectMemberOwnershipContract;
    db: Db;

    constructor(contract: DataObjectMemberOwnershipContract, db: Db) {
        this.contract = contract;
        this.db = db;
    }

    add(memberId: MemberId, dataObject: DataObject): Promise<StoredDataObject> {
        let dataObjectId = dataObject.id.id;
        let dataObjectInfo = JSON.stringify(dataObject.info);

        return this.contract.add(memberId.id, dataObjectId, dataObject.hash, dataObjectInfo).then(didAddEvent => {
            return this.contract.get(didAddEvent.id);
        }).then((ownership: Ownership) => {
            return ownershipToStoredDataObject(ownership);
        });
    }

    update(update: DataObjectUpdate): Promise<StoredDataObject> {
        let dataObjectId = update.id.id;
        let memberId = update.memberId.id;
        let dataObjectInfo = JSON.stringify(update.info);

        return this.contract.add(memberId, dataObjectId, update.hash, dataObjectInfo).then(didAddEvent => {
            return this.contract.get(didAddEvent.id);
        }).then((ownership: Ownership) => {
            return ownershipToStoredDataObject(ownership);
        });
    }

    getMy(memberId: MemberId): Promise<DataObjectsList> {
        return this.contract.getByMemberId(memberId.id).then((ownerships: Array<Ownership>) => {
            let storedDataObjects = _.map(ownerships, ownershipToStoredDataObject);

            return new DataObjectsList(storedDataObjects);
        });
    }

    getDataObjectNetworkInfo(memberIds: Array<MemberId>, dataObjectId: DataObjectId): Promise<DataObjectNetworkInfo> {
        return this.contract.getByDataObjectId(dataObjectId.id).then(ownerships => {
            let list = _.map(ownerships, ownership => {
                let storedDataObject = ownershipToStoredDataObject(ownership);

                return new DataObjectNetworkInfoItem(ownership.memberId, storedDataObject);
            });

            return new DataObjectNetworkInfo(list);
        });
    }
}
