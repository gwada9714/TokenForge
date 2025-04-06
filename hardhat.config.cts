require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Vérification des variables d'environnement requises
if (!process.env.SEPOLIA_RPC_URL) {
  throw new Error("SEPOLIA_RPC_URL manquante dans le fichier .env");
}

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY manquante dans le fichier .env");
}

if (!process.env.ETHERSCAN_API_KEY) {
  throw new Error("ETHERSCAN_API_KEY manquante dans le fichier .env");
}

const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 3000000000, // 3 Gwei
      maxPriorityFeePerGas: 3000000000, // 3 Gwei
      maxFeePerGas: 3000000000 * 2, // 6 Gwei
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
  },
};

module.exports = config;
