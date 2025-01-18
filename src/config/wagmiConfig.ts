import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { configureChains, createConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

// Récupération des variables d'environnement
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const alchemyId = import.meta.env.VITE_ALCHEMY_API_KEY;
const mainnetRpcUrl = import.meta.env.VITE_MAINNET_RPC_URL;
const sepoliaRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL;

if (!projectId) throw new Error('Missing VITE_WALLET_CONNECT_PROJECT_ID');
if (!alchemyId) throw new Error('Missing VITE_ALCHEMY_API_KEY');
if (!sepoliaRpcUrl) throw new Error('Missing VITE_SEPOLIA_RPC_URL');
if (!mainnetRpcUrl) throw new Error('Missing VITE_MAINNET_RPC_URL');

// Configuration des chaînes et des providers
const configuredMainnet = {
  ...mainnet,
  rpcUrls: {
    ...mainnet.rpcUrls,
    default: { http: [mainnetRpcUrl, `https://eth-mainnet.g.alchemy.com/v2/${alchemyId}`] },
    public: { http: [mainnetRpcUrl, `https://eth-mainnet.g.alchemy.com/v2/${alchemyId}`] },
  },
};

const configuredSepolia = {
  ...sepolia,
  rpcUrls: {
    ...sepolia.rpcUrls,
    default: { http: [sepoliaRpcUrl, `https://eth-sepolia.g.alchemy.com/v2/${alchemyId}`] },
    public: { http: [sepoliaRpcUrl, `https://eth-sepolia.g.alchemy.com/v2/${alchemyId}`] },
  },
};

const { chains, publicClient } = configureChains(
  [configuredSepolia, configuredMainnet], 
  [
    alchemyProvider({ apiKey: alchemyId }),
    publicProvider(),
  ]
);

// Configuration des wallets supportés
const { connectors } = getDefaultWallets({
  appName: 'TokenForge',
  projectId: projectId,
  chains,
});

// Configuration wagmi principale
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

// Configuration RainbowKit
const metadata = {
  name: "TokenForge",
  description: "Create and manage your own tokens",
  url: "https://tokenforge.app",
  icons: ["https://tokenforge.app/logo.png"],
};

const rainbowKitConfig = getDefaultConfig({
  appName: 'TokenForge',
  projectId: projectId,
  chains: [configuredSepolia, configuredMainnet],
  transports: {
    [configuredMainnet.id]: http(mainnetRpcUrl),
    [configuredSepolia.id]: http(sepoliaRpcUrl),
  },
});

// Export des chaînes configurées
export const chains = [configuredSepolia, configuredMainnet];
export { wagmiConfig, rainbowKitConfig };
export default wagmiConfig;