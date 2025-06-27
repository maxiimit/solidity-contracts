import { expect } from "chai";

import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { SimpleToken } from "../typechain-types";

describe("SimpleToken", function () {
  const deployFixture = async () => {
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    const simpleToken = (await SimpleToken.deploy()) as SimpleToken;

    const [owner, other] = await ethers.getSigners();

    return {
      simpleToken,
      owner,
      other,
    };
  };

  describe("Deployment", function () {
    it("Deploy with right balance", async function () {
      const { simpleToken, owner } = await loadFixture(deployFixture);
      const ownerBalance = await simpleToken.balances(owner.address);

      expect(ethers.parseEther(ownerBalance.toString())).to.equal(
        ethers.parseEther("1000")
      );
    });
  });

  describe("Transfer", function () {
    it("Should transfer", async function () {
      const { simpleToken, other, owner } = await loadFixture(deployFixture);

      const ownerBalanceBefore = await simpleToken.balances(owner.address);

      expect(ownerBalanceBefore).to.equal(1000);

      await simpleToken.connect(owner).transfer(other.address, 500);

      expect(await simpleToken.balanceOf(owner)).to.equal(500);
    });

    it("Failed transfer not enough tokens", async function () {
      const { simpleToken, other } = await loadFixture(deployFixture);

      expect(simpleToken.transfer(other.address, 9999)).to.be.revertedWith(
        "Not enough tokens on balance"
      );
    });
  });
});
