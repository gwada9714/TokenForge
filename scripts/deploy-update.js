const hre = require("hardhat");

async function main() {
  console.log("Déploiement de la mise à jour du contrat TokenForgeFactory...");

  const tknToken = "0x6829C3fAdcD7a68f613b9d68a1ed873d5C2E745d";
  const treasury = "0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A";
  const taxSystem = "0x37A15951Ac7d8b24A0bB9c3Eb5fB788866238EcA";

  console.log("Adresses utilisées :");
  console.log(`TKN Token: ${tknToken}`);
  console.log(`Treasury: ${treasury}`);
  console.log(`Tax System: ${taxSystem}`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Déploiement depuis l'adresse : ${deployer.address}`);

  const TokenForgeFactory = await hre.ethers.getContractFactory(
    "TokenForgeFactory"
  );
  console.log("Déploiement du contrat...");

  try {
    const factory = await TokenForgeFactory.deploy(
      tknToken,
      treasury,
      taxSystem
    );
    console.log("Contrat déployé !");
    console.log(`Adresse du contrat : ${await factory.getAddress()}`);

    console.log("Attente de la confirmation...");
    await factory.waitForDeployment();

    const deployedAddress = await factory.getAddress();
    console.log(`Adresse finale du contrat : ${deployedAddress}`);

    console.log("Attente avant vérification...");
    await new Promise((r) => setTimeout(r, 30000));

    try {
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [tknToken, treasury, taxSystem],
      });
      console.log("Contrat vérifié sur Etherscan !");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("Le contrat est déjà vérifié");
      } else {
        console.error("Erreur de vérification:", error);
      }
    }
  } catch (error) {
    console.error("Erreur lors du déploiement:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur critique:", error);
    process.exit(1);
  });
