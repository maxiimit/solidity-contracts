// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MerkleTree {
  bytes32[] public hashes;
  string[4] transactions = [
    "TX1: Max -> John",
    "TX2: John -> Harry",
    "TX3: John -> Max",
    "TX4: Max -> Harry"
  ];

  constructor() {
    for(uint i = 0; i < transactions.length; i++) {
      hashes.push(makeHash(transactions[i]));
    }

    uint count = transactions.length;
    uint offset = 0;

    while(count > 0) {
      for(uint i = 0; i < count - 1; i += 2) {
        hashes.push(keccak256(
          abi.encodePacked(
            hashes[offset + i], hashes[offset + i + 1]
          )
        ));
      }

      offset += count;
      count /= 2;
    }
  }

  function verify(string memory transaction, uint index, bytes32 rootHash, bytes32[] memory proof) public pure returns(bool) {
    bytes32 hash = makeHash(transaction);

    for(uint i = 0; i < proof.length; i++) {
      bytes32 element = proof[i];

      if (index % 2 == 0) {
        hash = keccak256(abi.encodePacked(hash, element));
      } else {
        hash = keccak256(abi.encodePacked(element, hash));
      }

      index /= 2;
    }

    return hash == rootHash;
  }

  function encode(string memory input) public pure returns(bytes memory) {
    return abi.encodePacked(input);
  }

  function makeHash(string memory input) public pure returns(bytes32) {
    return keccak256(
      encode(input)
    );
  }
}