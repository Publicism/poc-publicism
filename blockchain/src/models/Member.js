// @flow

import type { MemberIdProto } from './MemberId';
import MemberId from './MemberId';

export type MemberProto = {
    id: MemberIdProto;
    name: string;
    info: string;
}

export default class Member {
    id: MemberId;
    name: string;
    info: string;

    constructor(id: MemberId, name: string, info: string) {
        this.id = id;
        this.name = name;
        this.info = info;
    }

    static fromProto(raw: MemberProto): Member {
        let memberId = MemberId.fromProto(raw.id);
        let name = raw.name;
        let info = raw.info;

        return new Member(memberId, name, info);
    }

    toProto(): MemberProto {
        return {
            id: this.id.toProto(),
            name: this.name,
            info: this.info
        };
    }
}
