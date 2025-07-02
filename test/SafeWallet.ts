import { expect } from "chai";
import { ethers } from "hardhat";
import { SafeWallet } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("SafeWallet", () => {
  const deployFixture = async () => {
    const SafeWallet = await ethers.getContractFactory("SafeWallet");
    const safeWallet = (await SafeWallet.deploy()) as SafeWallet;

    const [owner, other] = await ethers.getSigners();

    return { safeWallet, owner, other };
  };

  describe("Deposit", () => {
    it("Should get right balance", async () => {
      const { safeWallet, owner } = await loadFixture(deployFixture);

      const balanceBefore = await safeWallet.balances(owner);
      const amount = ethers.parseEther("100");

      expect(balanceBefore).to.equal("0");

      await safeWallet.connect(owner).deposit({ value: amount });

      const balanceAfter = await safeWallet.balances(owner);

      expect(balanceAfter).to.equal(amount);
    });

    it("Should check deposit emit", async () => {
      const { safeWallet, other } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("100");

      expect(await safeWallet.connect(other).deposit({ value: amount }))
        .to.emit(safeWallet, "Deposited")
        .withArgs(other, amount);
    });
  });

  describe("Withdraw", () => {
    it("Should withdraw and check withdraw emit", async () => {
      const { safeWallet, other } = await loadFixture(deployFixture);
      const depositAmount = ethers.parseEther("100");
      const withdrawAmount = ethers.parseEther("50");

      await safeWallet.connect(other).deposit({ value: depositAmount });

      expect(await safeWallet.balances(other)).to.equal(depositAmount);

      expect(await safeWallet.connect(other).withdraw(other, withdrawAmount))
        .to.emit(safeWallet, "Withdrawn")
        .withArgs(other, withdrawAmount);

      expect(await safeWallet.balances(other)).to.equal(withdrawAmount);
    });

    it("Failed withdraw not enough ether", async () => {
      const { safeWallet, other } = await loadFixture(deployFixture);

      expect(safeWallet.withdraw(other, 1000)).to.be.revertedWith(
        "Not enough Ether"
      );
    });
  });
});
