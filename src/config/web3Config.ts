import { sepolia } from "viem/chains";
import { http } from "wagmi";
import { injected } from "wagmi/connectors";

export const SUPPORTED_CHAINS = [sepolia] as const;
export const DEFAULT_CHAIN = sepolia;

export const web3Config = {
  chains: SUPPORTED_CHAINS,
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
  },
} as const;

export const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case sepolia.id:
      return "Sepolia Testnet";
    default:
      return `Réseau ${chainId}`;
  }
};

export const isCorrectChainId = (chainId: number): boolean => {
  return chainId === sepolia.id;
};

export const NETWORK_CONFIG = {
  requiredChainId: sepolia.id,
  networkName: "Sepolia Testnet",
  rpcUrl: "https://sepolia.infura.io/v3/",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18,
  },
} as const;
