import { createConfig } from 'wagmi';
import { http, createPublicClient } from 'viem';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { supportedChains, defaultChain, sepolia } from './chains';
import { type Chain } from 'viem';
import { getContractAddress } from './contracts';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

// Vérification des variables d'environnement requises
const requiredEnvVars = {
  VITE_WALLET_CONNECT_PROJECT_ID: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  VITE_ALCHEMY_API_KEY: import.meta.env.VITE_ALCHEMY_API_KEY
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const projectId = requiredEnvVars.VITE_WALLET_CONNECT_PROJECT_ID as string;
const alchemyKey = requiredEnvVars.VITE_ALCHEMY_API_KEY as string;

// Convert readonly chains to mutable array for RainbowKit
const mutableChains: Chain[] = [...supportedChains];

if (mutableChains.length === 0) {
  throw new Error('No valid chains configured. Please check your contract addresses in environment variables.');
}

const { connectors } = getDefaultWallets({
  appName: 'TokenForge',
  projectId,
  chains: mutableChains,
});

// Create wagmi config
const config = createConfig({
  connectors,
  publicClient: ({ chainId }) => {
    const chain = mutableChains.find(c => c.id === chainId) ?? defaultChain;
    
    return createPublicClient({
      chain,
      transport: http(`https://eth-${chain.id === sepolia.id ? 'sepolia' : 'mainnet'}.g.alchemy.com/v2/${alchemyKey}`)
    });
  },
});

// Helper function to get factory address for current chain
export function getFactoryAddress(chainId?: number) {
  if (!chainId) return undefined;
  return getContractAddress('tokenFactory', chainId);
}

export const chains = mutableChains;
export default config;