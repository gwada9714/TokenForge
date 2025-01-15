import * as hardhat from "hardhat";
import { ethers } from "ethers";

async function main() {
  const [deployer] = await hardhat.ethers.getSigners() as unknown as ethers.Signer[];

  console.log("Déploiement des contrats avec le compte:", deployer.address);

  // Déploiement du TokenForgeToken
  const TokenForgeFactory = await hardhat.ethers.getContractFactory("TokenForgeToken");
  const tokenForge = await TokenForgeFactory.deploy(
    "TokenForge Token",        // nom
    "TFT",                     // symbole
    18,                        // decimals
    hardhat.ethers.utils.parseEther("1000000"), // supply total
    deployer.address,          // propriétaire
    true,                      // burnable
    true,                      // mintable
    true                       // pausable
  );

  await tokenForge.deployed();
  console.log("TokenForgeToken déployé à l'adresse:", tokenForge.address);

  // Déploiement du contrat de staking
  const StakingFactory = await hardhat.ethers.getContractFactory("TokenForgeStaking");
  const staking = await StakingFactory.deploy(tokenForge.address);
  
  await staking.deployed();
  console.log("TokenForgeStaking déployé à l'adresse:", staking.address);

  // Configuration initiale
  const MINTER_ROLE = hardhat.ethers.utils.id("MINTER_ROLE");
  await tokenForge.grantRole(MINTER_ROLE, staking.address);
  console.log("Rôle MINTER accordé au contrat de staking");

  // Désactiver la pause du contrat
  await tokenForge.unpause();
  console.log("Contrat TokenForgeToken déverrouillé");

  // Vérification des informations initiales
  const poolInfo = await staking.getPoolInfo();
  console.log("\nInformations du pool:", {
    totalStaked: hardhat.ethers.utils.formatEther(poolInfo[0]),
    rewardRate: poolInfo[1].toString(),
    lastUpdateTime: poolInfo[2].toString()
  });

  const userStake = await staking.getUserStake(deployer.address);
  console.log("User Stake initial:", {
    amount: hardhat.ethers.utils.formatEther(userStake[0]),
    since: userStake[1].toString(),
    claimedRewards: userStake[2].toString()
  });

  // Calculer les récompenses potentielles
  const rewards = await staking.calculateRewards(deployer.address);
  console.log("Calculated Rewards:", rewards.toString());

  // Effectuer un stake de test
  const stakeAmount = hardhat.ethers.utils.parseEther("100");
  await tokenForge.approve(staking.address, stakeAmount);
  await staking.stake(stakeAmount);
  console.log("\nStake de test effectué :", hardhat.ethers.utils.formatEther(stakeAmount), "tokens");

  // Vérifier à nouveau les informations
  const poolInfoAfter = await staking.getPoolInfo();
  console.log("\nInformations du pool après stake:", {
    totalStaked: hardhat.ethers.utils.formatEther(poolInfoAfter[0]),
    rewardRate: poolInfoAfter[1].toString(),
    lastUpdateTime: poolInfoAfter[2].toString()
  });

  const userStakeAfter = await staking.getUserStake(deployer.address);
  console.log("User Stake après stake:", {
    amount: hardhat.ethers.utils.formatEther(userStakeAfter[0]),
    since: userStakeAfter[1].toString(),
    claimedRewards: userStakeAfter[2].toString()
  });

  console.log("\nAdresses des contrats déployés :");
  console.log("TokenForgeToken:", tokenForge.address);
  console.log("TokenForgeStaking:", staking.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
