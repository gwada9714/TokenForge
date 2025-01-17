import { configureChains, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY as string;

// Configure les chaînes avec Alchemy comme provider principal
export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia],
  [
    alchemyProvider({ apiKey: ALCHEMY_API_KEY }),
    publicProvider(),
  ],
);

// Configure RainbowKit
const { connectors } = getDefaultWallets({
  appName: 'TokenForge',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID as string,
  chains,
});

// Crée la configuration Wagmi
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});
