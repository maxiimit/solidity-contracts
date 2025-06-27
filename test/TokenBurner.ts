import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";

describe("TokenBurner", () => {
  const deployFixture = async () => {
    const TokenBurner = await ethers.getContractFactory("TokenBurner");
    const tokenBurner = await TokenBurner.deploy();

    const [owner, other] = await ethers.getSigners();

    return {
      tokenBurner,
      owner,
      other,
    };
  };

  describe("Deployment", () => {
    it("Deploy with right balance", async () => {
      const { tokenBurner, owner } = await loadFixture(deployFixture);

      expect(await tokenBurner.balances(owner)).to.equal(1000);
    });
  });

  describe("Burn", () => {
    it("Should burn tokens", async () => {
      const { tokenBurner, owner, other } = await loadFixture(deployFixture);

      expect(
        tokenBurner.connect(other).burn(ethers.parseEther("10000000"))
      ).to.be.revertedWith("Enough tokens to burn");

      const prevBalance = await tokenBurner.balances(owner);

      expect(prevBalance).to.equal(1000);

      await tokenBurner.connect(owner).burn(500);

      const afterBalance = await tokenBurner.balances(owner);

      expect(afterBalance).to.equal(500);
      expect(await tokenBurner.connect(owner).burn(500))
        .to.emit(tokenBurner, "Burned")
        .withArgs(500);
    });
  });
});
