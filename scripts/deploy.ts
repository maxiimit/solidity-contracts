import { ethers } from "hardhat";
import { MShop } from "../typechain-types";

const main = async () => {
  const [signers] = await ethers.getSigners();

  const Erc = await ethers.getContractFactory("MShop", signers);
  const erc = (await Erc.deploy()) as MShop;

  await erc.waitForDeployment();

  console.log("address ==>", await erc.getAddress());
  console.log("token ====>", await erc.token());
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
