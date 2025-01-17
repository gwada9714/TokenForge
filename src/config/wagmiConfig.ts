import { createConfig, configureChains } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const alchemyId = import.meta.env.VITE_ALCHEMY_API_KEY;

if (!projectId) {
  throw new Error("Missing VITE_WALLET_CONNECT_PROJECT_ID");
}

if (!alchemyId) {
  throw new Error("Missing VITE_ALCHEMY_API_KEY");
}

const metadata = {
  name: "TokenForge",
  description: "Create and manage your own tokens",
  url: "https://tokenforge.app",
  icons: ["https://tokenforge.app/logo.png"],
};

// Configuration des chaînes avec leurs providers
export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia],
  [
    alchemyProvider({ apiKey: alchemyId }),
    publicProvider(),
  ],
);

// Configuration des wallets
const { connectors } = getDefaultWallets({
  appName: metadata.name,
  projectId: projectId as string,
  chains,
});

// Configuration wagmi
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});