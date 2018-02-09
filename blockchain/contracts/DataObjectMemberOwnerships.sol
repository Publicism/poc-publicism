pragma solidity ^0.4.8;

import './Mortal.sol';

contract DataObjectMemberOwnerships is Mortal {
    uint id;

    struct Ownership {
        bytes32 memberId;
        bytes32 dataObjectId;
        bytes32 dataObjectHash;
        string dataObjectInfo;
        address origin;
        uint createdAt;
        uint updatedAt;
    }

    mapping (uint => Ownership) ownerships;

    event DidAdd(uint indexed id, address origin, bytes32 indexed memberId, bytes32 indexed dataObjectId, bytes32 dataObjectHash, string dataObjectInfo);
    event DidUpdate(uint indexed id, address origin, bytes32 indexed memberId, bytes32 indexed dataObjectId, bytes32 dataObjectHash, string dataObjectInfo);
    event DidRemove(uint indexed id, address origin, bytes32 indexed memberId, bytes32 indexed dataObjectId, bytes32 dataObjectHash, string dataObjectInfo);

    function add(bytes32 memberId, bytes32 dataObjectId, bytes32 dataObjectHash, string dataObjectInfo) {
        id++;
        ownerships[id] = Ownership(memberId, dataObjectId, dataObjectHash, dataObjectInfo, msg.sender, now, now);
        DidAdd(id, msg.sender, memberId, dataObjectId, dataObjectHash, dataObjectInfo);
    }

    function get(uint id) constant returns (bytes32, bytes32, bytes32, string, address, uint, uint) {
        var instance = ownerships[id];
        return (instance.memberId, instance.dataObjectId, instance.dataObjectHash, instance.dataObjectInfo, instance.origin, instance.createdAt, instance.updatedAt);
    }

    function update(uint id, bytes32 memberId, bytes32 dataObjectHash, string dataObjectInfo) {
        var instance = ownerships[id];
        if (instance.origin != msg.sender) throw;
        ownerships[id] = Ownership(memberId, instance.dataObjectId, dataObjectHash, dataObjectInfo, msg.sender, instance.createdAt, now);
        DidUpdate(id, msg.sender, memberId, instance.dataObjectId, dataObjectHash, dataObjectInfo);
    }

    function remove(uint id) {
        var instance = ownerships[id];
        if (instance.origin != msg.sender) throw;
        delete ownerships[id];
        DidRemove(id, msg.sender, instance.memberId, instance.dataObjectId, instance.dataObjectHash, instance.dataObjectInfo);
    }

    function getId() constant returns(uint) {
        return id;
    }

}
