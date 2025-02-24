require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", await deployer.getAddress());

  // Configuration addresses from .env
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
  const TAX_SYSTEM_ADDRESS = process.env.TAX_SYSTEM_ADDRESS;
  const TKN_TOKEN_ADDRESS = process.env.TKN_TOKEN_ADDRESS;

  if (!TREASURY_ADDRESS || !TAX_SYSTEM_ADDRESS || !TKN_TOKEN_ADDRESS) {
    throw new Error("Missing required environment variables");
  }

  try {
    // Get the ContractFactory
    const TokenForgeFactory = await hre.ethers.getContractFactory("TokenForgeFactory");
    
    console.log("Deploying TokenForgeFactory with parameters:");
    console.log("TKN Token:", TKN_TOKEN_ADDRESS);
    console.log("Treasury:", TREASURY_ADDRESS);
    console.log("Tax System:", TAX_SYSTEM_ADDRESS);

    // Deploy the contract
    const factory = await TokenForgeFactory.deploy(
      TKN_TOKEN_ADDRESS,
      TREASURY_ADDRESS,
      TAX_SYSTEM_ADDRESS
    );

    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    
    console.log("TokenForgeFactory deployed to:", factoryAddress);
    console.log("Owner address:", TREASURY_ADDRESS);

    // Verify contract on Etherscan
    if (process.env.ETHERSCAN_API_KEY) {
      console.log("Waiting for a few block confirmations...");
      await factory.deploymentTransaction()?.wait(5);
      
      console.log("Verifying contract on Etherscan...");
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [
          TKN_TOKEN_ADDRESS,
          TREASURY_ADDRESS,
          TAX_SYSTEM_ADDRESS
        ],
      });
      console.log("Contract verified on Etherscan");
    }

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
