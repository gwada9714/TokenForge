export const TokenForgePlansABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum TokenForgePlans.PlanType",
        "name": "planType",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "PlanPurchased",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "enum TokenForgePlans.PlanType",
        "name": "planType",
        "type": "uint8"
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
        "internalType": "enum TokenForgePlans.PlanType",
        "name": "planType",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "newPrice",
        "type": "uint256"
      }
    ],
    "name": "updatePlanPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
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
        "internalType": "enum TokenForgePlans.PlanType",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const LiquidityLockerABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "unlockTime",
        "type": "uint256"
      }
    ],
    "name": "LiquidityLocked",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lockDuration",
        "type": "uint256"
      }
    ],
    "name": "lockLiquidity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "lockIndex",
        "type": "uint256"
      }
    ],
    "name": "unlockLiquidity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "getLocks",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "unlockTime",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isWithdrawn",
            "type": "bool"
          }
        ],
        "internalType": "struct LiquidityLocker.Lock[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Staking Contract ABI
export const stakingABI = [
  {
    "inputs": [{"internalType": "address","name": "_stakingToken","type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "uint256","name": "_amount","type": "uint256"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "_amount","type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_user","type": "address"}],
    "name": "calculateRewards",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_user","type": "address"}],
    "name": "getUserStake",
    "outputs": [
      {"internalType": "uint256","name": "amount","type": "uint256"},
      {"internalType": "uint256","name": "since","type": "uint256"},
      {"internalType": "uint256","name": "claimedRewards","type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPoolInfo",
    "outputs": [
      {"internalType": "uint256","name": "totalStaked","type": "uint256"},
      {"internalType": "uint256","name": "rewardRate","type": "uint256"},
      {"internalType": "uint256","name": "lastUpdateTime","type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Launchpad Contract ABI
export const launchpadABI = [
  {
    "inputs": [{"internalType": "address","name": "_platformToken","type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "address","name": "_token","type": "address"},
      {"internalType": "uint256","name": "_tokenPrice","type": "uint256"},
      {"internalType": "uint256","name": "_hardCap","type": "uint256"},
      {"internalType": "uint256","name": "_softCap","type": "uint256"},
      {"internalType": "uint256","name": "_minContribution","type": "uint256"},
      {"internalType": "uint256","name": "_maxContribution","type": "uint256"},
      {"internalType": "uint256","name": "_startTime","type": "uint256"},
      {"internalType": "uint256","name": "_endTime","type": "uint256"}
    ],
    "name": "createPool",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "_poolId","type": "uint256"}],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "_poolId","type": "uint256"}],
    "name": "finalizePool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "_poolId","type": "uint256"}],
    "name": "cancelPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "_poolId","type": "uint256"}],
    "name": "claimTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "_poolId","type": "uint256"}],
    "name": "claimRefund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "_poolId","type": "uint256"}],
    "name": "getPoolInfo",
    "outputs": [
      {"internalType": "address","name": "token","type": "address"},
      {"internalType": "uint256","name": "tokenPrice","type": "uint256"},
      {"internalType": "uint256","name": "hardCap","type": "uint256"},
      {"internalType": "uint256","name": "softCap","type": "uint256"},
      {"internalType": "uint256","name": "totalRaised","type": "uint256"},
      {"internalType": "uint256","name": "startTime","type": "uint256"},
      {"internalType": "uint256","name": "endTime","type": "uint256"},
      {"internalType": "bool","name": "finalized","type": "bool"},
      {"internalType": "bool","name": "cancelled","type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "_poolId","type": "uint256"},
      {"internalType": "address","name": "_contributor","type": "address"}
    ],
    "name": "getContribution",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolCount",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];
