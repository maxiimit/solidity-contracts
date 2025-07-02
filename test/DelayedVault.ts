import { expect } from "chai";
import { ethers } from "hardhat";
import { DelayedVault } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("DelayedVault", () => {
  const deployFixture = async () => {
    const DelayedVault = await ethers.getContractFactory("DelayedVault");
    const delayedVault = (await DelayedVault.deploy()) as DelayedVault;

    const [owner, other] = await ethers.getSigners();

    return { delayedVault, owner, other };
  };

  describe("Unlock Time", () => {
    it("Should return right unlock time", async () => {
      const { delayedVault, owner } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("100");

      expect(delayedVault.extendUnlockTime(10)).to.revertedWith(
        "Sender have not balance or unlock time"
      );

      await delayedVault.connect(owner).deposit({ value: amount });

      const unlockTimeBefore = await delayedVault.getUnlockTime(owner);

      await delayedVault
        .connect(owner)
        .extendUnlockTime(unlockTimeBefore + ethers.parseEther("10"));

      const unlockTimeAfter = await delayedVault.getUnlockTime(owner);

      expect(unlockTimeAfter).to.be.greaterThan(unlockTimeBefore);
    });
  });
});
