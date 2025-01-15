import * as hardhat from "hardhat";

async function main() {
  const [deployer] = await hardhat.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Configuration addresses
  const TREASURY_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // Adresse de test sur Sepolia
  const STAKING_POOL_ADDRESS = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" // Adresse de test sur Sepolia

  // Deploy TokenForgeToken
  const TokenForgeToken = await hardhat.ethers.getContractFactory("TokenForgeToken");
  const token = await TokenForgeToken.deploy(
    TREASURY_ADDRESS,
    STAKING_POOL_ADDRESS
  );

  await token.deployed();
  console.log("TokenForgeToken deployed to:", token.address);

  // Configuration initiale
  console.log("\nConfiguring initial parameters...");

  // Ajuster le taux de taxe (0.3% au lieu de 0.5%)
  const newTaxRate = 30; // 0.3%
  const setTaxRateTx = await token.connect(deployer).functions["setTaxRate"](newTaxRate);
  await setTaxRateTx.wait();
  console.log("Tax rate set to:", newTaxRate/100, "%");

  // Configurer les adresses exemptées
  const exemptAddresses = [
    deployer.address, // Le déployeur
    TREASURY_ADDRESS, // Le treasury
    STAKING_POOL_ADDRESS, // Le pool de staking
    "0x..." // Autres adresses à exempter (à remplacer)
  ];

  for (const address of exemptAddresses) {
    const setExemptTx = await token.connect(deployer).functions["setExemptStatus"](address, true);
    await setExemptTx.wait();
    console.log("Address exempted from taxes:", address);
  }

  console.log("\nInitial configuration completed!");
  console.log("\nContract deployment and configuration summary:");
  console.log("-------------------------------------------");
  console.log("Token Address:", token.address);
  console.log("Treasury:", TREASURY_ADDRESS);
  console.log("Staking Pool:", STAKING_POOL_ADDRESS);
  console.log("Tax Rate:", newTaxRate/100, "%");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
