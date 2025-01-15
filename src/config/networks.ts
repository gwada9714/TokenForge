import { Chain } from "viem";
import { mainnet, sepolia, bsc, bscTestnet, polygon, polygonMumbai, avalanche, avalancheFuji } from "viem/chains";

export interface NetworkConfig {
  chain: Chain;
  factoryAddress?: `0x${string}`;
  explorerUrl: string;
  rpcUrl: string;
  isTestnet: boolean;
  name: string;
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

export const networks: Record<number, NetworkConfig> = {
  [mainnet.id]: {
    chain: mainnet,
    factoryAddress: FACTORY_MAINNET,
    explorerUrl: "https://etherscan.io",
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
    isTestnet: false,
    name: "Ethereum Mainnet",
    icon: "/images/networks/ethereum.svg"
  },
  [sepolia.id]: {
    chain: sepolia,
    factoryAddress: FACTORY_SEPOLIA,
    explorerUrl: "https://sepolia.etherscan.io",
    rpcUrl: `https://sepolia.infura.io/v3/${INFURA_ID}`,
    isTestnet: true,
    name: "Sepolia Testnet",
    icon: "/images/networks/ethereum.svg"
  },
  [bsc.id]: {
    chain: bsc,
    factoryAddress: FACTORY_BSC,
    explorerUrl: "https://bscscan.com",
    rpcUrl: "https://bsc-dataseed.binance.org",
    isTestnet: false,
    name: "BNB Smart Chain",
    icon: "/images/networks/bsc.svg"
  },
  [bscTestnet.id]: {
    chain: bscTestnet,
    factoryAddress: FACTORY_BSC_TESTNET,
    explorerUrl: "https://testnet.bscscan.com",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    isTestnet: true,
    name: "BSC Testnet",
    icon: "/images/networks/bsc.svg"
  },
  [polygon.id]: {
    chain: polygon,
    factoryAddress: FACTORY_POLYGON,
    explorerUrl: "https://polygonscan.com",
    rpcUrl: `https://polygon-mainnet.infura.io/v3/${INFURA_ID}`,
    isTestnet: false,
    name: "Polygon",
    icon: "/images/networks/polygon.svg"
  },
  [polygonMumbai.id]: {
    chain: polygonMumbai,
    factoryAddress: FACTORY_MUMBAI,
    explorerUrl: "https://mumbai.polygonscan.com",
    rpcUrl: `https://polygon-mumbai.infura.io/v3/${INFURA_ID}`,
    isTestnet: true,
    name: "Mumbai Testnet",
    icon: "/images/networks/polygon.svg"
  },
  [avalanche.id]: {
    chain: avalanche,
    factoryAddress: FACTORY_AVALANCHE,
    explorerUrl: "https://snowtrace.io",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    isTestnet: false,
    name: "Avalanche",
    icon: "/images/networks/avalanche.svg"
  },
  [avalancheFuji.id]: {
    chain: avalancheFuji,
    factoryAddress: FACTORY_FUJI,
    explorerUrl: "https://testnet.snowtrace.io",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    isTestnet: true,
    name: "Fuji Testnet",
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
