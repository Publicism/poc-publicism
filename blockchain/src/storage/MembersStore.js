// @flow

import _ from 'lodash';
import Promise from 'bluebird';

import { MembersContract } from './MembersContract';
import Member from '../models/Member';
import MemberId from '../models/MemberId';

export default class MembersStore {
    contract: MembersContract;

    constructor(contract: MembersContract) {
        this.contract = contract;
    }

    update(member: Member): Promise<Member> {
        return this.contract.update(member);
    }

    get(id: MemberId): Promise<Member> {
        return this.contract.get(id.id);
    }

    remove(id: MemberId): Promise<MemberId> {
        return this.contract.remove(id.id).then(returnedId => {
            return new MemberId(returnedId);
        });
    }

    getAll(): Promise<Array<Member>> {
        return this.contract.getAllIds().then(ids => {
            return Promise.all(_.map(ids, id => this.contract.get(id)));
        }).then(members => {
            return _.compact(members);
        });
    }
}
