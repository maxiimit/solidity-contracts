import { expect } from "chai";
import { ethers } from "hardhat";
import { AucEngine } from "../typechain-types";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("AucEngine", () => {
  const getTimestampByBlockNumber = async (bn: number | null) => {
    if (!bn) return;

    const block = await ethers.provider.getBlock(bn);

    return block?.timestamp;
  };

  const deployFixture = async () => {
    const AucEngine = await ethers.getContractFactory("AucEngine");
    const aucEngine = (await AucEngine.deploy()) as AucEngine;
    await aucEngine.waitForDeployment();

    const [owner, other] = await ethers.getSigners();

    const aucProps = {
      amount: ethers.parseEther("0.0001"),
      discount: 3,
      duration: 60,
      item: "my private message",
    };

    return { owner, other, aucEngine, aucProps };
  };

  describe("Deployment", () => {
    it("Should deploy with right owner", async () => {
      const { owner, aucEngine } = await loadFixture(deployFixture);

      expect(await aucEngine.owner()).to.eq(owner);
    });
  });

  describe("Create", () => {
    it("Should create an auction", async () => {
      const { other, aucEngine, aucProps } = await loadFixture(deployFixture);

      expect(
        aucEngine.createAuction(ethers.parseEther("1"), 1, "test", 5000)
      ).to.revertedWith(
        "Start price must be greater than or equal to discount rate times duration"
      );

      expect(
        await aucEngine.createAuction(
          aucProps.amount,
          aucProps.discount,
          aucProps.item,
          aucProps.duration
        )
      )
        .to.emit(aucEngine, "AuctionCreated")
        .withArgs(0, aucProps.item, aucProps.amount, aucProps.duration);

      const tx = await aucEngine
        .connect(other)
        .createAuction(
          aucProps.amount,
          aucProps.discount,
          aucProps.item,
          aucProps.duration
        );

      const ts = await getTimestampByBlockNumber(tx.blockNumber);
      const cAuction = await aucEngine.auctions(2);

      expect(cAuction.endsAt).to.eq(ts! + aucProps.duration);
      expect(cAuction.seller).to.eq(other);
      expect(cAuction.item).to.eq(aucProps.item);
      expect(cAuction.discountRate).to.eq(aucProps.discount);
    });
  });

  describe("Buy auction", () => {
    it("Should buy auction and check price end", async () => {
      const { owner, aucEngine, other, aucProps } = await loadFixture(
        deployFixture
      );

      const tx = await aucEngine
        .connect(owner)
        .createAuction(
          aucProps.amount,
          aucProps.discount,
          aucProps.item,
          aucProps.duration
        );

      time.increase(1);

      const buyTx = await aucEngine
        .connect(other)
        .buy(0, { value: aucProps.amount });

      const cAuction = await aucEngine.auctions(0);
      const finalPrice = Number(cAuction.finalPrice);

      await expect(() => buyTx).to.changeEtherBalance(
        owner,
        finalPrice - Math.floor((finalPrice * 10) / 100)
      );

      expect(buyTx)
        .to.emit(aucEngine, "AuctionEnded")
        .withArgs(0, cAuction.finalPrice, other);

      expect(
        aucEngine.connect(other).buy(0, { value: aucProps.amount })
      ).revertedWith("Auction were stopped!");
    });
  });
});
