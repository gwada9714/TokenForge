const { HardhatUserConfig } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config({ path: '../.env' });

// Variables d'environnement optionnelles pour le déploiement
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    ...(SEPOLIA_RPC_URL && PRIVATE_KEY ? {
      sepolia: {
        url: SEPOLIA_RPC_URL,
        accounts: [PRIVATE_KEY],
        chainId: 11155111
      }
    } : {})
  }
};

module.exports = config;
