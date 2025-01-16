import { ethers } from "hardhat/ethers";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", await deployer.getAddress());

  // Configuration addresses
  const TREASURY_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // Adresse de test sur Sepolia
  const STAKING_POOL_ADDRESS = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" // Adresse de test sur Sepolia

  // Deploy TokenForgeToken
  const TokenForgeToken = await ethers.getContractFactory("TokenForgeToken");
  const token = await TokenForgeToken.deploy(
    TREASURY_ADDRESS,
    STAKING_POOL_ADDRESS
  );

  await token.waitForDeployment();
  console.log("TokenForgeToken deployed to:", await token.getAddress());

  // Deploy TokenForgeFactory
  const TokenForgeFactory = await ethers.getContractFactory("TokenForgeFactory");
  const factory = await TokenForgeFactory.deploy(
    await token.getAddress(),
    TREASURY_ADDRESS,
    STAKING_POOL_ADDRESS
  );

  await factory.waitForDeployment();
  console.log("TokenForgeFactory deployed to:", await factory.getAddress());

  // Deploy TokenForgeLaunchpad
  const TokenForgeLaunchpad = await ethers.getContractFactory("TokenForgeLaunchpad");
  const launchpad = await TokenForgeLaunchpad.deploy(
    await token.getAddress(),
    TREASURY_ADDRESS
  );

  await launchpad.waitForDeployment();
  console.log("TokenForgeLaunchpad deployed to:", await launchpad.getAddress());

  // Verify contracts on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contracts on Etherscan...");
    await verify(await token.getAddress(), [TREASURY_ADDRESS, STAKING_POOL_ADDRESS]);
    await verify(await factory.getAddress(), [await token.getAddress(), TREASURY_ADDRESS, STAKING_POOL_ADDRESS]);
    await verify(await launchpad.getAddress(), [await token.getAddress(), TREASURY_ADDRESS]);
  }

  // Configuration initiale
  console.log("\nConfiguring initial parameters...");

  // Ajuster le taux de taxe (0.3% au lieu de 0.5%)
  const newTaxRate = 30; // 0.3%
  const setTaxRateTx = await token.setTaxRate(newTaxRate);
  await setTaxRateTx.wait();
  console.log("Tax rate set to:", newTaxRate/100, "%");

  // Configurer les adresses exemptées
  const exemptAddresses = [
    await deployer.getAddress(), // Le déployeur
    TREASURY_ADDRESS, // Le treasury
    STAKING_POOL_ADDRESS, // Le pool de staking
    "0x..." // Autres adresses à exempter (à remplacer)
  ];

  for (const address of exemptAddresses) {
    const setExemptTx = await token.connect(deployer).setExemptStatus(address, true);
    await setExemptTx.wait();
    console.log("Address exempted from taxes:", address);
  }

  console.log("\nInitial configuration completed!");
  console.log("\nContract deployment and configuration summary:");
  console.log("-------------------------------------------");
  console.log("Token Address:", await token.getAddress());
  console.log("Treasury:", TREASURY_ADDRESS);
  console.log("Staking Pool:", STAKING_POOL_ADDRESS);
  console.log("Tax Rate:", newTaxRate/100, "%");
}

async function verify(contractAddress: string, args: any[]) {
  try {
    const hre = require("hardhat");
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.error(e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
