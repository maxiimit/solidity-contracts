// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract SimpleToken {
  mapping (address => uint) public balances;

  constructor() {
    balances[msg.sender] = 1000;
  }

  event Transfer(address indexed from, address indexed to, uint amount);

  function transfer(address to, uint amount) external {
    require(balances[msg.sender] >= amount, 'Not enough tokens on balance');
    balances[msg.sender] -= amount;
    balances[to] += amount;

    emit Transfer(msg.sender, to, amount);
  }

  function balanceOf(address user) public view returns (uint) {
    return balances[user];
  }
}


// ✅ Задача 2: SimpleToken (не ERC20)

// Создай токен, реализованный через mapping(address => uint):
// 	•	В конструкторе выдай msg.sender 1000 токенов.
// 	•	Сделай функцию transfer(to, amount) — перевод между пользователями.
// 	•	Функция должна проверять баланс и выбрасывать require при нехватке.
// 	•	Добавь balanceOf(address).