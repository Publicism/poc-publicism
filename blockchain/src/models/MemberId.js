// @flow

import proto from '../lib/proto';

export type MemberIdProto = { id: Buffer }

export default class MemberId {
    id: Buffer;

    constructor(id: Buffer) {
        this.id = id;
    }

    static fromProto(raw: MemberIdProto): MemberId {
        return new MemberId(raw.id);
    }

    toProto(): proto.MemberId {
        return new proto.MemberId()
            .setId(this.id);
    }

    equals(other: MemberId | any) {
        if (other instanceof MemberId) {
            return this.id.equals(other.id);
        } else {
            return false;
        }
    }
}
