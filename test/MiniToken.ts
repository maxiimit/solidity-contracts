import { expect } from "chai";
import { ethers } from "hardhat";
import { MiniToken } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("MiniToken", () => {
  const deployFixture = async () => {
    const MiniToken = await ethers.getContractFactory("MiniToken");
    const miniToken = (await MiniToken.deploy({
      value: ethers.parseEther("1000"),
    })) as MiniToken;

    const [owner, other] = await ethers.getSigners();

    return { miniToken, owner, other };
  };

  describe("Deployment", () => {
    it("Should top up owner balance", async () => {
      const { miniToken, owner } = await loadFixture(deployFixture);

      expect(await miniToken.balances(owner.address)).to.equal(
        ethers.parseEther("1000")
      );
    });
  });

  describe("Transfer", () => {
    it("Should transfer", async () => {
      const { miniToken, other, owner } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("100");
      const balanceBefore = await miniToken.balances(other.address);

      expect(balanceBefore).to.equal(ethers.parseEther("0"));

      await miniToken.connect(owner).transfer(other, { value: amount });

      const balanceAfter = await miniToken.balances(other.address);
      const ownerBalance = await miniToken.balances(owner.address);

      expect(ownerBalance).to.equal(ethers.parseEther("900"));
      expect(balanceAfter).to.equal(amount);
    });

    it("Should check Transfer emit", async () => {
      const { miniToken, other } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("100");
      expect(await miniToken.transfer(other, { value: amount }))
        .to.emit(miniToken, "Transfer")
        .withArgs(other, amount);
    });
  });
});
