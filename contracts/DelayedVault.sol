// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './TimedVault.sol';

contract DelayedVault is TimedVault {
  function extendUnlockTime(uint _newUnlockTime) public {
    require(balances[msg.sender] > 0 && unlockTime[msg.sender] > 0, 'Sender have not balance or unlock time');
    require(_newUnlockTime > getUnlockTime(msg.sender), 'Cant minus unlock time, only plus');

    unlockTime[msg.sender] = _newUnlockTime;
  }

  function getUnlockTime(address user) public view returns (uint) {
    return unlockTime[user];
  }
}