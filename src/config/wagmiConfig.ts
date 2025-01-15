import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'viem/chains';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('Missing VITE_WALLET_CONNECT_PROJECT_ID');
}

export const wagmiConfig = getDefaultConfig({
  appName: 'TokenForge',
  projectId,
  chains: [sepolia],
  ssr: false,
}); 