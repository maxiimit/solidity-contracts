
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

contract TimedVault is ReentrancyGuard {
  mapping(address => uint) public balances;
  mapping(address => uint) public unlockTime;

  event Withdraw(address indexed to);

  function deposit() external payable {
    balances[msg.sender] += msg.value;
    unlockTime[msg.sender] = block.timestamp + 60;
  }

  function withdraw(address to) public nonReentrant {
    uint amount = balances[msg.sender];
    require(block.timestamp >= unlockTime[msg.sender], 'Too early');
    require(amount > 0, "Not enough ETH");

    balances[msg.sender] -= amount;

    (bool success, ) = to.call{value: amount}("");

    require(success, "Withdraw failed");
    
    emit Withdraw(to);
  }
}


// ✅ Задача 1: Таймлок хранилище эфира (TimedVault)

// 🔹 Условие:
// 	•	Контракт принимает депозиты от разных пользователей.
// 	•	Для каждого депозита сохраняется timestamp, когда пользователь сможет его забрать.
// 	•	Добавь функцию withdraw(), которая разрешает забрать эфир только через 1 минуту после депозита.

// 📌 Подсказки:
// 	•	Используй mapping(address => uint) public unlockTime;
// 	•	В deposit() запиши unlockTime[msg.sender] = block.timestamp + 60;
// 	•	В withdraw() добавь require(block.timestamp >= unlockTime[msg.sender], "Too early");
