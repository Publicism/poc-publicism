// @flow

import Promise from "bluebird";
import DataObject from "../models/DataObject";
import StoredDataObject from "../models/StoredDataObject";
import {DataObjectMemberOwnershipStore} from "../storage/DataObjectMemberOwnershipStore";
import DataObjectsList from "../models/DataObjectList";
import DataObjectUpdate from "../models/DataObjectUpdate";
import DataObjectId from "../models/DataObjectId";
import DataObjectNetworkInfo from "../models/DataObjectNetworkInfo";
import MemberId from "../models/MemberId";

export default class DataObjectService {
  ownershipStore: DataObjectMemberOwnershipStore;

  constructor(ownershipStore: DataObjectMemberOwnershipStore) {
    this.ownershipStore = ownershipStore;
  }

  add(memberId: MemberId, dataObject: DataObject): Promise<StoredDataObject> {
    return this.ownershipStore.add(memberId, dataObject);
  }

  update(update: DataObjectUpdate): Promise<StoredDataObject> {
    return this.ownershipStore.update(update);
  }

  getMy(memberId: MemberId): Promise<DataObjectsList> {
    return this.ownershipStore.getMy(memberId);
  }

  getDataObjectNetworkInfo(memberIds: Array<MemberId>, dataObjectId: DataObjectId): Promise<DataObjectNetworkInfo> {
    return this.ownershipStore.getDataObjectNetworkInfo(memberIds, dataObjectId);
  }
}
