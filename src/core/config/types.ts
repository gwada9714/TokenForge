/**
 * Types pour le système de configuration
 */

import { z } from "zod";

/**
 * Schéma de validation pour les variables d'environnement Firebase
 */
export const FirebaseEnvSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  VITE_FIREBASE_APP_ID: z.string().min(1),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  VITE_USE_FIREBASE_EMULATOR: z.string().optional(),
});

/**
 * Schéma de validation pour les variables d'environnement Web3
 */
export const Web3EnvSchema = z.object({
  VITE_WALLET_CONNECT_PROJECT_ID: z.string().min(1),
  VITE_TOKEN_FACTORY_ADDRESS: z.string().optional(),
  VITE_TOKEN_FACTORY_MAINNET: z.string().optional(),
  VITE_TOKEN_FACTORY_SEPOLIA: z.string().optional(),
  VITE_ETHERSCAN_API_KEY: z.string().min(1),
  VITE_ALCHEMY_API_KEY: z.string().min(1),
  VITE_MOONPAY_API_KEY: z.string().optional(),
  VITE_MAINNET_RPC_URL: z.string().url().optional(),
  VITE_SEPOLIA_RPC_URL: z.string().url().optional(),
  VITE_DEFAULT_NETWORK: z.string().optional(),
  VITE_SUPPORTED_CHAINS: z
    .union([
      z.string().transform((str) =>
        str
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n))
      ),
      z.array(z.number()),
    ])
    .optional(),
});

/**
 * Schéma de validation pour les variables d'environnement API
 */
export const ApiEnvSchema = z.object({
  VITE_API_URL: z.string().url().optional(),
  VITE_API_TIMEOUT: z
    .union([z.string().transform(Number), z.number()])
    .optional(),
  VITE_API_BASE_URL: z.string().url().optional(),
});

/**
 * Schéma de validation pour les variables d'environnement de sécurité
 */
export const SecurityEnvSchema = z.object({
  VITE_RECAPTCHA_SITE_KEY: z.string().optional(),
  VITE_CSP_NONCE_LENGTH: z
    .union([z.string().transform(Number), z.number()])
    .optional(),
  VITE_STRICT_CSP: z
    .union([z.string().transform((val) => val === "true"), z.boolean()])
    .optional(),
  VITE_CSP_REPORT_URI: z.string().optional(),
  VITE_SESSION_TIMEOUT: z
    .union([z.string().transform(Number), z.number()])
    .optional(),
});

/**
 * Schéma de validation pour les variables d'environnement de logging
 */
export const LoggingEnvSchema = z.object({
  VITE_ENABLE_DEBUG_LOGS: z
    .union([z.string().transform((val) => val === "true"), z.boolean()])
    .optional(),
  VITE_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
  VITE_ERROR_REPORTING_ENABLED: z
    .union([z.string().transform((val) => val === "true"), z.boolean()])
    .optional(),
  VITE_SENTRY_SAMPLE_RATE: z
    .union([z.string().transform(Number), z.number()])
    .optional(),
  VITE_RATE_LIMIT_WINDOW: z
    .union([z.string().transform(Number), z.number()])
    .optional(),
  VITE_RATE_LIMIT_MAX_REQUESTS: z
    .union([z.string().transform(Number), z.number()])
    .optional(),
});

/**
 * Schéma de validation pour les variables d'environnement de cache
 */
export const CacheEnvSchema = z.object({
  VITE_ENABLE_QUERY_CACHE: z
    .union([z.string().transform((val) => val === "true"), z.boolean()])
    .optional(),
  VITE_CACHE_TIME: z
    .union([z.string().transform(Number), z.number()])
    .optional(),
  VITE_MAX_BATCH_SIZE: z
    .union([z.string().transform(Number), z.number()])
    .optional(),
});

/**
 * Schéma de validation pour les variables d'environnement de features
 */
export const FeaturesEnvSchema = z.object({
  VITE_ENABLE_FAUCET: z
    .union([z.string().transform((val) => val === "true"), z.boolean()])
    .optional(),
  VITE_ENABLE_ANALYTICS: z
    .union([z.string().transform((val) => val === "true"), z.boolean()])
    .optional(),
  VITE_SW_VERSION: z.string().optional(),
  VITE_ENV: z.enum(["development", "production"]).optional(),
});

/**
 * Schéma de validation pour les variables d'environnement IPFS
 */
export const IpfsEnvSchema = z.object({
  VITE_IPFS_GATEWAY: z.string().url().optional(),
});

/**
 * Schéma de validation pour toutes les variables d'environnement
 */
export const EnvSchema = z.object({
  ...FirebaseEnvSchema.shape,
  ...Web3EnvSchema.shape,
  ...ApiEnvSchema.shape,
  ...SecurityEnvSchema.shape,
  ...LoggingEnvSchema.shape,
  ...CacheEnvSchema.shape,
  ...FeaturesEnvSchema.shape,
  ...IpfsEnvSchema.shape,
});

/**
 * Type pour les variables d'environnement Firebase
 */
export type FirebaseEnv = z.infer<typeof FirebaseEnvSchema>;

/**
 * Type pour les variables d'environnement Web3
 */
export type Web3Env = z.infer<typeof Web3EnvSchema>;

/**
 * Type pour les variables d'environnement API
 */
export type ApiEnv = z.infer<typeof ApiEnvSchema>;

/**
 * Type pour les variables d'environnement de sécurité
 */
export type SecurityEnv = z.infer<typeof SecurityEnvSchema>;

/**
 * Type pour les variables d'environnement de logging
 */
export type LoggingEnv = z.infer<typeof LoggingEnvSchema>;

/**
 * Type pour les variables d'environnement de cache
 */
export type CacheEnv = z.infer<typeof CacheEnvSchema>;

/**
 * Type pour les variables d'environnement de features
 */
export type FeaturesEnv = z.infer<typeof FeaturesEnvSchema>;

/**
 * Type pour les variables d'environnement IPFS
 */
export type IpfsEnv = z.infer<typeof IpfsEnvSchema>;

/**
 * Type pour toutes les variables d'environnement
 */
export type Env = z.infer<typeof EnvSchema>;

/**
 * Interface pour la configuration Firebase
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  useEmulator: boolean;
}

/**
 * Interface pour la configuration Web3
 */
export interface Web3Config {
  walletConnect: {
    projectId: string;
  };
  contracts: {
    tokenFactory: {
      mainnet?: string;
      sepolia?: string;
      default?: string;
    };
  };
  providers: {
    etherscan: {
      apiKey: string;
    };
    alchemy: {
      apiKey: string;
    };
    moonpay?: {
      apiKey: string;
    };
  };
  networks: {
    mainnet?: {
      rpcUrl: string;
    };
    sepolia?: {
      rpcUrl: string;
    };
    default: string;
  };
  supportedChains: number[];
}

/**
 * Interface pour la configuration API
 */
export interface ApiConfig {
  url?: string;
  timeout: number;
  baseUrl?: string;
}

/**
 * Interface pour la configuration de sécurité
 */
export interface SecurityConfig {
  recaptcha?: {
    siteKey: string;
  };
  csp: {
    nonceLength: number;
    strict: boolean;
    reportUri?: string;
  };
  session: {
    timeout: number;
  };
}

/**
 * Interface pour la configuration de logging
 */
export interface LoggingConfig {
  enableDebugLogs: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
  errorReporting: {
    enabled: boolean;
    sampleRate: number;
  };
  rateLimit: {
    window: number;
    maxRequests: number;
  };
}

/**
 * Interface pour la configuration de cache
 */
export interface CacheConfig {
  enableQueryCache: boolean;
  cacheTime: number;
  maxBatchSize: number;
}

/**
 * Interface pour la configuration de features
 */
export interface FeaturesConfig {
  enableFaucet: boolean;
  enableAnalytics: boolean;
  swVersion?: string;
  environment: "development" | "production";
}

/**
 * Interface pour la configuration IPFS
 */
export interface IpfsConfig {
  gateway?: string;
}

/**
 * Interface pour la configuration complète
 */
export interface AppConfig {
  firebase: FirebaseConfig;
  web3: Web3Config;
  api: ApiConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
  cache: CacheConfig;
  features: FeaturesConfig;
  ipfs: IpfsConfig;
}
