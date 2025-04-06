import { mainnet, sepolia } from "wagmi/chains";
import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Récupération des variables d'environnement
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("Missing VITE_WALLET_CONNECT_PROJECT_ID");
}

const mainnetRpcUrl =
  import.meta.env.VITE_MAINNET_RPC_URL ||
  "https://eth-mainnet.g.alchemy.com/v2/your-api-key";
const sepoliaRpcUrl =
  import.meta.env.VITE_SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/your-api-key";

// Configuration des chaînes supportées
const supportedChains = [sepolia, mainnet] as const;

// Configuration Wagmi avec RainbowKit
export const wagmiConfig = getDefaultConfig({
  appName: "TokenForge",
  projectId: projectId,
  chains: supportedChains,
  transports: {
    [mainnet.id]: http(mainnetRpcUrl),
    [sepolia.id]: http(sepoliaRpcUrl),
  },
  ssr: false, // Désactive le SSR pour éviter les problèmes de rendu
});
