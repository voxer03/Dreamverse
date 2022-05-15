
const hre = require("hardhat");

async function main() {

  // We get the contract to deploy
  const Market = await ethers.getContractFactory("Marketplace");
  const market = await Market.deploy();
  await market.deployed();

  
  const Dreamverse = await ethers.getContractFactory("Dreamverse");
  const dreamverse = await Dreamverse.deploy(market.address);
  await dreamverse.deployed();

 
  console.log("export const NFT_ADDRESS = ", dreamverse.address);
  console.log("export const MARKET_ADDRESS = ", market.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
