export const TokenFactoryABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "tokenType",
            type: "string",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "uint8",
            name: "decimals",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "initialSupply",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "burnable",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "mintable",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pausable",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "upgradeable",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "transparent",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "uups",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "permit",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "votes",
            type: "bool",
          },
          {
            internalType: "string",
            name: "accessControl",
            type: "string",
          },
          {
            internalType: "string",
            name: "baseURI",
            type: "string",
          },
          {
            internalType: "address",
            name: "asset",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "maxSupply",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "depositLimit",
            type: "uint256",
          },
        ],
        internalType: "struct TokenFactory.TokenConfig",
        name: "config",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "initData",
        type: "bytes",
      },
    ],
    name: "deployToken",
    outputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "proxyAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "proxyAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "tokenType",
        type: "string",
      },
    ],
    name: "TokenCreated",
    type: "event",
  },
] as const;
