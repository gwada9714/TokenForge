import { type Abi } from "viem";

export const TKNTokenABI = [
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "getStakeInfo",
    outputs: [
      { name: "amount", type: "uint256" },
      { name: "lastStakeTime", type: "uint256" },
      { name: "rewards", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStakingStats",
    outputs: [
      { name: "totalStaked", type: "uint256" },
      { name: "totalStakers", type: "uint256" },
      { name: "rewardRate", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const satisfies Abi;
