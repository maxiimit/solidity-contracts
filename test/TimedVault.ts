import { expect } from "chai";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { TimedVault } from "../typechain-types";

describe("TimedVault", () => {
  const deployFixture = async () => {
    const TimedVault = await ethers.getContractFactory("TimedVault");
    const timedVault = (await TimedVault.deploy()) as TimedVault;

    const [owner, other] = await ethers.getSigners();

    return {
      timedVault,
      owner,
      other,
    };
  };

  describe("Transfer", () => {
    it("Should deposit and change unlock time", async () => {
      const { timedVault, other } = await loadFixture(deployFixture);

      const prevUnlockTime = await timedVault.unlockTime(other);

      await timedVault
        .connect(other)
        .deposit({ value: ethers.parseEther("10") });

      const afterBalance = await timedVault.balances(other);
      const afterUnlockTime = await timedVault.unlockTime(other);

      expect(afterBalance).to.equal(ethers.parseEther("10"));
      expect(afterUnlockTime).to.be.greaterThan(prevUnlockTime);
    });

    it("Should withdraw", async () => {
      const { timedVault, other } = await loadFixture(deployFixture);

      await timedVault
        .connect(other)
        .deposit({ value: ethers.parseEther("102") });

      await time.increase(61);

      const prevBalance = await timedVault.balances(other);

      await timedVault.connect(other).withdraw(other);

      expect(prevBalance).to.be.greaterThan(
        prevBalance - ethers.parseEther("100")
      );
    });

    it("Check Withdraw emit", async () => {
      const { timedVault, other } = await loadFixture(deployFixture);

      await timedVault
        .connect(other)
        .deposit({ value: ethers.parseEther("20") });

      await time.increase(61);

      const amount = ethers.parseEther("10");

      expect(await timedVault.connect(other).withdraw(other))
        .to.emit(timedVault, "Withdraw")
        .withArgs(other, amount);
    });
  });
});
