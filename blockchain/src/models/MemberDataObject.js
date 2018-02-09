// @flow

import type { DataObjectProto } from './DataObject';
import DataObject from './DataObject';
import type { MemberIdProto } from './MemberId';
import MemberId from './MemberId';

export type MemberDataObjectProto = {
    memberId: MemberIdProto;
    dataObject: DataObjectProto;
}

export default class MemberDataObject {
    memberId: MemberId;
    dataObject: DataObject;

    constructor(memberId: MemberId, dataObject: DataObject) {
        this.memberId = memberId;
        this.dataObject = dataObject;
    }

    static fromProto(raw: MemberDataObjectProto): MemberDataObject {
        let memberId = MemberId.fromProto(raw.memberId);
        let dataObject = DataObject.fromProto(raw.dataObject);

        return new MemberDataObject(memberId, dataObject);
    }
}
