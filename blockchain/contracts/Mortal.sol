pragma solidity ^0.4.8;

import './zeppelin/ownership/Ownable.sol';

contract Mortal is Ownable {
    function kill() onlyOwner {
        selfdestruct(owner);
    }
}
