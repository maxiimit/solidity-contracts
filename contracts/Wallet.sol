// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Wallet {
  mapping (address => uint) public balances;
  address public owner;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, 'Only owner can call this function');
    _;
  }

  function deposit() external payable {
    require(msg.value > 0, "Deposit must be greater than 0");

    balances[msg.sender] += msg.value;
  }

  function getMyBalance() public view returns (uint) {
    return balances[msg.sender];
  }

  function withdraw(address to, uint amount) external onlyOwner {
    require(address(this).balance >= amount, "Not enough Ether");
    (bool success, ) = to.call{value: amount}("");
    balances[msg.sender] -= amount;
    require(success, "Transfer failed");
  }
}