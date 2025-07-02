// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

contract MiniToken is ReentrancyGuard {
  mapping (address => uint) public balances;

  constructor() payable {
    balances[msg.sender] = msg.value;
  }

  event Transfer(address indexed to, uint amount);

  function burn(uint amount) public {
    require(balances[msg.sender] >= amount, 'Not enough tokens');

    balances[msg.sender] -= amount;
  }

  function transfer(address to) public payable nonReentrant {
    burn(msg.value);

    balances[to] += msg.value;

    (bool success, ) = to.call{value: msg.value}("");

    require(success, "Transfer failed");

    emit Transfer(to, msg.value);
  }

}