const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("Déploiement des contrats avec le compte:", deployerAddress);

  // Pour le moment, nous utilisons l'adresse du déployeur pour tous les rôles
  const teamWallet = deployerAddress;
  const marketingWallet = deployerAddress;
  const ecosystemWallet = deployerAddress;

  // Déploiement du TokenForgeTKN
  console.log("Déploiement du TokenForgeTKN...");
  const TokenForgeTKN = await ethers.getContractFactory("TokenForgeTKN");
  const tknToken = await TokenForgeTKN.deploy(
    teamWallet,
    marketingWallet,
    ecosystemWallet
  );
  await tknToken.waitForDeployment();
  const tknTokenAddress = await tknToken.getAddress();
  console.log("TokenForgeTKN déployé à:", tknTokenAddress);

  // Déploiement du TokenForgeTaxSystem
  console.log("Déploiement du TokenForgeTaxSystem...");
  const TokenForgeTaxSystem = await ethers.getContractFactory("TokenForgeTaxSystem");
  const taxSystem = await TokenForgeTaxSystem.deploy(deployerAddress);
  await taxSystem.waitForDeployment();
  const taxSystemAddress = await taxSystem.getAddress();
  console.log("TokenForgeTaxSystem déployé à:", taxSystemAddress);

  // Déploiement du TokenForgeFactory
  console.log("Déploiement du TokenForgeFactory...");
  const TokenForgeFactory = await ethers.getContractFactory("TokenForgeFactory");
  const factory = await TokenForgeFactory.deploy(
    tknTokenAddress,    // _tknToken
    deployerAddress,    // _treasury (utilisons l'adresse du déployeur comme trésorerie pour le moment)
    taxSystemAddress    // _taxSystem
  );

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("TokenForgeFactory déployé à:", factoryAddress);

  // Transférer des TKN à l'adresse du déployeur pour les tests
  console.log("Transfert de TKN au déployeur pour les tests...");
  const transferAmount = "1000000000000000000000"; // 1000 TKN (18 décimales)
  const tx = await tknToken.transfer(deployerAddress, transferAmount);
  await tx.wait();
  console.log(`${transferAmount} TKN transférés à ${deployerAddress}`);

  // Afficher les adresses des contrats déployés
  console.log("-------------------------");
  console.log("Contrats déployés :");
  console.log("-------------------------");
  console.log("TokenForgeTKN:", tknTokenAddress);
  console.log("TokenForgeTaxSystem:", taxSystemAddress);
  console.log("TokenForgeFactory:", factoryAddress);
  console.log("-------------------------");

  // Vérification des contrats sur Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Vérification des contrats sur Etherscan...");
  
    await verifyContract(tknTokenAddress, [teamWallet, marketingWallet, ecosystemWallet]);
    await verifyContract(taxSystemAddress, [deployerAddress]);
    await verifyContract(factoryAddress, [tknTokenAddress, deployerAddress, taxSystemAddress]);
  }
}

async function verifyContract(address, constructorArguments) {
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
    });
    console.log(`Contrat vérifié avec succès à l'adresse ${address}`);
  } catch (error) {
    console.log(`Erreur lors de la vérification du contrat à l'adresse ${address}:`, error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
