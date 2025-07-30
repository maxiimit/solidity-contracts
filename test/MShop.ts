import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import tokenJSON from "../artifacts/contracts/ERC20/ERC.sol/MCSToken.json";
import { ERC20 } from "../typechain-types";

describe("MShop", () => {
  const deployFixture = async () => {
    const MShop = await ethers.getContractFactory("MShop");
    const mshop = await MShop.deploy();
    await mshop.waitForDeployment();

    const [owner, other] = await ethers.getSigners();

    const erc20 = new ethers.Contract(
      await mshop.token(),
      tokenJSON.abi,
      owner
    ) as unknown as ERC20;

    return { mshop, owner, other, erc20 };
  };

  describe("Deployment", () => {
    it("Should have an owner and a token", async () => {
      const { mshop, owner } = await loadFixture(deployFixture);

      expect(await mshop.owner()).to.eq(owner);

      expect(await mshop.token()).to.be.properAddress;
    });
  });

  describe("Token Management", () => {
    it("Allows to buy tokens", async () => {
      const { mshop, other, erc20 } = await loadFixture(deployFixture);

      const tokenAmount = 3;
      const txData = {
        value: tokenAmount,
        to: mshop.target,
      };

      const tx = await other.sendTransaction(txData);
      await tx.wait();

      expect(tx).to.emit(mshop, "Bought").withArgs(tokenAmount, other);
      expect(await erc20.balanceOf(other)).to.eq(tokenAmount);
      await expect(() => tx).to.changeEtherBalance(mshop.target, 3);
      expect(await mshop.tokenBalance()).to.eq(17);
    });

    it("Allows to sell tokens", async () => {
      const { mshop, other, erc20 } = await loadFixture(deployFixture);
      const tokenToSell = 2;

      const buyTx = await other.sendTransaction({ value: 3, to: mshop.target });
      await buyTx.wait();

      await erc20.connect(other).approve(mshop.target, tokenToSell);

      expect(await erc20.connect(other).allowance(other, mshop.target)).to.eq(
        tokenToSell
      );

      const sellTx = await mshop.connect(other).sell(tokenToSell);
      await sellTx.wait();

      expect(await erc20.balanceOf(other)).to.eq(1);

      expect(await mshop.tokenBalance()).to.eq(19);
      await expect(() => sellTx).to.changeEtherBalance(
        mshop.target,
        -tokenToSell
      );
      expect(sellTx).to.emit(mshop.target, "Sold").withArgs(tokenToSell, other);
    });

    it("Should owner withdraw", async () => {
      const { mshop, other, owner } = await loadFixture(deployFixture);

      const tokenAmount = 3;
      const txData = {
        value: tokenAmount,
        to: mshop.target,
      };

      const tx = await other.sendTransaction(txData);
      await tx.wait();

      const txWithdraw = await mshop.connect(owner).withdraw();
      await txWithdraw.wait();

      await expect(() => txWithdraw).to.changeEtherBalance(owner, tokenAmount);
    });
  });
});
