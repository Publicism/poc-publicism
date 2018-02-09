// @flow

import _ from 'lodash';

import type { DataObjectIdProto } from './DataObjectId';
import DataObjectId from './DataObjectId';
import type { MemberIdProto } from './MemberId';
import MemberId from './MemberId';

export type DataObjectNetworkInfoRequestProto = { dataObjectId: DataObjectIdProto, memberIds: Array<MemberIdProto> }

export default class DataObjectNetworkInfoRequest {
    dataObjectId: DataObjectId;
    memberIds: Array<MemberId>;

    constructor(dataObjectId: DataObjectId, memberIds: Array<MemberId>) {
        this.dataObjectId = dataObjectId;
        this.memberIds = memberIds;
    }

    static fromProto(raw: DataObjectNetworkInfoRequestProto): DataObjectNetworkInfoRequest {
        let dataObjectId = DataObjectId.fromProto(raw.dataObjectId);
        let memberIds = _.map(raw.memberIds, memberIdProto => MemberId.fromProto(memberIdProto));
        return new DataObjectNetworkInfoRequest(dataObjectId, memberIds);
    }
}
