const { task } = require("hardhat/config");
require("@nomicfoundation/hardhat-ethers");

task("deploy", "Deploy the TokenForge contracts")
  .setAction(async (args, hre) => {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", await deployer.getAddress());

    // Configuration addresses
    const TREASURY_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Test address on Sepolia
    const DEVELOPMENT_ADDRESS = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Test address on Sepolia
    const BUYBACK_ADDRESS = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"; // Test address on Sepolia
    const STAKING_ADDRESS = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"; // Test address on Sepolia

    try {
      // Deploy TokenForgeToken
      const TokenForgeToken = await hre.ethers.getContractFactory("TokenForgeToken");
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

      // Deploy TaxDistributor
      const TaxDistributor = await hre.ethers.getContractFactory("TaxDistributor");
      const taxDistributor = await TaxDistributor.deploy(
        TREASURY_ADDRESS,
        DEVELOPMENT_ADDRESS,
        BUYBACK_ADDRESS,
        STAKING_ADDRESS
      );
      await taxDistributor.waitForDeployment();
      const taxDistributorAddress = await taxDistributor.getAddress();
      console.log("TaxDistributor deployed to:", taxDistributorAddress);

      // Deploy TokenForgeFactory
      const TokenForgeFactory = await hre.ethers.getContractFactory("TokenForgeFactory");
      const factory = await TokenForgeFactory.deploy(
        tokenAddress,
        TREASURY_ADDRESS,
        taxDistributorAddress
      );

      await factory.waitForDeployment();
      const factoryAddress = await factory.getAddress();
      console.log("TokenForgeFactory deployed to:", factoryAddress);

      // Deploy TokenForgeLaunchpad
      const TokenForgeLaunchpad = await hre.ethers.getContractFactory("TokenForgeLaunchpad");
      const launchpad = await TokenForgeLaunchpad.deploy(
        500 // Platform fee of 5%
      );

      await launchpad.waitForDeployment();
      const launchpadAddress = await launchpad.getAddress();
      console.log("TokenForgeLaunchpad deployed to:", launchpadAddress);

      console.log("\nContract deployment summary:");
      console.log("-------------------------------------------");
      console.log("Token Address:", tokenAddress);
      console.log("Tax Distributor Address:", taxDistributorAddress);
      console.log("Factory Address:", factoryAddress);
      console.log("Launchpad Address:", launchpadAddress);
      console.log("Treasury:", TREASURY_ADDRESS);
      console.log("Development:", DEVELOPMENT_ADDRESS);
      console.log("Buyback:", BUYBACK_ADDRESS);
      console.log("Staking:", STAKING_ADDRESS);

    } catch (error) {
      console.error("Error during deployment:", error);
      throw error;
    }
  });
