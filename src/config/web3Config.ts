import { createConfig } from 'wagmi';
import { http, createPublicClient } from 'viem';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { supportedChains, defaultChain, sepolia } from './chains';
import { type Chain } from 'viem';
import { getContractAddress } from './contracts';

// Vérification des variables d'environnement requises
const requiredEnvVars = {
  VITE_WALLET_CONNECT_PROJECT_ID: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  VITE_MAINNET_RPC_URL: import.meta.env.VITE_MAINNET_RPC_URL,
  VITE_SEPOLIA_RPC_URL: import.meta.env.VITE_SEPOLIA_RPC_URL
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const projectId = requiredEnvVars.VITE_WALLET_CONNECT_PROJECT_ID as string;

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
    const rpcUrl = chain.id === sepolia.id 
      ? requiredEnvVars.VITE_SEPOLIA_RPC_URL 
      : requiredEnvVars.VITE_MAINNET_RPC_URL;

    return createPublicClient({
      chain,
      transport: http(rpcUrl)
    });
  },
});

console.log(`Web3 configuration initialized with ${mutableChains.length} chains:`, 
  mutableChains.map(chain => chain.name).join(', '));
console.log('Default chain:', defaultChain.name);

// Export des chaînes supportées pour RainbowKit
export const chains = mutableChains;

// Helper function to get factory address for current chain
export const getFactoryAddress = () => {
  // Default to the first chain in supportedChains if no chain is selected
  const chainId = defaultChain.id;
  return getContractAddress('TOKEN_FACTORY', chainId);
};

export default config;