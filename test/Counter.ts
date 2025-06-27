import { expect } from "chai";
import { ethers } from "hardhat";
import { Counter } from "../typechain-types";

describe("Counter", function () {
  it("Should increment and decrement", async function () {
    const Counter = await ethers.getContractFactory("Counter");
    const counter = (await Counter.deploy()) as Counter;

    await counter.increment();
    expect(await counter.count()).to.equal(1);

    await counter.decrement();
    expect(await counter.count()).to.equal(0);
  });
});
