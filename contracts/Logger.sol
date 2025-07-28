// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ILogger.sol";

contract Logger is ILogger {
  mapping(address => uint[]) public payments;


  function log(address _from, uint _amount) public {
    require(address(_from) != address(0), 'zero address');

    payments[_from].push(_amount);
  }

  function getEntry(address _from, uint _index) public view returns(uint) {
    return payments[_from][_index];
  }
}