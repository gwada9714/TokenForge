import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { parseEther } from 'ethers';
import * as hre from 'hardhat';

// @ts-ignore: Hardhat Runtime Environment's members are not typed properly
const ethers = hre.ethers;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Déploiement des contrats avec le compte:", await deployer.getAddress());

  // Déploiement du TokenForgeToken
  const TokenForgeFactory = await ethers.getContractFactory("TokenForgeToken");
  const tokenForge = await TokenForgeFactory.deploy(
    "TokenForge Token",        // nom
    "TFT",                     // symbole
    18,                        // decimals
    parseEther("1000000"),     // supply total
    await deployer.getAddress(), // propriétaire
    true,                      // burnable
    true,                      // mintable
    true                       // pausable
  );

  await tokenForge.waitForDeployment();
  console.log("TokenForgeToken déployé à:", await tokenForge.getAddress());

  // Déploiement du TokenForgePlans
  const PlansFactory = await ethers.getContractFactory("TokenForgePlans");
  const plans = await PlansFactory.deploy(
    await tokenForge.getAddress(),
    parseEther("100"),      // Prix du plan Basic
    parseEther("500"),      // Prix du plan Pro
    parseEther("1000"),     // Prix du plan Enterprise
    await deployer.getAddress()
  );

  await plans.waitForDeployment();
  console.log("TokenForgePlans déployé à:", await plans.getAddress());

  // Déploiement du TokenForgeLaunchpad
  const LaunchpadFactory = await ethers.getContractFactory("TokenForgeLaunchpad");
  const launchpad = await LaunchpadFactory.deploy(
    await tokenForge.getAddress(),
    await plans.getAddress(),
    parseEther("0.1"),     // Frais minimum
    parseEther("10"),      // Frais maximum
    500,                   // 5% de frais par défaut
    await deployer.getAddress()
  );

  await launchpad.waitForDeployment();
  console.log("TokenForgeLaunchpad déployé à:", await launchpad.getAddress());

  // Configuration des rôles
  const MINTER_ROLE = await tokenForge.MINTER_ROLE();
  await tokenForge.grantRole(MINTER_ROLE, await plans.getAddress());
  console.log("Rôle MINTER accordé à TokenForgePlans");

  await tokenForge.grantRole(MINTER_ROLE, await launchpad.getAddress());
  console.log("Rôle MINTER accordé à TokenForgeLaunchpad");

  // Vérification des contrats
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Vérification des contrats sur Etherscan...");
    await verifyContract(await tokenForge.getAddress(), [
      "TokenForge Token", "TFT", 18, parseEther("1000000"),
      await deployer.getAddress(), true, true, true
    ]);
    await verifyContract(await plans.getAddress(), [
      await tokenForge.getAddress(), parseEther("100"),
      parseEther("500"), parseEther("1000"), await deployer.getAddress()
    ]);
    await verifyContract(await launchpad.getAddress(), [
      await tokenForge.getAddress(), await plans.getAddress(),
      parseEther("0.1"), parseEther("10"), 500, await deployer.getAddress()
    ]);
  }
}

async function verifyContract(address: string, constructorArguments: any[]) {
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
    });
    console.log("Contrat vérifié:", address);
  } catch (e) {
    console.log("Erreur de vérification pour", address, e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
