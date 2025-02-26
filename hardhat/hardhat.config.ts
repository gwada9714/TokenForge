require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-viem");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();
require("ts-node/register");

// Variables d'environnement optionnelles pour le déploiement
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
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
  paths: {
    root: "..",
    sources: "./contracts",
    tests: "./src/__tests__/contracts",
    cache: "./hardhat/cache",
    artifacts: "./hardhat/artifacts"
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
  },
  mocha: {
    timeout: 40000,
    require: ["ts-node/register"],
    extension: [".ts"]
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6"
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};

module.exports = config;
