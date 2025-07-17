// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TokenBurner {
  mapping(address => uint) public balances;

  constructor() {
    balances[msg.sender] = 1000;
  }

  event Burned(address indexed user, uint amount);

  function burn(uint amount) external {
    require(balances[msg.sender] >= amount, "Enough tokens to burn");
    balances[msg.sender] -= amount;
    emit Burned(msg.sender, amount);
  }
}

// ✅ Задача 2: Сжигатель токенов (TokenBurner)

// 🔹 Условие:
// 	•	Создай простой токен-контракт (не ERC20), в котором:
// 	•	msg.sender получает 1000 токенов при деплое.
// 	•	Есть функция burn(uint amount), которая сжигает токены вызывающего.
// 	•	Запрети сжигать больше, чем есть на балансе.
// 	•	Добавь событие Burned(address user, uint amount).

// 📌 Подсказки:
// 	•	Используй mapping(address => uint)
// 	•	В burn() уменьши balances[msg.sender] -= amount
