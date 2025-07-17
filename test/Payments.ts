import { expect } from "chai";
import { ethers } from "hardhat";
import { Payments } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Payments", () => {
  const deployFixture = async () => {
    const [owner, other] = await ethers.getSigners();
    const Payments = await ethers.getContractFactory("Payments", owner);
    const payments = (await Payments.deploy()) as Payments;
    await payments.waitForDeployment();

    return {
      owner,
      other,
      payments,
    };
  };

  describe("Deployment", () => {
    it("Should be deployed", async () => {
      const { payments } = await loadFixture(deployFixture);

      expect(await payments.getAddress()).to.be.properAddress;
    });
  });

  describe("Payment", () => {
    it("Should have 0 ether by default", async () => {
      const { payments } = await loadFixture(deployFixture);

      expect(await payments.getCurrentBalance()).to.be.equal(
        ethers.parseEther("0")
      );
    });

    it("should be possible to send funds", async () => {
      const { payments, owner } = await loadFixture(deployFixture);

      const tx = await payments.pay("test", {
        value: 100,
      });
      const block = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );

      await expect(() => tx).to.changeEtherBalances(
        [owner, payments.target],
        [-100, 100]
      );
      await tx.wait();

      const newPayment = await payments.getPayment(owner, 0);

      expect(newPayment.message).to.eq("test");
      expect(newPayment.timestamp).to.eq(block?.timestamp);
    });
  });
});
