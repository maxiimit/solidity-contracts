// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract WhitelistVault {
  mapping(address => bool) public whitelist;
  mapping(address => uint) public balances;
  address public owner;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(owner == msg.sender, "U are not owner!");
    _;
  }

  function deposit() public payable {
    require(whitelist[msg.sender], "Address has not access");
    balances[msg.sender] += msg.value;
  }

  function addToWhitelist(address user) public onlyOwner {
    whitelist[user] = true;
  }
}

// ✅ Задача 3: Whitelist-доступ к депонированию (WhitelistVault)

// 🔹 Условие:
// 	•	Контракт должен принимать эфир только от одобренных адресов (whitelist).
// 	•	Адрес может быть добавлен только owner.
// 	•	Если не в whitelist — deposit() выбрасывает require.

// 📌 Подсказки:
// 	•	Используй mapping(address => bool) whitelist;
// 	•	В constructor() установи owner = msg.sender;
// 	•	Добавь addToWhitelist(address user) с модификатором onlyOwner
// 	•	В deposit() — require(whitelist[msg.sender], "Not whitelisted");
