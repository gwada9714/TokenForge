import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TokenForgeToken__factory, TokenForgeFactory__factory, TokenForgeLaunchpad__factory } from "../typechain-types";
import "@nomicfoundation/hardhat-ethers";
import { task } from "hardhat/config";
import * as hre from "hardhat";

task("deploy", "Deploy the TokenForge contracts")
  .setAction(async (args: any, hre: HardhatRuntimeEnvironment) => {
    const [deployer] = await hre.ethers.getSigners();
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
      await factory.getAddress()
    );

    await launchpad.waitForDeployment();
    console.log("TokenForgeLaunchpad deployed to:", await launchpad.getAddress());

    // Configuration initiale
    console.log("\nConfiguring initial settings...");

    // Note: Le contrat TokenForgeToken gère automatiquement l'exemption des frais pour le owner
    // Les autres adresses importantes (TREASURY_ADDRESS, STAKING_POOL_ADDRESS) sont déjà configurées
    // lors du déploiement du contrat

    console.log("Initial configuration completed");
    console.log("\nContract deployment and configuration summary:");
    console.log("-------------------------------------------");
    console.log("Token Address:", tokenAddress);
    console.log("Treasury:", TREASURY_ADDRESS);
    console.log("Staking Pool:", STAKING_POOL_ADDRESS);

    // Verify contracts
    if (hre.network.name !== "hardhat") {
      console.log("\nVerifying contracts...");
      
      try {
        await hre.run("verify:verify", {
          address: tokenAddress,
          constructorArguments: [
            "TokenForge",
            "TKN",
            18,
            BigInt("1000000000000000000000000"),
            BigInt("10000000000000000000000"),
            BigInt("50000000000000000000000"),
            500,
            TREASURY_ADDRESS
          ],
        });
        console.log("TokenForgeToken verified successfully");
      } catch (error) {
        console.error("Error verifying TokenForgeToken:", error);
      }
    }
  });

// Script principal
async function main() {
  await hre.run("deploy");
}

// Exécution du script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
