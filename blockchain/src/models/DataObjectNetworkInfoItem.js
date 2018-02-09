// @flow

import proto from '../lib/proto';
import MemberId from './MemberId';
import StoredDataObject from './StoredDataObject';

export default class DataObjectNetworkInfoItem {
    memberId: MemberId;
    available: StoredDataObject;

    constructor(memberId: MemberId, available: StoredDataObject) {
        this.memberId = memberId;
        this.available = available;
    }

    static fromProto(raw: Object): DataObjectNetworkInfoItem {
        let memberId = MemberId.fromProto(raw.memberId);
        let available = StoredDataObject.fromProto(raw.available);

        return new DataObjectNetworkInfoItem(memberId, available);
    }

    toProto(): proto.DataObjectNetworkInfoItem {
        return new proto.DataObjectNetworkInfoItem()
            .setMemberId(this.memberId.toProto())
            .setAvailable(this.available.toProto());
    }
}
