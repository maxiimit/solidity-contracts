import { expect } from "chai";
import { ethers } from "hardhat";
import { Logger } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Payment", () => {
  const deployFixture = async () => {
    const Logger = await ethers.getContractFactory("Logger");
    const logger = (await Logger.deploy()) as Logger;
    await logger.waitForDeployment();
    const loggerAddress = await logger.getAddress();

    const Payment = await ethers.getContractFactory("Payment");
    const payment = await Payment.deploy(loggerAddress);
    await payment.waitForDeployment();

    const [owner, other] = await ethers.getSigners();

    return { payment, logger, owner, other };
  };

  describe("Payments", () => {
    it("allows to pay and get payment info", async () => {
      const { payment, owner } = await loadFixture(deployFixture);

      const address = await payment.getAddress();

      const sum = 100;
      const txData = {
        value: sum,
        to: address,
      };

      const tx = await owner.sendTransaction(txData);
      await tx.wait();

      await expect(tx).to.changeEtherBalance(payment, sum);

      const amount = await payment.payment(owner.address, 0);

      expect(amount).to.eq(sum);
    });
  });
});
