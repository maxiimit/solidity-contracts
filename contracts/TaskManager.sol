// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract TaskManager {
  address public owner;

  constructor() {
    owner = msg.sender;
  }

  enum Status { Created, InProgress, Completed }

  struct Task {
    string description;
    Status status;
  }

  mapping(address => Task[]) public tasks;

  function createTask(string memory _desc) public {
    tasks[msg.sender].push(Task(_desc, Status.Created));
  }

  function getTaskCount() public view returns (uint) {
    return tasks[msg.sender].length;
  }

  function changeTaskStatus(Status _status, uint taskId) public {
    require(owner == msg.sender, 'Only owner can change task status');

    if (taskId >= getTaskCount()) {
      revert("Not found task with this taskId");
    }

    Task storage task = tasks[msg.sender][taskId];

    if (task.status == Status.Completed && _status == Status.Completed) {
      revert("The task can't be completed yet");
    }

    task.status = _status;
  }
}