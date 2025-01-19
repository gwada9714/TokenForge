import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Récupération des variables d'environnement
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const mainnetRpcUrl = import.meta.env.VITE_MAINNET_RPC_URL;
const sepoliaRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL;

// Configuration des chaînes supportées
export const chains = [sepolia, mainnet] as const;

// Configuration des transports HTTP
const transports = {
  [mainnet.id]: http(mainnetRpcUrl),
  [sepolia.id]: http(sepoliaRpcUrl),
};

// Configuration Wagmi avec RainbowKit
export const wagmiConfig = getDefaultConfig({
  appName: 'TokenForge',
  projectId,
  chains,
  transports
});