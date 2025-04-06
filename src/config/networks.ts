import { Chain } from "viem";
import {
  mainnet,
  sepolia,
  bsc,
  bscTestnet,
  polygon,
  polygonMumbai,
  avalanche,
  avalancheFuji,
} from "viem/chains";

const SUPPORTED_CHAINS = (
  import.meta.env.VITE_SUPPORTED_CHAINS ||
  "1,11155111,56,97,137,80001,43114,43113"
)
  .split(",")
  .map(Number);

export interface NetworkConfig {
  name: string;
  chain: Chain;
  contracts: {
    liquidityLocker: `0x${string}`;
    tokenFactory: `0x${string}`;
  };
  explorerUrl: string;
  rpcUrl: string;
  isTestnet: boolean;
  icon?: string;
}

const getContractAddress = (contractName: string, chainId: number): string => {
  const network = getNetworkName(chainId);
  const envVar = `VITE_${contractName}_${network}`;
  return import.meta.env[envVar] || "";
};

const getRpcUrl = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return import.meta.env.VITE_MAINNET_RPC_URL;
    case 11155111:
      return import.meta.env.VITE_SEPOLIA_RPC_URL;
    case 56:
      return import.meta.env.VITE_BSC_RPC_URL;
    case 97:
      return import.meta.env.VITE_BSC_TESTNET_RPC_URL;
    case 137:
      return import.meta.env.VITE_POLYGON_RPC_URL;
    case 80001:
      return import.meta.env.VITE_POLYGON_MUMBAI_RPC_URL;
    case 43114:
      return import.meta.env.VITE_AVALANCHE_RPC_URL;
    case 43113:
      return import.meta.env.VITE_AVALANCHE_FUJI_RPC_URL;
    default:
      return "";
  }
};

const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return "MAINNET";
    case 11155111:
      return "SEPOLIA";
    case 56:
      return "BSC";
    case 97:
      return "BSC_TESTNET";
    case 137:
      return "POLYGON";
    case 80001:
      return "POLYGON_MUMBAI";
    case 43114:
      return "AVALANCHE";
    case 43113:
      return "AVALANCHE_FUJI";
    default:
      return "";
  }
};

const isChainSupported = (chainId: number): boolean => {
  return SUPPORTED_CHAINS.includes(chainId);
};

export const networks: Record<number, NetworkConfig> = {
  [mainnet.id]: {
    name: "Ethereum Mainnet",
    chain: mainnet,
    contracts: {
      liquidityLocker: getContractAddress(
        "LIQUIDITY_LOCKER",
        mainnet.id
      ) as `0x${string}`,
      tokenFactory: getContractAddress(
        "TOKEN_FACTORY",
        mainnet.id
      ) as `0x${string}`,
    },
    explorerUrl: "https://etherscan.io",
    rpcUrl: getRpcUrl(mainnet.id),
    isTestnet: false,
    icon: "/images/networks/ethereum.svg",
  },
  [sepolia.id]: {
    name: "Sepolia Testnet",
    chain: sepolia,
    contracts: {
      liquidityLocker: getContractAddress(
        "LIQUIDITY_LOCKER",
        sepolia.id
      ) as `0x${string}`,
      tokenFactory: getContractAddress(
        "TOKEN_FACTORY",
        sepolia.id
      ) as `0x${string}`,
    },
    explorerUrl: "https://sepolia.etherscan.io",
    rpcUrl: getRpcUrl(sepolia.id),
    isTestnet: true,
    icon: "/images/networks/ethereum.svg",
  },
  [bsc.id]: {
    name: "BNB Smart Chain",
    chain: bsc,
    contracts: {
      liquidityLocker: getContractAddress(
        "LIQUIDITY_LOCKER",
        bsc.id
      ) as `0x${string}`,
      tokenFactory: getContractAddress(
        "TOKEN_FACTORY",
        bsc.id
      ) as `0x${string}`,
    },
    explorerUrl: "https://bscscan.com",
    rpcUrl: getRpcUrl(bsc.id),
    isTestnet: false,
    icon: "/images/networks/bsc.svg",
  },
  [bscTestnet.id]: {
    name: "BSC Testnet",
    chain: bscTestnet,
    contracts: {
      liquidityLocker: getContractAddress(
        "LIQUIDITY_LOCKER",
        bscTestnet.id
      ) as `0x${string}`,
      tokenFactory: getContractAddress(
        "TOKEN_FACTORY",
        bscTestnet.id
      ) as `0x${string}`,
    },
    explorerUrl: "https://testnet.bscscan.com",
    rpcUrl: getRpcUrl(bscTestnet.id),
    isTestnet: true,
    icon: "/images/networks/bsc.svg",
  },
  [polygon.id]: {
    name: "Polygon",
    chain: polygon,
    contracts: {
      liquidityLocker: getContractAddress(
        "LIQUIDITY_LOCKER",
        polygon.id
      ) as `0x${string}`,
      tokenFactory: getContractAddress(
        "TOKEN_FACTORY",
        polygon.id
      ) as `0x${string}`,
    },
    explorerUrl: "https://polygonscan.com",
    rpcUrl: getRpcUrl(polygon.id),
    isTestnet: false,
    icon: "/images/networks/polygon.svg",
  },
  [polygonMumbai.id]: {
    name: "Mumbai Testnet",
    chain: polygonMumbai,
    contracts: {
      liquidityLocker: getContractAddress(
        "LIQUIDITY_LOCKER",
        polygonMumbai.id
      ) as `0x${string}`,
      tokenFactory: getContractAddress(
        "TOKEN_FACTORY",
        polygonMumbai.id
      ) as `0x${string}`,
    },
    explorerUrl: "https://mumbai.polygonscan.com",
    rpcUrl: getRpcUrl(polygonMumbai.id),
    isTestnet: true,
    icon: "/images/networks/polygon.svg",
  },
  [avalanche.id]: {
    name: "Avalanche",
    chain: avalanche,
    contracts: {
      liquidityLocker: getContractAddress(
        "LIQUIDITY_LOCKER",
        avalanche.id
      ) as `0x${string}`,
      tokenFactory: getContractAddress(
        "TOKEN_FACTORY",
        avalanche.id
      ) as `0x${string}`,
    },
    explorerUrl: "https://snowtrace.io",
    rpcUrl: getRpcUrl(avalanche.id),
    isTestnet: false,
    icon: "/images/networks/avalanche.svg",
  },
  [avalancheFuji.id]: {
    name: "Fuji Testnet",
    chain: avalancheFuji,
    contracts: {
      liquidityLocker: getContractAddress(
        "LIQUIDITY_LOCKER",
        avalancheFuji.id
      ) as `0x${string}`,
      tokenFactory: getContractAddress(
        "TOKEN_FACTORY",
        avalancheFuji.id
      ) as `0x${string}`,
    },
    explorerUrl: "https://testnet.snowtrace.io",
    rpcUrl: getRpcUrl(avalancheFuji.id),
    isTestnet: true,
    icon: "/images/networks/avalanche.svg",
  },
};

export const SUPPORTED_NETWORKS = {
  MAINNET: mainnet.id,
  SEPOLIA: sepolia.id,
  BSC: bsc.id,
  BSC_TESTNET: bscTestnet.id,
  POLYGON: polygon.id,
  POLYGON_MUMBAI: polygonMumbai.id,
  AVALANCHE: avalanche.id,
  AVALANCHE_FUJI: avalancheFuji.id,
} as const;

export const getNetwork = (chainId: number): NetworkConfig | undefined => {
  return networks[chainId];
};

export const getSupportedChains = (): Chain[] => {
  return Object.values(networks)
    .map((network) => network.chain)
    .filter((chain) => isChainSupported(chain.id));
};

export const getMainnetNetworks = (): NetworkConfig[] => {
  return Object.values(networks).filter((network) => !network.isTestnet);
};

export const getTestnetNetworks = (): NetworkConfig[] => {
  return Object.values(networks).filter((network) => network.isTestnet);
};

export const getDefaultNetworkConfig = (
  chainId: number
): NetworkConfig | undefined => {
  return networks[chainId];
};
