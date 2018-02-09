pragma solidity ^0.4.8;

import './Mortal.sol';

contract DataObjectHistory is Mortal {
    uint id;

    struct Entry {
        bytes32 memberId;
        bytes32 dataObjectId;
        bytes32 dataObjectHash;
        address origin;
        uint updatedAt;
    }

    mapping (uint => Entry) history;

    event DidAdd(uint id, bytes32 indexed memberId, bytes32 indexed dataObjectId, bytes32 indexed dataObjectHash, address origin, uint updatedAt);

    function add(bytes32 memberId, bytes32 dataObjectId, bytes32 dataObjectHash) {
        id++;
        history[id] = Entry(memberId, dataObjectId, dataObjectHash, msg.sender, now);
        DidAdd(id, memberId, dataObjectId, dataObjectHash, msg.sender, now);
    }

    function get(uint id) constant returns (bytes32, bytes32, bytes32, address, uint) {
        var instance = history[id];
        return (instance.memberId, instance.dataObjectId, instance.dataObjectHash, instance.origin, instance.updatedAt);
    }

    function getId() constant returns(uint) {
        return id;
    }
}