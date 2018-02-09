// @flow

import proto from '../lib/proto';

export default class RequestId {
    id: string;

    constructor(id: string) {
        this.id = id;
    }

    toProto(): proto.RequestId {
        return new proto.RequestId()
            .setId(Buffer.from(this.id));
    }
}
