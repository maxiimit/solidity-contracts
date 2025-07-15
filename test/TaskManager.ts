import { expect } from "chai";
import { ethers } from "hardhat";
import { TaskManager } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("TaskManager", () => {
  const deployFixture = async () => {
    const TaskManager = await ethers.getContractFactory("TaskManager");
    const taskManager = (await TaskManager.deploy()) as TaskManager;
    const [owner, other] = await ethers.getSigners();

    return { taskManager, owner, other };
  };

  describe("Deployment", () => {
    it("Should deploy with right owner", async () => {
      const { taskManager, owner } = await loadFixture(deployFixture);

      expect(await taskManager.owner()).to.equal(owner.address);
    });
  });

  describe("Create task", () => {
    it("Task will be created", async () => {
      const { taskManager, owner } = await loadFixture(deployFixture);

      const taskDescription = "test description";

      await expect(taskManager.tasks(owner.address, 0)).to.be.reverted;

      await taskManager.connect(owner).createTask(taskDescription);

      const task = await taskManager.tasks(owner.address, 0);

      expect(task.description).to.equal(taskDescription);
      expect(task.status).to.equal(0);
    });
  });

  describe("ChangeTask", () => {
    it("Should task change", async () => {
      const { taskManager, owner } = await loadFixture(deployFixture);

      const taskDescription = "test description";
      await taskManager.connect(owner).createTask(taskDescription);

      const taskBefore = await taskManager.tasks(owner.address, 0);

      expect(taskBefore.description).to.equal(taskDescription);
      expect(taskBefore.status).to.equal(0);

      await taskManager.connect(owner).changeTaskStatus(1, 0);

      const taskAfter = await taskManager.tasks(owner.address, 0);

      expect(taskAfter.status).to.equal(1);

      expect(await taskManager.getTaskCount()).to.equal(1);
    });

    it("Should reverted change task", async () => {
      const { taskManager, owner } = await loadFixture(deployFixture);

      const taskDescription = "test description";
      await taskManager.connect(owner).createTask(taskDescription);

      await expect(taskManager.changeTaskStatus(1, 99)).to.be.revertedWith(
        "Not found task with this taskId"
      );
    });

    it("Cant complete completed task", async () => {
      const { taskManager, owner } = await loadFixture(deployFixture);

      const taskDescription = "test description";
      await taskManager.connect(owner).createTask(taskDescription);

      await taskManager.connect(owner).changeTaskStatus(2, 0);

      await expect(taskManager.changeTaskStatus(2, 0)).to.be.revertedWith(
        "The task can't be completed yet"
      );
    });
  });
});
