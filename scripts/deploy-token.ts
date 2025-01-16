import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { TokenForgeToken__factory, TokenForgeFactory__factory, TokenForgeLaunchpad__factory } from "../typechain-types";

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  console.log("Deploying contracts with the account:", await deployer.getAddress());

  // Configuration addresses
  const TREASURY_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Adresse de test sur Sepolia
  const STAKING_POOL_ADDRESS = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Adresse de test sur Sepolia

  // Deploy TokenForgeToken
  const TokenForgeToken = new TokenForgeToken__factory(deployer);
  const token = await TokenForgeToken.deploy(
    "TokenForge",                  // name
    "TKN",                        // symbol
    18,                          // decimals
    BigInt("1000000000000000000000000"), // initialSupply (1 million tokens)
    BigInt("10000000000000000000000"),   // maxTxAmount (10k tokens)
    BigInt("50000000000000000000000"),   // maxWalletSize (50k tokens)
    500,                         // taxFee (5%)
    TREASURY_ADDRESS             // taxDistributor
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("TokenForgeToken deployed to:", tokenAddress);

  // Deploy TokenForgeFactory
  const TokenForgeFactory = new TokenForgeFactory__factory(deployer);
  const factory = await TokenForgeFactory.deploy(
    tokenAddress,
    TREASURY_ADDRESS,
    STAKING_POOL_ADDRESS
  );

  await factory.waitForDeployment();
  console.log("TokenForgeFactory deployed to:", await factory.getAddress());

  // Deploy TokenForgeLaunchpad
  const TokenForgeLaunchpad = new TokenForgeLaunchpad__factory(deployer);
  const launchpad = await TokenForgeLaunchpad.deploy(
    tokenAddress,
    TREASURY_ADDRESS
  );

  await launchpad.waitForDeployment();
  console.log("TokenForgeLaunchpad deployed to:", await launchpad.getAddress());

  // Configuration initiale
  console.log("\nConfiguring initial settings...");

  // Définir les adresses exemptées de taxes
  const exemptAddresses = [
    await deployer.getAddress(),
    TREASURY_ADDRESS,
    STAKING_POOL_ADDRESS
  ];

  // Appliquer les configurations
  for (const address of exemptAddresses) {
    const tx = await token.excludeFromTax(address, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", { 
      from: await deployer.getAddress() 
    });
    await tx.wait();
    console.log("Address exempted from taxes:", address);
  }

  console.log("\nInitial configuration completed!");
  console.log("\nContract deployment and configuration summary:");
  console.log("-------------------------------------------");
  console.log("Token Address:", tokenAddress);
  console.log("Treasury:", TREASURY_ADDRESS);
  console.log("Staking Pool:", STAKING_POOL_ADDRESS);
}

async function verify(contractAddress: string, args: any[]) {
  try {
    await ethers.run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
