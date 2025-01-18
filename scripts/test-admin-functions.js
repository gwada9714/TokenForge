const hre = require("hardhat");

async function main() {
  // Utiliser la nouvelle adresse du contrat déployé
  const contractAddress = "0x7B0a208A773b7C2aD925Be156d8b25F8695107D9";
  console.log(`Test du contrat à l'adresse : ${contractAddress}`);

  const TokenForgeFactory = await hre.ethers.getContractFactory("TokenForgeFactory");
  const contract = TokenForgeFactory.attach(contractAddress);

  try {
    console.log("\n1. Vérification du propriétaire");
    const owner = await contract.owner();
    console.log(`Propriétaire actuel : ${owner}`);
    
    const [signer] = await hre.ethers.getSigners();
    console.log(`Votre adresse : ${signer.address}`);
    
    if (owner.toLowerCase() === signer.address.toLowerCase()) {
      console.log("✅ Vous êtes le propriétaire du contrat");
    } else {
      console.log("❌ Vous n'êtes pas le propriétaire du contrat");
    }
  } catch (error) {
    console.error("Erreur lors des tests:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
