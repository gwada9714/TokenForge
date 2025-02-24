// App Constants
export const APP_NAME = 'TokenForge';
export const APP_VERSION = '0.1.0';

// Re-export des constantes de thème
export * from './theme';

// API Constants
export const API_BASE_URL = process.env.VITE_API_BASE_URL;
export const API_TIMEOUT = 30000;

// Firebase Constants
export const FIREBASE_CONFIG = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Auth Constants
export const AUTH_PERSISTENCE = 'LOCAL';
export const MAX_LOGIN_ATTEMPTS = 5;
export const PASSWORD_MIN_LENGTH = 8;

// Cache Constants
export const CACHE_TTL = {
  SHORT: 1000 * 60 * 5, // 5 minutes
  MEDIUM: 1000 * 60 * 30, // 30 minutes
  LONG: 1000 * 60 * 60 * 24, // 24 hours
};

// Feature Flags
export const FEATURES = {
  STAKING: true,
  NFT_SUPPORT: false,
  ANALYTICS: true,
  ADVANCED_TRADING: false,
};

// Blockchain Constants
export const SUPPORTED_CHAINS = {
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
};

export const DEFAULT_CHAIN = SUPPORTED_CHAINS.ETHEREUM; 