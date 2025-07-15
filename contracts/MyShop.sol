// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

contract MyShop {
    address payable public owner;
    mapping (address => uint) public payments;

    constructor() {
        owner = payable(msg.sender);
    }

    modifier onlyOnwer {
        require(owner == msg.sender, 'Only for owner');
        _;
    }

    function payForItem() external payable {
        payments[msg.sender] += msg.value;
    }

    function withdrawAll() external onlyOnwer{
        owner.transfer(address(this).balance);
    }
}