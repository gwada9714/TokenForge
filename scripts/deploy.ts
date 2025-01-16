import { HardhatRuntimeEnvironment } from 'hardhat/types';
import * as hre from 'hardhat';
import { parseEther } from 'ethers';

// @ts-ignore: Hardhat Runtime Environment's members are not typed properly
const ethers = hre.ethers;

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
  const transferAmount = parseEther("1000"); // 1000 TKN pour les tests
  const tx = await tknToken.transfer(deployerAddress, transferAmount);
  await tx.wait();
  console.log(`${transferAmount} TKN transférés à ${deployerAddress}`);

  // Vérification des contrats sur Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Vérification des contrats sur Etherscan...");
    
    console.log("Vérification de TokenForgeTKN...");
    await verifyContract(tknTokenAddress, [teamWallet, marketingWallet, ecosystemWallet]);
    
    console.log("Vérification de TokenForgeTaxSystem...");
    await verifyContract(taxSystemAddress, [deployerAddress]);
    
    console.log("Vérification de TokenForgeFactory...");
    await verifyContract(factoryAddress, [tknTokenAddress, deployerAddress, taxSystemAddress]);
    
    console.log("Tous les contrats ont été vérifiés sur Etherscan");
  }

  // Afficher un résumé des déploiements
  console.log("\nRésumé des déploiements:");
  console.log("-------------------------");
  console.log("TokenForgeTKN:", tknTokenAddress);
  console.log("TokenForgeTaxSystem:", taxSystemAddress);
  console.log("TokenForgeFactory:", factoryAddress);
  console.log("-------------------------");
}

async function verifyContract(address: string, constructorArguments: any[]) {
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Le contrat est déjà vérifié!");
    } else {
      console.error("Erreur lors de la vérification:", error);
      throw error;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
