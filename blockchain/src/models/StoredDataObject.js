// @flow

import DataObjectId from './DataObjectId';
import Timestamp from './Timestamp';
import proto from '../lib/proto';

export default class StoredDataObject {
    id: DataObjectId;
    hash: Buffer;
    info: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;

    constructor(id: DataObjectId, hash: Buffer, info: string, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.hash = hash;
        this.info = info;
        this.createdAt = new Timestamp(createdAt);
        this.updatedAt = new Timestamp(updatedAt);
    }

    static fromProto(raw: Object): StoredDataObject {
        let dataObjectId = DataObjectId.fromProto(raw.id);
        let hash = raw.hash;
        let info = raw.info;
        let createdAt = Timestamp.fromProto(raw.createdAt).toDate();
        let updatedAt = Timestamp.fromProto(raw.updatedAt).toDate();

        return new StoredDataObject(dataObjectId, hash, info, createdAt, updatedAt);
    }

    toProto() {
        return new proto.StoredDataObject()
            .setId(this.id.toProto())
            .setHash(this.hash)
            .setInfo(this.info)
            .setCreatedAt(this.createdAt.toProto())
            .setUpdatedAt(this.updatedAt.toProto());
    }
}
