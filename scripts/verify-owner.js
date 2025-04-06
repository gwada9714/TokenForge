const hre = require("hardhat");

async function main() {
  const contractAddress = "0xB0B6ED3e12f9Bb24b1bBC3413E3bb374A6e8B2E5";
  const targetAddress = "0xc6E1...0f1A"; // Adresse à vérifier

  console.log("Vérification du propriétaire du contrat...");
  console.log(`Adresse du contrat: ${contractAddress}`);
  console.log(`Adresse à vérifier: ${targetAddress}`);

  const TokenForgeFactory = await hre.ethers.getContractFactory(
    "TokenForgeFactory"
  );
  const contract = TokenForgeFactory.attach(contractAddress);

  try {
    const owner = await contract.owner();
    console.log(`Propriétaire actuel: ${owner}`);

    const isPaused = await contract.paused();
    console.log(`État de pause: ${isPaused ? "En pause" : "Actif"}`);

    if (owner.toLowerCase() === targetAddress.toLowerCase()) {
      console.log("✅ L'adresse est bien le propriétaire du contrat");
    } else {
      console.log("❌ L'adresse n'est PAS le propriétaire du contrat");
    }
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
