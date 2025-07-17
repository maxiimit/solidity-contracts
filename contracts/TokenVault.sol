// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

contract TokenVault is ReentrancyGuard {
  mapping(address => LockBox) public vault;

  struct LockBox {
    uint amount;
    uint unlockTime;
  }

  event Withdraw(uint amount, address indexed to);

  function deposit() external payable {
    require(msg.value > 0, "Zero deposit not allowed");

    LockBox storage lock = vault[msg.sender];
    uint amount = lock.amount + msg.value;

    vault[msg.sender] = LockBox(amount, block.timestamp + 60);
  }

  function withdraw(uint amount, address to) external nonReentrant {
    LockBox storage lock = vault[msg.sender];

    if (lock.unlockTime >= block.timestamp) {
      revert("Too early");
    }

    require(lock.amount >= amount, 'Not enough ETH');

    lock.amount -= amount;

    (bool success, ) = to.call{value: amount}("");

    require(success, "Withdraw failed");

    emit Withdraw(amount, to);
  }
}

// Примеры edge cases в смарт-контрактах:

// В контексте твоего контракта TokenVault, edge cases могут быть:
// 	1.	deposit(0) — ты уже обрабатываешь ✅
// 	2.	Повторный deposit() — нужно проверить, накопится ли сумма
// 	3.	withdraw(0) — технически возможно, но бессмысленно — стоит протестировать
// 	4.	withdraw() точно на границе unlockTime == block.timestamp — проходит ли проверка?
// 	5.	Попытка withdraw() в to == address(0) — допустимо или нужно запретить?
