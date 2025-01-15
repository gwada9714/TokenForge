const hre = require("hardhat");

async function main() {
  const network = process.env.HARDHAT_NETWORK || "localhost";
  console.log(`Déploiement sur le réseau : ${network}`);

  try {
    // Factory de tokens
    const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
    const tokenFactory = await TokenFactory.deploy();
    await tokenFactory.waitForDeployment();
    
    console.log(`TokenFactory déployé sur ${network} à l'adresse:`, await tokenFactory.getAddress());

    // Locker de liquidité
    const LiquidityLocker = await hre.ethers.getContractFactory("LiquidityLocker");
    const liquidityLocker = await LiquidityLocker.deploy();
    await liquidityLocker.waitForDeployment();
    
    console.log(`LiquidityLocker déployé sur ${network} à l'adresse:`, await liquidityLocker.getAddress());

    // Plans TokenForge
    const TokenForgePlans = await hre.ethers.getContractFactory("TokenForgePlans");
    const tokenForgePlans = await TokenForgePlans.deploy();
    await tokenForgePlans.waitForDeployment();
    
    console.log(`TokenForgePlans déployé sur ${network} à l'adresse:`, await tokenForgePlans.getAddress());

    console.log(`\nDéploiement sur ${network} terminé avec succès!\n`);

    // Afficher un résumé des adresses pour faciliter la mise à jour du .env
    console.log(`Pour le réseau ${network}, ajoutez ces adresses à votre .env :`);
    console.log(`VITE_TOKEN_FACTORY_${network.toUpperCase()}=${await tokenFactory.getAddress()}`);
    console.log(`VITE_LIQUIDITY_LOCKER_${network.toUpperCase()}=${await liquidityLocker.getAddress()}`);
    console.log(`VITE_TOKEN_FORGE_PLANS_${network.toUpperCase()}=${await tokenForgePlans.getAddress()}`);
    
  } catch (error) {
    console.error(`Erreur lors du déploiement sur ${network}:`, error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
