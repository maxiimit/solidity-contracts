import { expect } from "chai";
import { ethers } from "hardhat";
import { Wallet } from "../typechain-types";

describe("Wallet", function () {
  const getWalletInstance = async () => {
    const Wallet = await ethers.getContractFactory("Wallet");
    const wallet = (await Wallet.deploy()) as Wallet;

    return wallet;
  };

  it("Should get deposit and check balance", async function () {
    const wallet = await getWalletInstance();
    await wallet.deposit({ value: ethers.parseEther("1") });
    expect(await wallet.getMyBalance()).to.equal(ethers.parseEther("1"));
  });

  it("Should withdraw", async function () {
    const wallet = await getWalletInstance();
    const [owner, other] = await ethers.getSigners();

    await wallet.connect(owner).deposit({ value: ethers.parseEther("100") });

    const to = other.address;
    const amount = ethers.parseEther("50");

    const balanceBefore = await ethers.provider.getBalance(to);
    await wallet.connect(owner).withdraw(to, amount);
    const balanceAfter = await ethers.provider.getBalance(to);

    expect(balanceAfter - balanceBefore).to.equal(amount);
    expect(await wallet.connect(owner).getMyBalance()).to.equal(amount);

    expect(wallet.connect(other).withdraw(to, amount)).to.be.revertedWith(
      "Only owner can call this function"
    );
  });
});
