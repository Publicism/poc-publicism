// @flow

import type { DataObjectIdProto } from './DataObjectId';
import DataObjectId from './DataObjectId';
import type { MemberIdProto } from './MemberId';
import MemberId from './MemberId';

export type DataObjectUpdateProto = {
    id: DataObjectIdProto;
    hash: Buffer;
    memberId: MemberIdProto;
    info: string;
}

export default class DataObjectUpdate {
    id: DataObjectId;
    hash: Buffer;
    memberId: MemberId;
    info: string;

    constructor(id: DataObjectId, hash: Buffer, memberId: MemberId, info: string) {
        this.id = id;
        this.hash = hash;
        this.memberId = memberId;
        this.info = info;
    }

    static fromProto(raw: DataObjectUpdateProto): DataObjectUpdate {
        let id = DataObjectId.fromProto(raw.id);
        let hash = raw.hash;
        let memberId = MemberId.fromProto(raw.memberId);
        let info = raw.info;

        return new DataObjectUpdate(id, hash, memberId, info);
    }
}
