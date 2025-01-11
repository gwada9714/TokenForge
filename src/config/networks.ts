import { Chain } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

export interface NetworkConfig {
  chain: Chain;
  factoryAddress?: `0x${string}`;
  explorerUrl: string;
  rpcUrl: string;
}

const INFURA_ID = process.env.REACT_APP_INFURA_PROJECT_ID;
const FACTORY_MAINNET = process.env.REACT_APP_TOKEN_FACTORY_MAINNET as `0x${string}` | undefined;
const FACTORY_SEPOLIA = process.env.REACT_APP_TOKEN_FACTORY_SEPOLIA as `0x${string}` | undefined;

export const networks: Record<number, NetworkConfig> = {
  [mainnet.id]: {
    chain: mainnet,
    factoryAddress: FACTORY_MAINNET,
    explorerUrl: 'https://etherscan.io',
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
  },
  [sepolia.id]: {
    chain: sepolia,
    factoryAddress: FACTORY_SEPOLIA,
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: `https://sepolia.infura.io/v3/${INFURA_ID}`,
  },
};

export const getNetwork = (chainId: number): NetworkConfig | undefined => {
  return networks[chainId];
};

export const getSupportedChains = (): Chain[] => {
  return Object.values(networks).map(network => network.chain);
};
