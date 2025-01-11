import { mainnet, sepolia } from "wagmi/chains";

export const APP_NAME = "TokenForge";
export const APP_DESCRIPTION = "Create and manage your tokens easily";
export const APP_URL = "https://tokenforge.app";
export const APP_ICONS = ["https://avatars.githubusercontent.com/u/37784886"];

export const SUPPORTED_CHAINS = {
  mainnet,
  sepolia,
};

export const DEFAULT_CHAIN =
  process.env.VITE_DEFAULT_NETWORK === "mainnet" ? mainnet : sepolia;

export const TOKEN_FACTORY_ADDRESS = {
  [mainnet.id]: process.env.VITE_TOKEN_FACTORY_MAINNET,
  [sepolia.id]: process.env.VITE_TOKEN_FACTORY_SEPOLIA,
} as const;

export const IPFS_GATEWAY =
  process.env.VITE_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

export const FEATURED_WALLETS = [
  "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
  "19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927", // Coinbase Wallet
] as const;

export const FEATURES = {
  faucet: process.env.VITE_ENABLE_FAUCET === "true",
  analytics: process.env.VITE_ENABLE_ANALYTICS === "true",
} as const;

export const QUERY_CLIENT_CONFIG = {
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
} as const;

export const WEB3_MODAL_CONFIG = {
  themeMode: "light" as const,
  termsOfServiceUrl: `${APP_URL}/terms`,
  privacyPolicyUrl: `${APP_URL}/privacy`,
} as const;

// Validation des variables d'environnement requises
const requiredEnvVars = [
  "VITE_WALLET_CONNECT_PROJECT_ID",
  "VITE_TOKEN_FACTORY_SEPOLIA",
  "VITE_ALCHEMY_API_KEY",
] as const;

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export type SupportedChainId = keyof typeof TOKEN_FACTORY_ADDRESS;
export type SupportedChain =
  (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS];
