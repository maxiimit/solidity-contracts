// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

contract Voiting {
    struct Candidate {
        string name;
		uint voteCount;
    }
    enum Phase { Init, Voting, Ended }
    address public admin;
    mapping (address => bool) public voted;
    mapping (string => bool) public candidateExists;
    Candidate[] public candidateList;
    Phase public currentPhase = Phase.Init;

    constructor() {
        admin = msg.sender;
        currentPhase = Phase.Voting;
    }

    modifier onlyAdmin() {
        require(admin == msg.sender, 'Only admin can do this');
        _;
    }

    function addCandidates(string memory _name) external onlyAdmin {
        require(!candidateExists[_name], 'Candidate already added');

        Candidate memory candidate = Candidate(_name, 0);

        candidateExists[_name] = true;
        candidateList.push(candidate);
    }

    function getCandidateCount() public view returns (uint) {
        return candidateList.length;
    }

    function getWinner() external onlyAdmin view returns (string memory winnerName, uint winnerVotes) {
        require(currentPhase == Phase.Ended, 'Phase must be ended before get winner!');
        require(candidateList.length > 0, 'No candidates');

        Candidate memory winner;
        
        for (uint i = 0; i < candidateList.length; i++) {
            if (candidateList[i].voteCount > winner.voteCount) {
                winner = candidateList[i];
            }
        }

        return (winner.name, winner.voteCount);
    }

    function vote(string memory _name) external {
        require(currentPhase == Phase.Voting, 'Phase must be a voiting');
        require(candidateExists[_name], 'No such candidate');
        if (voted[msg.sender]) revert("You already voted");

        voted[msg.sender] = true;

        for (uint i = 0; i < candidateList.length; i++) {
            if (keccak256(bytes(candidateList[i].name)) == keccak256(bytes(_name))) {
                candidateList[i].voteCount++;

                break;
            }
        }
    }

    function finishVote() external onlyAdmin {
        require(currentPhase == Phase.Voting, 'Phase must be a voiting before finish');

        currentPhase = Phase.Ended;
    }
}

// ✅ Задача 3. Голосование за кандидатуру

// Цель: закрепить enum, struct, mapping, require, revert

// 📋 Условие:
// 	•	Контракт позволяет:
// 	•	Админу добавлять кандидатов
// 	•	Пользователям голосовать один раз
// 	•	У кандидата:
// 	•	string name
// 	•	uint voteCount
// 	•	Состояние голосования:
// 	•	enum Phase { Init, Voting, Ended }
// 	•	Голосование можно завершить, далее — вызов getWinner
// 	•	Используй require для проверок фазы
// 	•	Используй revert если повторный голос
