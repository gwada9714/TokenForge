import { createConfig } from 'wagmi';
import { http, createPublicClient } from 'viem';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { supportedChains } from './chains';
import { type Chain } from 'viem';

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
const mutableChains: Chain[] = [...supportedChains].filter(chain => {
  try {
    // Vérifie si la chaîne a une URL RPC valide
    const rpcUrl = chain.rpcUrls.default.http[0];
    return !!rpcUrl && rpcUrl.startsWith('http');
  } catch (error) {
    console.warn(`Chain ${chain.name} skipped due to invalid RPC URL`);
    return false;
  }
});

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
  chain: mutableChains[0],
  transport: http(),
  batch: {
    multicall: true
  },
  pollingInterval: 4_000
});

// Configuration Wagmi avec gestion des erreurs
export const wagmiConfig = createConfig({
  connectors,
  publicClient,
  autoConnect: true
});

// Export des chaînes supportées pour RainbowKit
export const chains = mutableChains;

console.log(`Web3 configuration initialized with ${mutableChains.length} chains`);