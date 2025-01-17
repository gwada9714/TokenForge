export const TokenForgePlansABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserPlan",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "planIndex",
        "type": "uint256"
      }
    ],
    "name": "purchasePlan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "planIndex",
        "type": "uint256"
      }
    ],
    "name": "purchasePlanWithToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
