// @flow

import RequestId from './RequestId';
import MemberId from './MemberId';
import DataObjectId from './DataObjectId';
import proto from '../lib/proto';
import Timestamp from './Timestamp';

export default class StoredDataObjectRequest {
    id: RequestId;
    memberId: MemberId;
    dataObjectId: DataObjectId;
    createdAt: Timestamp;

    constructor(id: RequestId, memberId: MemberId, dataObjectId: DataObjectId, createdAt: Timestamp) {
        this.id = id;
        this.memberId = memberId;
        this.dataObjectId = dataObjectId;
        this.createdAt = createdAt;
    }

    toProto(): proto.StoredDataObjectRequest {
        return new proto.StoredDataObjectRequest()
            .setId(this.id.toProto())
            .setMemberId(this.memberId.toProto())
            .setDataObjectId(this.dataObjectId.toProto())
            .setCreatedAt(this.createdAt.toProto());
    }
}
