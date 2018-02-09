// @flow

import MembersStore from "../storage/MembersStore";
import Member from "../models/Member";
import MemberId from "../models/MemberId";

export default class MembersService {
  membersStore: MembersStore;

  constructor(membersStore: MembersStore) {
    this.membersStore = membersStore;
  }

  update(member: Member): Promise<Member> {
    return this.membersStore.update(member);
  }

  get(id: MemberId): Promise<Member> {
    return this.membersStore.get(id);
  }

  remove(id: Buffer): Promise<Buffer> {
    return this.membersStore.remove(id);
  }

  getAll(): Promise<Array<Member>> {
    return this.membersStore.getAll();
  }
}
