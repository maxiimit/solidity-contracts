// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

contract SafeWallet is ReentrancyGuard {
  mapping (address => uint) public balances;

  event Deposited(address indexed from, uint amount);
  event Withdrawn(address indexed to, uint amount);

  function deposit() external payable {
    require(msg.value > 0, "Deposit must be greater then 0");

    balances[msg.sender] += msg.value;

    emit Deposited(msg.sender, msg.value);
  }

  function withdraw(address to, uint amount) external nonReentrant {
    require(balances[msg.sender] >= amount, "Not enough Ether");

    balances[msg.sender] -= amount;
    (bool success, ) = to.call{value: amount}("");

    require(success, "Error transfer Ether");

    emit Withdrawn(to, amount);
  }
}