import { expect } from "chai";
import { ethers } from "hardhat";
import { TokenVault } from "../typechain-types";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("TokenVault", () => {
  const deployFixture = async () => {
    const TokenVault = await ethers.getContractFactory("TokenVault");
    const tokenVault = (await TokenVault.deploy()) as TokenVault;

    const [owner, other] = await ethers.getSigners();

    return { tokenVault, owner, other };
  };

  describe("Deposit", () => {
    it("Should deposit", async () => {
      const { tokenVault, owner } = await loadFixture(deployFixture);

      const depositAmount = ethers.parseEther("1000");

      await tokenVault.connect(owner).deposit({ value: depositAmount });

      const ownerAmount = await tokenVault.vault(owner.address);

      expect(ownerAmount.amount).equal(depositAmount);
    });

    it("Failed when deposit value is zero", async () => {
      const { tokenVault, owner } = await loadFixture(deployFixture);

      const depositAmount = ethers.parseEther("0");

      expect(
        tokenVault.connect(owner).deposit({ value: depositAmount })
      ).to.revertedWith("Zero deposit not allowed");
    });
  });

  describe("Withdraw", async () => {
    it("Should withdraw", async () => {
      const { tokenVault, owner, other } = await loadFixture(deployFixture);

      const depositAmount = ethers.parseEther("1000");

      await tokenVault.connect(owner).deposit({ value: depositAmount });

      expect((await tokenVault.vault(owner.address)).amount).equal(
        depositAmount
      );

      await time.increase(61);

      const withdrawAmount = ethers.parseEther("500");

      await tokenVault.connect(owner).withdraw(withdrawAmount, other.address);

      expect((await tokenVault.vault(owner.address)).amount).to.equal(
        depositAmount - withdrawAmount
      );

      expect(
        await tokenVault.connect(owner).withdraw(withdrawAmount, other.address)
      )
        .to.emit(tokenVault, "Withdraw")
        .withArgs(withdrawAmount, other.address);
    });

    it("Failed when balance is not enough", async () => {
      const { tokenVault, owner, other } = await loadFixture(deployFixture);

      const depositAmount = ethers.parseEther("1000");

      await tokenVault.connect(owner).deposit({ value: depositAmount });

      expect((await tokenVault.vault(owner.address)).amount).equal(
        depositAmount
      );

      await time.increase(61);

      const withdrawAmount = ethers.parseEther("1001");

      expect(
        tokenVault.connect(owner).withdraw(withdrawAmount, other.address)
      ).to.revertedWith("Not enough ETH");
    });

    it("Failed when early withdraw", async () => {
      const { tokenVault, owner, other } = await loadFixture(deployFixture);

      const depositAmount = ethers.parseEther("1000");

      await tokenVault.connect(owner).deposit({ value: depositAmount });

      expect((await tokenVault.vault(owner.address)).amount).equal(
        depositAmount
      );

      const withdrawAmount = ethers.parseEther("1001");

      expect(
        tokenVault.connect(owner).withdraw(withdrawAmount, other.address)
      ).to.revertedWith("Too early");
    });
  });
});
