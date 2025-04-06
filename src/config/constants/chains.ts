import { NetworkConfig, SupportedChains } from "@/features/auth/types/wallet";

export const SUPPORTED_CHAINS: SupportedChains = {
  ETHEREUM: {
    id: 1,
    name: "Ethereum Mainnet",
    config: {
      chainId: 1,
      name: "Ethereum",
      rpcUrls: ["https://eth-mainnet.g.alchemy.com/v2"],
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      blockExplorers: {
        default: {
          name: "Etherscan",
          url: "https://etherscan.io",
        },
      },
    },
  },
  POLYGON: {
    id: 137,
    name: "Polygon Mainnet",
    config: {
      chainId: 137,
      name: "Polygon",
      rpcUrls: ["https://polygon-rpc.com"],
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      blockExplorers: {
        default: {
          name: "PolygonScan",
          url: "https://polygonscan.com",
        },
      },
    },
  },
  ARBITRUM: {
    id: 42161,
    name: "Arbitrum One",
    config: {
      chainId: 42161,
      name: "Arbitrum",
      rpcUrls: ["https://arb1.arbitrum.io/rpc"],
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      blockExplorers: {
        default: {
          name: "Arbiscan",
          url: "https://arbiscan.io",
        },
      },
    },
  },
};

export const DEFAULT_CHAIN = SUPPORTED_CHAINS.ETHEREUM;

export const CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
} as const;

export const isChainSupported = (chainId: number): boolean => {
  return Object.values(SUPPORTED_CHAINS).some((chain) => chain.id === chainId);
};

export const getChainConfig = (chainId: number): NetworkConfig | undefined => {
  const chain = Object.values(SUPPORTED_CHAINS).find(
    (chain) => chain.id === chainId
  );
  return chain?.config;
};
