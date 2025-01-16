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

const INFURA_ID = process.env.REACT_APP_INFURA_PROJECT_ID;
const FACTORY_MAINNET = process.env.REACT_APP_TOKEN_FACTORY_MAINNET as `0x${string}` | undefined;
const FACTORY_SEPOLIA = process.env.REACT_APP_TOKEN_FACTORY_SEPOLIA as `0x${string}` | undefined;
const FACTORY_BSC = process.env.REACT_APP_TOKEN_FACTORY_BSC as `0x${string}` | undefined;
const FACTORY_BSC_TESTNET = process.env.REACT_APP_TOKEN_FACTORY_BSC_TESTNET as `0x${string}` | undefined;
const FACTORY_POLYGON = process.env.REACT_APP_TOKEN_FACTORY_POLYGON as `0x${string}` | undefined;
const FACTORY_MUMBAI = process.env.REACT_APP_TOKEN_FACTORY_MUMBAI as `0x${string}` | undefined;
const FACTORY_AVALANCHE = process.env.REACT_APP_TOKEN_FACTORY_AVALANCHE as `0x${string}` | undefined;
const FACTORY_FUJI = process.env.REACT_APP_TOKEN_FACTORY_FUJI as `0x${string}` | undefined;

const LIQUIDITY_LOCKER_MAINNET = process.env.REACT_APP_LIQUIDITY_LOCKER_MAINNET as `0x${string}` | undefined;
const LIQUIDITY_LOCKER_SEPOLIA = process.env.REACT_APP_LIQUIDITY_LOCKER_SEPOLIA as `0x${string}` | undefined;
const LIQUIDITY_LOCKER_BSC = process.env.REACT_APP_LIQUIDITY_LOCKER_BSC as `0x${string}` | undefined;
const LIQUIDITY_LOCKER_BSC_TESTNET = process.env.REACT_APP_LIQUIDITY_LOCKER_BSC_TESTNET as `0x${string}` | undefined;
const LIQUIDITY_LOCKER_POLYGON = process.env.REACT_APP_LIQUIDITY_LOCKER_POLYGON as `0x${string}` | undefined;
const LIQUIDITY_LOCKER_MUMBAI = process.env.REACT_APP_LIQUIDITY_LOCKER_MUMBAI as `0x${string}` | undefined;
const LIQUIDITY_LOCKER_AVALANCHE = process.env.REACT_APP_LIQUIDITY_LOCKER_AVALANCHE as `0x${string}` | undefined;
const LIQUIDITY_LOCKER_FUJI = process.env.REACT_APP_LIQUIDITY_LOCKER_FUJI as `0x${string}` | undefined;

export const networks: Record<number, NetworkConfig> = {
  [mainnet.id]: {
    name: "Ethereum Mainnet",
    chain: mainnet,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_MAINNET,
      tokenFactory: FACTORY_MAINNET,
    },
    explorerUrl: "https://etherscan.io",
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
    isTestnet: false,
    icon: "/images/networks/ethereum.svg"
  },
  [sepolia.id]: {
    name: "Sepolia Testnet",
    chain: sepolia,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_SEPOLIA,
      tokenFactory: FACTORY_SEPOLIA,
    },
    explorerUrl: "https://sepolia.etherscan.io",
    rpcUrl: `https://sepolia.infura.io/v3/${INFURA_ID}`,
    isTestnet: true,
    icon: "/images/networks/ethereum.svg"
  },
  [bsc.id]: {
    name: "BNB Smart Chain",
    chain: bsc,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_BSC,
      tokenFactory: FACTORY_BSC,
    },
    explorerUrl: "https://bscscan.com",
    rpcUrl: "https://bsc-dataseed.binance.org",
    isTestnet: false,
    icon: "/images/networks/bsc.svg"
  },
  [bscTestnet.id]: {
    name: "BSC Testnet",
    chain: bscTestnet,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_BSC_TESTNET,
      tokenFactory: FACTORY_BSC_TESTNET,
    },
    explorerUrl: "https://testnet.bscscan.com",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    isTestnet: true,
    icon: "/images/networks/bsc.svg"
  },
  [polygon.id]: {
    name: "Polygon",
    chain: polygon,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_POLYGON,
      tokenFactory: FACTORY_POLYGON,
    },
    explorerUrl: "https://polygonscan.com",
    rpcUrl: `https://polygon-mainnet.infura.io/v3/${INFURA_ID}`,
    isTestnet: false,
    icon: "/images/networks/polygon.svg"
  },
  [polygonMumbai.id]: {
    name: "Mumbai Testnet",
    chain: polygonMumbai,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_MUMBAI,
      tokenFactory: FACTORY_MUMBAI,
    },
    explorerUrl: "https://mumbai.polygonscan.com",
    rpcUrl: `https://polygon-mumbai.infura.io/v3/${INFURA_ID}`,
    isTestnet: true,
    icon: "/images/networks/polygon.svg"
  },
  [avalanche.id]: {
    name: "Avalanche",
    chain: avalanche,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_AVALANCHE,
      tokenFactory: FACTORY_AVALANCHE,
    },
    explorerUrl: "https://snowtrace.io",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    isTestnet: false,
    icon: "/images/networks/avalanche.svg"
  },
  [avalancheFuji.id]: {
    name: "Fuji Testnet",
    chain: avalancheFuji,
    contracts: {
      liquidityLocker: LIQUIDITY_LOCKER_FUJI,
      tokenFactory: FACTORY_FUJI,
    },
    explorerUrl: "https://testnet.snowtrace.io",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    isTestnet: true,
    icon: "/images/networks/avalanche.svg"
  }
};

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
