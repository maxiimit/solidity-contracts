import { expect } from "chai";
import { ethers } from "hardhat";
import { Voiting } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Voiting", () => {
  const deployFixture = async () => {
    const Voiting = await ethers.getContractFactory("Voiting");
    const voiting = (await Voiting.deploy()) as Voiting;

    const [owner, other] = await ethers.getSigners();

    return { voiting, owner, other };
  };

  describe("Deployment", () => {
    it("Should deploy with right owner", async () => {
      const { voiting, owner } = await loadFixture(deployFixture);

      expect(await voiting.admin()).to.equal(owner);
    });

    it("Should deploy with init phase", async () => {
      const { voiting } = await loadFixture(deployFixture);

      expect(await voiting.currentPhase()).to.equal(1);
    });
  });

  describe("Vote", () => {
    it("Should add candidate", async () => {
      const { voiting, owner, other } = await loadFixture(deployFixture);

      expect(voiting.connect(other).addCandidates("name")).to.revertedWith(
        "Only admin can do this"
      );

      await voiting.connect(owner).addCandidates("name");

      const [name, voteCount] = await voiting.candidateList(0);

      expect(name).to.equal(name);
      expect(voteCount).to.equal(0);
    });

    it("Should vote", async () => {
      const { voiting, owner, other } = await loadFixture(deployFixture);

      await voiting.connect(owner).addCandidates("name");

      await voiting.connect(other).vote("name");

      const [name, voteCount] = await voiting.candidateList(0);

      expect(name).to.equal("name");
      expect(voteCount).to.equal(1);
      expect(voiting.connect(other).vote("name")).to.revertedWith(
        "You already voted"
      );
      expect(voiting.connect(other).vote("name2")).to.revertedWith(
        "No such candidate"
      );
    });

    it("Should finish voiting", async () => {
      const { voiting, owner, other } = await loadFixture(deployFixture);

      expect(voiting.connect(other).finishVote()).to.revertedWith(
        "Only admin can do this"
      );

      await voiting.connect(owner).finishVote();

      expect(await voiting.currentPhase()).to.equal(2);
    });

    it("Should get winner", async () => {
      const { voiting, owner, other } = await loadFixture(deployFixture);

      expect(await voiting.getCandidateCount()).to.equal(0);

      expect(voiting.connect(owner).getWinner()).to.revertedWith(
        "No candidates"
      );

      expect(voiting.connect(other).getWinner()).to.revertedWith(
        "Only admin can do this"
      );

      await voiting.connect(owner).addCandidates("name");
      await voiting.connect(owner).addCandidates("name2");
      await voiting.connect(other).vote("name");

      expect(voiting.connect(owner).getWinner()).to.revertedWith(
        "Phase must be ended before get winner!"
      );

      await voiting.connect(owner).finishVote();

      expect(await voiting.connect(owner).getWinner()).to.deep.equal([
        "name",
        1,
      ]);
    });
  });
});
