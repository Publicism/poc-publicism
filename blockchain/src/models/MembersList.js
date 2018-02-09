// @flow

import _ from 'lodash';

import type { MemberProto } from './Member';
import Member from './Member';

export type MembersListProto = {
    list: Array<MemberProto>;
}

export default class MembersList {
    list: Array<Member>;

    constructor(list: Array<Member>) {
        this.list = list;
    }

    static fromProto(raw: MembersListProto): MembersList {
        let members = _.map(raw.list, memberProto => Member.fromProto(memberProto));

        return new MembersList(members);
    }

    toProto(): MembersListProto {
        let listProto = _.map(this.list, member => member.toProto());

        return {
            list: listProto
        };
    }
}
