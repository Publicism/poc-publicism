// @flow

import proto from '../lib/proto';

export type DataObjectIdProto = {
    id: Buffer;
}

export default class DataObjectId {
    id: Buffer;

    constructor(id: Buffer) {
        this.id = id;
    }

    static fromProto(raw: DataObjectIdProto): DataObjectId {
        return new DataObjectId(raw.id);
    }

    toProto(): proto.DataObjectId {
        return new proto.DataObjectId().setId(this.id);
    }
}
