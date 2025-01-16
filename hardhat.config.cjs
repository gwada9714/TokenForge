require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
          viaIR: true
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    root: ".",
  },
  // Configure the resolver to find OpenZeppelin contracts
  resolver: {
    paths: [
      "node_modules",
      "node_modules/@openzeppelin/contracts"
    ]
  }
};
