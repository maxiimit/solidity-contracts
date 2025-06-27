import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { ethers } from "hardhat";
import { WhitelistVault } from "../typechain-types";

describe("WhitelistVault", function () {
  const deployFixture = async () => {
    const WhitelistVault = await ethers.getContractFactory("WhitelistVault");
    const whitelistVault = (await WhitelistVault.deploy()) as WhitelistVault;

    const [owner, other] = await ethers.getSigners();

    return { whitelistVault, owner, other };
  };

  describe("Deployment", function () {
    it("Deploy with right owner", async () => {
      const { whitelistVault, owner } = await loadFixture(deployFixture);

      expect(await whitelistVault.owner()).to.equal(owner);
    });
  });

  describe("Transfer", function () {
    it("Should deposit with access address", async () => {
      const { whitelistVault, owner, other } = await loadFixture(deployFixture);

      const depositValue = ethers.parseEther("100");

      await whitelistVault.connect(owner).addToWhitelist(other);
      await whitelistVault.connect(other).deposit({ value: depositValue });

      expect(await whitelistVault.balances(other)).to.equal(depositValue);
      expect(await whitelistVault.whitelist(other)).true;
    });
  });
});
