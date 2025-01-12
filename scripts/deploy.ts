import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Déployer le stablecoin (en production, utiliser l'adresse réelle)
    const USDT_ADDRESS = "0x..."; // Adresse du stablecoin sur le réseau cible
    const CREATION_FEE = ethers.utils.parseUnits("100", 6); // 100 USDT

    // Déployer TokenForgeFactory
    const TokenForgeFactory = await ethers.getContractFactory("TokenForgeFactory");
    const factory = await TokenForgeFactory.deploy(USDT_ADDRESS, CREATION_FEE);
    await factory.deployed();

    console.log("TokenForgeFactory deployed to:", factory.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 