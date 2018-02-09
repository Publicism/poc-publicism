pragma solidity ^0.4.8;

import './Mortal.sol';

contract DataObjectRequestHistory is Mortal {
    uint id;

    struct Request {
        bytes32 memberId;
        bytes32 dataObjectId;
        address origin;
        uint createdAt;
    }

    mapping (uint => Request) history;

    event DidAdd(uint id, bytes32 indexed memberId, bytes32 indexed dataObjectId, address indexed origin, uint createdAt);

    function add(bytes32 memberId, bytes32 dataObjectId) {
        id++;
        history[id] = Request(memberId, dataObjectId, msg.sender, now);
        DidAdd(id, memberId, dataObjectId, msg.sender, now);
    }

    function get(uint id) constant returns (bytes32, bytes32, address, uint) {
        var instance = history[id];
        return (instance.memberId, instance.dataObjectId, instance.origin, instance.createdAt);
    }

    function getId() constant returns(uint) {
        return id;
    }

}
