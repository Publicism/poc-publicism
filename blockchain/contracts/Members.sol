pragma solidity ^0.4.8;

import './Mortal.sol';

contract Members is Mortal {
    struct Member {
        string name;
        string info;
    }

	mapping (bytes32 => Member) members;

	event DidUpdate(address indexed origin, bytes32 indexed id);
	event DidRemove(address indexed origin, bytes32 indexed id);

    function update(bytes32 id, string name, string info) {
        members[id] = Member(name, info);
        DidUpdate(msg.sender, id);
    }

    function get(bytes32 id) constant returns (string, string) {
        return (members[id].name, members[id].info);
    } 

    function remove(bytes32 id) {
        delete members[id];
        DidRemove(msg.sender, id);
    }
}
