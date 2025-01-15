/// <reference path="../types/hardhat.d.ts" />
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function deployToken() {
  const [deployer] = await ethers.getSigners();

  console.log("Déploiement des contrats avec le compte:", deployer.address);

  const TokenForge = await ethers.getContractFactory("TokenForgeToken");
  const tokenForge = await TokenForge.deploy(
    "TokenForge Token",        // nom
    "TFT",                     // symbole
    18,                        // decimals (standard pour ERC20)
    ethers.utils.parseEther("1000000"), // supply total
    deployer.address,          // propriétaire
    true,                      // burnable
    true,                      // mintable
    false                      // pausable (false pour permettre les transferts immédiatement)
  );

  await tokenForge.deployed();

  console.log("TokenForgeToken déployé à l'adresse:", tokenForge.address);
}

if (require.main === module) {
  deployToken()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
