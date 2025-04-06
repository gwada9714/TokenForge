/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Mode de l'application
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;

  // Configuration Firebase
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_USE_FIREBASE_EMULATOR?: string;

  // Configuration Web3
  readonly VITE_WALLET_CONNECT_PROJECT_ID?: string;
  readonly VITE_TOKEN_FACTORY_ADDRESS?: string;
  readonly VITE_TOKEN_FACTORY_MAINNET?: string;
  readonly VITE_TOKEN_FACTORY_SEPOLIA?: string;
  readonly VITE_ETHERSCAN_API_KEY?: string;
  readonly VITE_ALCHEMY_API_KEY?: string;
  readonly VITE_MOONPAY_API_KEY?: string;
  readonly VITE_MAINNET_RPC_URL?: string;
  readonly VITE_SEPOLIA_RPC_URL?: string;
  readonly VITE_DEFAULT_NETWORK?: string;

  // Configuration API
  readonly VITE_API_URL?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_API_BASE_URL?: string;

  // Configuration Sécurité
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  readonly VITE_CSP_NONCE_LENGTH?: string;
  readonly VITE_STRICT_CSP?: string;
  readonly VITE_CSP_REPORT_URI?: string;
  readonly VITE_SESSION_TIMEOUT?: string;

  // Configuration Logging et Monitoring
  readonly VITE_ENABLE_DEBUG_LOGS?: string;
  readonly VITE_LOG_LEVEL?: string;
  readonly VITE_ERROR_REPORTING_ENABLED?: string;
  readonly VITE_SENTRY_SAMPLE_RATE?: string;
  readonly VITE_RATE_LIMIT_WINDOW?: string;
  readonly VITE_RATE_LIMIT_MAX_REQUESTS?: string;

  // Configuration Cache
  readonly VITE_ENABLE_QUERY_CACHE?: string;
  readonly VITE_CACHE_TIME?: string;
  readonly VITE_MAX_BATCH_SIZE?: string;

  // Configuration Features
  readonly VITE_ENABLE_FAUCET?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_SW_VERSION?: string;
  readonly VITE_SUPPORTED_CHAINS?: string;
  readonly VITE_ENV?: string;

  // Configuration IPFS
  readonly VITE_IPFS_GATEWAY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
