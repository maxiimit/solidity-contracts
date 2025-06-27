import { expect } from "chai";
import { ethers } from "hardhat";
import { PiggyBank } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("PiggyBank", function () {
  const deployFixture = async () => {
    const [owner, other] = await ethers.getSigners();

    const PiggyBank = await ethers.getContractFactory("PiggyBank");
    const piggyBank = (await PiggyBank.deploy()) as PiggyBank;

    return { piggyBank, owner, other };
  };

  describe("Deployment", function () {
    it("Should set right owner", async function () {
      const { owner, piggyBank } = await loadFixture(deployFixture);

      expect(await piggyBank.owner()).to.equal(owner.address);
    });
  });

  describe("Transfers", function () {
    it("Should deposit and check balance", async function () {
      const { piggyBank, owner } = await loadFixture(deployFixture);

      expect(await ethers.provider.getBalance(piggyBank.target)).to.equal(
        ethers.parseEther("0")
      );

      expect(
        await owner.sendTransaction({
          to: piggyBank.target,
          value: ethers.parseEther("1"),
        })
      )
        .to.emit(piggyBank, "Deposited")
        .withArgs(owner.address, ethers.parseEther("1"));

      expect(await piggyBank.getBalance()).to.equal(ethers.parseEther("1"));
    });

    it("Should withdraw and check balances", async function () {
      const { piggyBank, owner, other } = await loadFixture(deployFixture);

      await owner.sendTransaction({
        to: piggyBank.target,
        value: ethers.parseEther("1"),
      });

      expect(await piggyBank.getBalance()).to.equal(ethers.parseEther("1"));

      expect(
        await piggyBank
          .connect(owner)
          .openPiggyBank(other.address, ethers.parseEther("1"))
      )
        .to.emit(piggyBank, "Withdraw")
        .withArgs(other.address, ethers.parseEther("1"));

      expect(await piggyBank.getBalance()).to.equal(ethers.parseEther("0"));
    });
  });
});
