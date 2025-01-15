const { ethers } = require("hardhat");
const { HardhatEthersSigner } = require("@nomicfoundation/hardhat-ethers/signers");
const { TokenForgeToken, TokenForgeToken__factory } = require("../typechain-types");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Déploiement des contrats avec le compte:", deployer.address);

  const TokenForge = await ethers.getContractFactory("TokenForgeToken");
  const tokenForge = await TokenForge.deploy(
    "TokenForge Token", // nom
    "TFT",             // symbole
    ethers.parseEther("1000000"), // supply total
    deployer.address,  // propriétaire
    true              // transferEnabled
  );

  await tokenForge.deployed();

  console.log("TokenForgeToken déployé à l'adresse:", tokenForge.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
