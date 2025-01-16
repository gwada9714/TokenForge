require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  // Add remappings for OpenZeppelin contracts
  solc: {
    remappings: [
      '@openzeppelin/=node_modules/@openzeppelin/',
      '@openzeppelin/contracts/=node_modules/@openzeppelin/contracts/',
      '@openzeppelin/contracts-upgradeable/=node_modules/@openzeppelin/contracts-upgradeable/'
    ]
  }
};
