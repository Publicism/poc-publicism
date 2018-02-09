// @flow

import DataObjectService from '../services/DataObjectService';
import Empty, { EmptyProto } from '../models/Empty';
import DataObjectRequestService from '../services/DataObjectRequestService';
import DataObjectUpdate, { DataObjectUpdateProto } from '../models/DataObjectUpdate';
import MemberDataObject, { MemberDataObjectProto } from '../models/MemberDataObject';
import MemberId, { MemberIdProto } from '../models/MemberId';
import DataObjectRequest, { DataObjectRequestProto } from '../models/DataObjectRequest';
import DataObjectNetworkInfoRequest, { DataObjectNetworkInfoRequestProto } from '../models/DataObjectNetworkInfoRequest';
import Member, { MemberProto } from '../models/Member';
import MembersService from '../services/MembersService';
import MembersList from '../models/MembersList';

const respondWithPromise = (promise: Promise, callback: Function) => {
    promise.then(result => {
        callback(null, result.toProto());
    }).catch(error => {
        console.error(error);

        callback(error, null);
    });
};

export default class BlockchainController {
    dataObjectService: DataObjectService;
    dataObjectRequestService: DataObjectRequestService;
    members: MembersService;

    constructor(dataObjectService: DataObjectService, dataObjectRequestService: DataObjectRequestService, members: MembersService) {
        this.dataObjectService = dataObjectService;
        this.dataObjectRequestService = dataObjectRequestService;
        this.members = members;
    }

    handlers() {
        return {
            addDataObject: this.addDataObject.bind(this),
            getMemberDataObjects: this.getMemberDataObjects.bind(this),
            getDataObjectNetworkInfo: this.getDataObjectNetworkInfo.bind(this),
            makeRequest: this.makeRequest.bind(this),
            updateDataObject: this.updateDataObject.bind(this),
            getDataObjectRequests: this.getDataObjectRequests.bind(this),
            updateMember: this.updateMember.bind(this),
            getMemberInfo: this.getMemberInfo.bind(this),
            getAllMembers: this.getAllMembers.bind(this)
        };
    }

    makeRequest(call: ServerUnaryCall<DataObjectRequestProto>, callback: Function) {
        this.recover(() => {
            let dataObjectRequest = DataObjectRequest.fromProto(call.request);
            let result = this.dataObjectRequestService.makeRequest(dataObjectRequest);

            respondWithPromise(result, callback);
        });
    }

    getDataObjectRequests(call: ServerUnaryCall<Empty>, callback: Function) {
        this.recover(() => {
            let result = this.dataObjectRequestService.getDataObjectRequests();

            respondWithPromise(result, callback);
        });
    }

    addDataObject(call: ServerUnaryCall<MemberDataObjectProto>, callback: Function) {
        this.recover(() => {
            let memberDataObject = MemberDataObject.fromProto(call.request);
            let memberId = memberDataObject.memberId;
            let dataObject = memberDataObject.dataObject;
            let result = this.dataObjectService.add(memberId, dataObject);

            respondWithPromise(result, callback);
        });
    }

    updateDataObject(call: ServerUnaryCall<DataObjectUpdateProto>, callback: Function) {
        this.recover(() => {
            let update = DataObjectUpdate.fromProto(call.request);
            let result = this.dataObjectService.update(update);

            respondWithPromise(result, callback);
        });
    }

    getDataObjectNetworkInfo(call: ServerUnaryCall<DataObjectNetworkInfoRequestProto>, callback: Function) {
        this.recover(() => {
            let infoRequest = DataObjectNetworkInfoRequest.fromProto(call.request);
            let dataObjectId = infoRequest.dataObjectId;
            let memberIds = infoRequest.memberIds;
            let result = this.dataObjectService.getDataObjectNetworkInfo(memberIds, dataObjectId);

            respondWithPromise(result, callback);
        });
    }

    getMemberDataObjects(call: ServerUnaryCall<MemberIdProto>, callback: Function) {
        this.recover(() => {
            let memberId = MemberId.fromProto(call.request);
            let result = this.dataObjectService.getMy(memberId);

            respondWithPromise(result, callback);
        });
    }

    updateMember(call: ServerUnaryCall<MemberProto>, callback: Function) {
        this.recover(() => {
            let member = Member.fromProto(call.request);
            let result = this.members.update(member);

            respondWithPromise(result, callback);
        });
    }

    getMemberInfo(call: ServerUnaryCall<MemberIdProto>, callback: Function) {
        this.recover(() => {
            let memberId = MemberId.fromProto(call.request);
            let result = this.members.get(memberId);

            respondWithPromise(result, callback);
        });
    }

    getAllMembers(call: ServerUnaryCall<EmptyProto>, callback: Function) {
        this.recover(() => {
            let result = this.members.getAll().then(members => {
                return new MembersList(members);
            });

            respondWithPromise(result, callback);
        });
    }

    recover(f: Function) {
        try {
            f();
        } catch (e) {
            console.error(e);
        }
    }
}
