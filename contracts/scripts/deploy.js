const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying NFTPassport with account:", deployer.address);

  const NFTPassport = await ethers.getContractFactory("NFTPassport");
  const nftPassport = await NFTPassport.deploy(deployer.address);
  await nftPassport.waitForDeployment();

  const contractAddress = await nftPassport.getAddress();
  console.log("NFTPassport deployed to:", contractAddress);
  console.log("Owner:", deployer.address);

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
