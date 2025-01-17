require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Vérification des variables d'environnement requises
if (!process.env.VITE_SEPOLIA_RPC_URL) {
  throw new Error("VITE_SEPOLIA_RPC_URL manquante dans le fichier .env");
}

const PRIVATE_KEY = "73790c98a515e800ddb5ab6f86f5d1b003a3c217765230b7bc48d134eaacde58";

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
      url: process.env.VITE_SEPOLIA_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice: 3000000000, // 3 Gwei
      maxPriorityFeePerGas: 3000000000, // 3 Gwei
      maxFeePerGas: 3000000000 * 2, // 6 Gwei
    },
  },
  etherscan: {
    apiKey: "R7RM5MH93ADK3RUUZI193YXPTEHZ3WZH5V", // Votre clé API Etherscan
  },
  paths: {
    sources: "./contracts",
  }
};

module.exports = config;
