import { createConfig, configureChains } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const alchemyId = import.meta.env.VITE_ALCHEMY_API_KEY;
const supportedChains = (import.meta.env.VITE_SUPPORTED_CHAINS || '1,11155111')
  .split(',')
  .map(Number);

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

// Sélection des chaînes supportées
const availableChains = [
  {
    ...mainnet,
    rpcUrls: {
      ...mainnet.rpcUrls,
      default: {
        http: [import.meta.env.VITE_MAINNET_RPC_URL],
      },
      public: {
        http: [import.meta.env.VITE_MAINNET_RPC_URL],
      },
    },
  },
  {
    ...sepolia,
    rpcUrls: {
      ...sepolia.rpcUrls,
      default: {
        http: [import.meta.env.VITE_SEPOLIA_RPC_URL],
      },
      public: {
        http: [import.meta.env.VITE_SEPOLIA_RPC_URL],
      },
    },
  },
];

const selectedChains = availableChains.filter(chain => 
  supportedChains.includes(chain.id)
);

// Configuration des chaînes avec leurs providers
export const { chains, publicClient, webSocketPublicClient } = configureChains(
  selectedChains,
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