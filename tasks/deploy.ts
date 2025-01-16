const { task } = require("hardhat/config");
require("@nomicfoundation/hardhat-ethers");
const { TokenForgeToken__factory, TokenForgeFactory__factory, TokenForgeLaunchpad__factory } = require("../typechain-types");

task("deploy", "Deploy the TokenForge contracts")
  .setAction(async (args: any, hre: any) => {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", await deployer.getAddress());

    // Configuration addresses
    const TREASURY_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Test address on Sepolia
    const STAKING_POOL_ADDRESS = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Test address on Sepolia
    const PLATFORM_FEE = 500; // 5% platform fee

    try {
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
      const factoryAddress = await factory.getAddress();
      console.log("TokenForgeFactory deployed to:", factoryAddress);

      // Deploy TokenForgeLaunchpad with platform fee
      const TokenForgeLaunchpad = new TokenForgeLaunchpad__factory(deployer);
      const launchpad = await TokenForgeLaunchpad.deploy(PLATFORM_FEE);

      await launchpad.waitForDeployment();
      const launchpadAddress = await launchpad.getAddress();
      console.log("TokenForgeLaunchpad deployed to:", launchpadAddress);

      // Configuration summary
      console.log("\nContract deployment and configuration summary:");
      console.log("-------------------------------------------");
      console.log("Token Address:", tokenAddress);
      console.log("Factory Address:", factoryAddress);
      console.log("Launchpad Address:", launchpadAddress);
      console.log("Treasury:", TREASURY_ADDRESS);
      console.log("Staking Pool:", STAKING_POOL_ADDRESS);
      console.log("Platform Fee:", PLATFORM_FEE / 100, "%");

      // Verify contracts on non-local networks
      if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
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

          await hre.run("verify:verify", {
            address: factoryAddress,
            constructorArguments: [
              tokenAddress,
              TREASURY_ADDRESS,
              STAKING_POOL_ADDRESS
            ],
          });
          console.log("TokenForgeFactory verified successfully");

          await hre.run("verify:verify", {
            address: launchpadAddress,
            constructorArguments: [PLATFORM_FEE],
          });
          console.log("TokenForgeLaunchpad verified successfully");
        } catch (error) {
          console.error("Error during contract verification:", error);
        }
      }
    } catch (error) {
      console.error("Error during deployment:", error);
      throw error;
    }
  });
