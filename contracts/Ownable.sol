// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


contract Ownable {
   address public owner;

  constructor(address ownerOverride) {
    owner = ownerOverride == address(0) ? msg.sender : ownerOverride;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner");
    _;
  }

  function withdraw() public virtual onlyOwner {
    payable(owner).transfer(address(this).balance);
  }
}

abstract contract Balances is Ownable {
  function getBalance() public view returns(uint) {
    return address(this).balance;
  }

  function withdraw(address payable _to) public virtual {
    _to.transfer(getBalance());
  }

}

contract MyContract is Ownable, Balances {
  constructor(address _owner) Ownable(_owner) {}

  function withdraw(address payable _to) public override(Balances) {
    require(_to != address(0), 'zero address');
    super.withdraw(_to);
  }
}