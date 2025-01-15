import { createConfig } from 'wagmi';
import { http, createPublicClient } from 'viem';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { supportedChains, defaultChain } from './chains';
import { type Chain } from 'viem';
import { CONTRACT_ADDRESSES, getContractAddress } from './contracts';

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
  throw new Error('No valid chains configured. Please check your RPC URLs.');
}

const { connectors } = getDefaultWallets({
  appName: 'TokenForge',
  projectId,
  chains: mutableChains
});

// Create public client with fallback
const publicClient = createPublicClient({
  chain: defaultChain,
  transport: http(),
  batch: {
    multicall: true
  },
});

export const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors
});

// Export des chaînes supportées pour RainbowKit
export const chains = mutableChains;

// Helper function to get factory address for current chain
export const getFactoryAddress = () => {
  // Default to the first chain in supportedChains if no chain is selected
  const chainId = defaultChain.id;
  return getContractAddress('TOKEN_FACTORY', chainId);
};

console.log(`Web3 configuration initialized with ${mutableChains.length} chains`);