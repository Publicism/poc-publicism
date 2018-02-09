// @flow

import type { DataObjectIdProto } from './DataObjectId';
import DataObjectId from './DataObjectId';

export type DataObjectProto = {
    id: DataObjectIdProto;
    hash: Buffer;
    info: string;
}

export default class DataObject {
    id: DataObjectId;
    hash: Buffer;
    info: string;

    constructor(id: DataObjectId, hash: Buffer, info: string) {
        this.id = id;
        this.hash = hash;
        this.info = info;
    }

    static fromProto(raw: DataObjectProto): DataObject {
        let id = DataObjectId.fromProto(raw.id);
        let hash = raw.hash;
        let info = raw.info;

        return new DataObject(id, hash, info);
    }

    toProto(): DataObjectProto {
        return {
            id: this.id.toProto(),
            hash: this.hash,
            info: this.info
        };
    }
}
