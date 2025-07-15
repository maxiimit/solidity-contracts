// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract PiggyBank {
  address public owner;

  constructor() {
    owner = msg.sender;
  }

  event Deposited(address indexed from, uint amount);
  event Withdraw(address indexed to, uint amount);

  modifier onlyOwner() {
    require(msg.sender == owner, 'Only owner can do it!');
    _;
  }

  receive() external payable {
    emit Deposited(msg.sender, msg.value);
  }

  function getBalance() public view returns (uint) {
    return address(this).balance;
  }

  function openPiggyBank(address to, uint amount) external onlyOwner {
    (bool success, ) = to.call{value: amount}("");
    require(success, "Transfer failed!");
    emit Withdraw(to, amount);
  }
}


//  Задача 1: Копилка (PiggyBank)

// Сделай контракт, где:
// 	•	Пользователи могут отправлять эфир (депозит).
// 	•	Владелец (owner) может “вскрыть копилку” и забрать все средства.
// 	•	При этом баланс пользователей не ведётся — только общий баланс.
// 	•	Добавь событие при пополнении и выводе.

// 💡 Подсказки:
// 	•	Используй address(this).balance для просмотра общего баланса.
// 	•	Добавь модификатор onlyOwner.
// 	•	Добавь receive() или fallback() для прямого перевода.
