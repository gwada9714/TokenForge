import { Chain } from "viem";
import { mainnet, sepolia, bsc, bscTestnet, polygon, polygonMumbai, avalanche, avalancheFuji } from "viem/chains";

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

// Récupération des variables d'environnement
const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL;
const TOKEN_FACTORY_SEPOLIA = import.meta.env.VITE_TOKEN_FACTORY_SEPOLIA;
const LIQUIDITY_LOCKER_SEPOLIA = import.meta.env.VITE_LIQUIDITY_LOCKER_SEPOLIA;

const MAINNET_RPC_URL = import.meta.env.VITE_MAINNET_RPC_URL;
const TOKEN_FACTORY_MAINNET = import.meta.env.VITE_TOKEN_FACTORY_MAINNET;
const LIQUIDITY_LOCKER_MAINNET = import.meta.env.VITE_LIQUIDITY_LOCKER_MAINNET;

const BSC_RPC_URL = import.meta.env.VITE_BSC_RPC_URL;
const TOKEN_FACTORY_BSC = import.meta.env.VITE_TOKEN_FACTORY_BSC;
const LIQUIDITY_LOCKER_BSC = import.meta.env.VITE_LIQUIDITY_LOCKER_BSC;

const BSC_TESTNET_RPC_URL = import.meta.env.VITE_BSC_TESTNET_RPC_URL;
const TOKEN_FACTORY_BSC_TESTNET = import.meta.env.VITE_TOKEN_FACTORY_BSC_TESTNET;
const LIQUIDITY_LOCKER_BSC_TESTNET = import.meta.env.VITE_LIQUIDITY_LOCKER_BSC_TESTNET;

const POLYGON_RPC_URL = import.meta.env.VITE_POLYGON_RPC_URL;
const TOKEN_FACTORY_POLYGON = import.meta.env.VITE_TOKEN_FACTORY_POLYGON;
const LIQUIDITY_LOCKER_POLYGON = import.meta.env.VITE_LIQUIDITY_LOCKER_POLYGON;

const POLYGON_MUMBAI_RPC_URL = import.meta.env.VITE_POLYGON_MUMBAI_RPC_URL;
const TOKEN_FACTORY_POLYGON_MUMBAI = import.meta.env.VITE_TOKEN_FACTORY_POLYGON_MUMBAI;
const LIQUIDITY_LOCKER_POLYGON_MUMBAI = import.meta.env.VITE_LIQUIDITY_LOCKER_POLYGON_MUMBAI;

const AVALANCHE_RPC_URL = import.meta.env.VITE_AVALANCHE_RPC_URL;
const TOKEN_FACTORY_AVALANCHE = import.meta.env.VITE_TOKEN_FACTORY_AVALANCHE;
const LIQUIDITY_LOCKER_AVALANCHE = import.meta.env.VITE_LIQUIDITY_LOCKER_AVALANCHE;

const AVALANCHE_FUJI_RPC_URL = import.meta.env.VITE_AVALANCHE_FUJI_RPC_URL;
const TOKEN_FACTORY_AVALANCHE_FUJI = import.meta.env.VITE_TOKEN_FACTORY_AVALANCHE_FUJI;
const LIQUIDITY_LOCKER_AVALANCHE_FUJI = import.meta.env.VITE_LIQUIDITY_LOCKER_AVALANCHE_FUJI;

export const networks: Record<number, NetworkConfig> = {
  [mainnet.id]: {
    name: "Ethereum Mainnet",
    chain: mainnet,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_MAINNET as `0x${string}`,
      tokenFactory: TOKEN_FACTORY_MAINNET as `0x${string}`,
    },
    explorerUrl: "https://etherscan.io",
    rpcUrl: MAINNET_RPC_URL,
    isTestnet: false,
    icon: "/images/networks/ethereum.svg"
  },
  [sepolia.id]: {
    name: "Sepolia Testnet",
    chain: sepolia,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_SEPOLIA as `0x${string}`,
      tokenFactory: TOKEN_FACTORY_SEPOLIA as `0x${string}`,
    },
    explorerUrl: "https://sepolia.etherscan.io",
    rpcUrl: SEPOLIA_RPC_URL,
    isTestnet: true,
    icon: "/images/networks/ethereum.svg"
  },
  [bsc.id]: {
    name: "BNB Smart Chain",
    chain: bsc,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_BSC as `0x${string}`,
      tokenFactory: TOKEN_FACTORY_BSC as `0x${string}`,
    },
    explorerUrl: "https://bscscan.com",
    rpcUrl: BSC_RPC_URL,
    isTestnet: false,
    icon: "/images/networks/bsc.svg"
  },
  [bscTestnet.id]: {
    name: "BSC Testnet",
    chain: bscTestnet,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_BSC_TESTNET as `0x${string}`,
      tokenFactory: TOKEN_FACTORY_BSC_TESTNET as `0x${string}`,
    },
    explorerUrl: "https://testnet.bscscan.com",
    rpcUrl: BSC_TESTNET_RPC_URL,
    isTestnet: true,
    icon: "/images/networks/bsc.svg"
  },
  [polygon.id]: {
    name: "Polygon",
    chain: polygon,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_POLYGON as `0x${string}`,
      tokenFactory: TOKEN_FACTORY_POLYGON as `0x${string}`,
    },
    explorerUrl: "https://polygonscan.com",
    rpcUrl: POLYGON_RPC_URL,
    isTestnet: false,
    icon: "/images/networks/polygon.svg"
  },
  [polygonMumbai.id]: {
    name: "Mumbai Testnet",
    chain: polygonMumbai,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_POLYGON_MUMBAI as `0x${string}`,
      tokenFactory: TOKEN_FACTORY_POLYGON_MUMBAI as `0x${string}`,
    },
    explorerUrl: "https://mumbai.polygonscan.com",
    rpcUrl: POLYGON_MUMBAI_RPC_URL,
    isTestnet: true,
    icon: "/images/networks/polygon.svg"
  },
  [avalanche.id]: {
    name: "Avalanche",
    chain: avalanche,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_AVALANCHE as `0x${string}`,
      tokenFactory: TOKEN_FACTORY_AVALANCHE as `0x${string}`,
    },
    explorerUrl: "https://snowtrace.io",
    rpcUrl: AVALANCHE_RPC_URL,
    isTestnet: false,
    icon: "/images/networks/avalanche.svg"
  },
  [avalancheFuji.id]: {
    name: "Fuji Testnet",
    chain: avalancheFuji,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_AVALANCHE_FUJI as `0x${string}`,
      tokenFactory: TOKEN_FACTORY_AVALANCHE_FUJI as `0x${string}`,
    },
    explorerUrl: "https://testnet.snowtrace.io",
    rpcUrl: AVALANCHE_FUJI_RPC_URL,
    isTestnet: true,
    icon: "/images/networks/avalanche.svg"
  }
};

export const SUPPORTED_NETWORKS = {
  MAINNET: mainnet.id,
  SEPOLIA: sepolia.id,
  BSC: bsc.id,
  BSC_TESTNET: bscTestnet.id,
  POLYGON: polygon.id,
  POLYGON_MUMBAI: polygonMumbai.id,
  AVALANCHE: avalanche.id,
  AVALANCHE_FUJI: avalancheFuji.id
} as const;

export const getNetwork = (chainId: number): NetworkConfig | undefined => {
  return networks[chainId];
};

export const getSupportedChains = (): Chain[] => {
  return Object.values(networks).map((network) => network.chain);
};

export const getMainnetNetworks = (): NetworkConfig[] => {
  return Object.values(networks).filter(network => !network.isTestnet);
};

export const getTestnetNetworks = (): NetworkConfig[] => {
  return Object.values(networks).filter(network => network.isTestnet);
};

export const getDefaultNetworkConfig = (chainId: number): NetworkConfig | undefined => {
  return networks[chainId];
};
