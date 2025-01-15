/// <reference path="../types/hardhat-runtime.d.ts" />

async function deployToken() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Déploiement des contrats avec le compte:", deployer.address);

  const TokenForge = await hre.ethers.getContractFactory("TokenForgeToken");
  const tokenForge = await TokenForge.deploy(
    "TokenForge Token",        // nom
    "TFT",                     // symbole
    18,                        // decimals (standard pour ERC20)
    hre.ethers.utils.parseEther("1000000"), // supply total
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
