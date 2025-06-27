// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Calculator {
  function add(uint a, uint b) public pure returns (uint) {
    return a + b;
  }

  function sub(uint a, uint b) public pure returns (uint) {
    return a - b;
  }

  function mul(uint a, uint b) public pure returns (uint) {
    return a * b;
  }

  function div(uint a, uint b) public pure returns (uint) {
    require(b != 0, "division by zero");
    return a / b;
  }
}