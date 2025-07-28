import { expect } from "chai";
import { ethers } from "hardhat";
import { LibPayment, Logger } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("LibPayment", () => {
  const deployFixture = async () => {
    const LibPayment = await ethers.getContractFactory("LibPayment");
    const libPayment = (await LibPayment.deploy()) as LibPayment;
    await libPayment.waitForDeployment();

    const [owner, other] = await ethers.getSigners();

    return { libPayment, owner, other };
  };

  describe("Runners", () => {
    it("Compares strings", async () => {
      const { libPayment } = await loadFixture(deployFixture);

      const str = "test";
      const str2 = "test1";

      expect(await libPayment.runnerStr(str, str)).to.true;

      expect(await libPayment.runnerStr(str, str2)).to.false;
    });

    it("Find element of uint array", async () => {
      const { libPayment } = await loadFixture(deployFixture);

      const arr = [1, 2, 3];

      expect(await libPayment.runnerArr(arr, 1)).to.true;

      expect(await libPayment.runnerArr(arr, 6)).to.false;
    });
  });
});
