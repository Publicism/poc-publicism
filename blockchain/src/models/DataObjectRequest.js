// @flow

import type { DataObjectIdProto } from './DataObjectId';
import DataObjectId from './DataObjectId';
import type { MemberIdProto } from './MemberId';
import MemberId from './MemberId';

export type DataObjectRequestProto = { dataObjectId: DataObjectIdProto, memberId: MemberIdProto }

export default class DataObjectRequest {
    dataObjectId: DataObjectId;
    memberId: MemberId;

    constructor(dataObjectId: DataObjectId, memberId: MemberId) {
        this.dataObjectId = dataObjectId;
        this.memberId = memberId;
    }

    static fromProto(raw: DataObjectRequestProto): DataObjectRequest {
        let dataObjectId = DataObjectId.fromProto(raw.dataObjectId);
        let memberId = MemberId.fromProto(raw.memberId);
        return new DataObjectRequest(dataObjectId, memberId);
    }
}
