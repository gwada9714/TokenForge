export const CUSTOM_ERC20_ABI = [
  {
    "inputs": [
      { "name": "name", "type": "string" },
      { "name": "symbol", "type": "string" },
      { "name": "initialSupply", "type": "uint256" },
      { "name": "isMintable", "type": "bool" },
      { "name": "isBurnable", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "type": "string", "name": "" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "type": "string", "name": "" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "type": "uint8", "name": "" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "type": "uint256", "name": "" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "type": "uint256", "name": "" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "type": "bool", "name": "" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isMintable",
    "outputs": [{ "type": "bool", "name": "" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isBurnable",
    "outputs": [{ "type": "bool", "name": "" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
