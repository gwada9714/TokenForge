/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Mode d'environnement
  readonly VITE_ENV: 'development' | 'production';

  // Configuration du réseau
  readonly VITE_LOCAL_CHAIN_ID: string;
  readonly VITE_SUPPORTED_CHAINS: string;

  // Configuration RPC et Alchemy
  readonly VITE_MAINNET_RPC_URL: string;
  readonly VITE_SEPOLIA_RPC_URL: string;
  readonly VITE_ALCHEMY_API_KEY: string;

  // WalletConnect Configuration
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string;

  // Adresses des contrats - Sepolia
  readonly VITE_TOKEN_FACTORY_SEPOLIA: string;
  readonly VITE_PLATFORM_TOKEN_SEPOLIA: string;
  readonly VITE_TAX_SYSTEM_SEPOLIA: string;
  readonly VITE_TOKEN_FORGE_PLANS_SEPOLIA: string;
  readonly VITE_LIQUIDITY_LOCKER_SEPOLIA: string;
  readonly VITE_STAKING_CONTRACT_SEPOLIA: string;
  readonly VITE_LAUNCHPAD_CONTRACT_SEPOLIA: string;

  // Adresses des contrats - Mainnet
  readonly VITE_TOKEN_FACTORY_MAINNET: string;
  readonly VITE_TOKEN_FORGE_PLANS_MAINNET: string;
  readonly VITE_PLATFORM_TOKEN_MAINNET: string;
  readonly VITE_LIQUIDITY_LOCKER_MAINNET: string;
  readonly VITE_STAKING_CONTRACT_MAINNET: string;
  readonly VITE_LAUNCHPAD_CONTRACT_MAINNET: string;

  // Configuration de l'API
  readonly VITE_API_URL: string;

  // Configuration du déploiement
  readonly VITE_DEPLOYMENT_OWNER: `0x${string}`;
  readonly VITE_DEFAULT_GAS_LIMIT: string;
  readonly VITE_GAS_PRICE_MULTIPLIER: string;
  readonly VITE_MAX_PRIORITY_FEE: string;
  readonly VITE_DEPLOYMENT_TIMEOUT: string;
  readonly VITE_VERIFICATION_RETRIES: string;

  // Configuration des plans
  readonly VITE_BASIC_PLAN_PRICE: string;
  readonly VITE_PREMIUM_PLAN_PRICE: string;
  readonly VITE_TKN_PAYMENT_DISCOUNT: string;

  // Configuration de sécurité
  readonly VITE_ALLOW_THIRD_PARTY_COOKIES: string;

  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}
