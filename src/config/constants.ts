import {
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
} from "firebase/auth";

export const TEST_WALLET_ADDRESS =
  "0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A" as const;
export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;

export const DEFAULT_TOKEN_CONFIG = {
  name: "Test Token",
  symbol: "TEST",
  decimals: 18,
  initialSupply: "1000000",
};

export const CHAIN_EXPLORER_URLS = {
  1: "https://etherscan.io",
  11155111: "https://sepolia.etherscan.io",
} as const;

// Temps d'attente entre les vérifications de statut de transaction (en ms)
export const TX_POLLING_INTERVAL = 5000;

// Nombre de confirmations requis pour considérer une transaction comme finalisée
export const REQUIRED_CONFIRMATIONS = {
  1: 3, // mainnet
  11155111: 1, // sepolia
} as const;

/** Configuration des réseaux */
export const NETWORKS = {
  SEPOLIA: {
    ID: 11155111,
    NAME: "Sepolia",
    RPC_URL: "https://sepolia.infura.io/v3/",
  },
} as const;

/** Configuration de validation */
export const VALIDATION = {
  ADDRESS: {
    LENGTH: 42,
    PREFIX: "0x",
    REGEX: /^0x[a-fA-F0-9]{40}$/,
  },
  TOKEN: {
    NAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 50,
    },
    SYMBOL: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 10,
    },
  },
} as const;

/** Messages d'erreur */
export const ERROR_MESSAGES = {
  NETWORK: {
    WRONG_NETWORK: (current: string) =>
      `Veuillez vous connecter au réseau ${NETWORKS.SEPOLIA.NAME} (actuel: ${current})`,
    NOT_CONNECTED: "Veuillez connecter votre portefeuille",
  },
  CONTRACT: {
    INVALID_ADDRESS: "Adresse de contrat invalide",
    NOT_FOUND: "Contrat non trouvé",
    NOT_OWNER: "Seul le propriétaire peut effectuer cette action",
  },
  VALIDATION: {
    INVALID_ADDRESS: "L'adresse doit être une adresse Ethereum valide",
    EMPTY_ADDRESS: "L'adresse ne peut pas être vide",
    WRONG_PREFIX: "L'adresse doit commencer par '0x'",
    WRONG_LENGTH: "L'adresse doit faire exactement 42 caractères",
    INVALID_CHARS: "L'adresse contient des caractères invalides",
  },
  TRANSACTION: {
    FAILED: "La transaction a échoué",
    REJECTED: "Transaction rejetée par l'utilisateur",
    PREPARATION_FAILED: "Impossible de préparer la transaction",
  },
} as const;

/** Configuration des timeouts (en ms) */
export const TIMEOUTS = {
  TRANSACTION: 30000, // 30 secondes
  NOTIFICATION: 6000, // 6 secondes
} as const;

/** Configuration UI */
export const UI = {
  NOTIFICATIONS: {
    POSITION: {
      vertical: "bottom" as const,
      horizontal: "right" as const,
    },
    AUTO_HIDE_DURATION: TIMEOUTS.NOTIFICATION,
  },
} as const;

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Catégories de logging
export const LOG_CATEGORIES = {
  FIREBASE: "Firebase",
  AUTH: "Auth",
  TOKEN: "Token",
  SERVICES: "Services",
  ADMIN: "Admin",
  SYSTEM: "System",
} as const;

/** Configuration de l'authentification */
export const AUTH_CONFIG = {
  PERSISTENCE: {
    LOCAL: browserLocalPersistence, // Persistance locale (reste connecté après fermeture du navigateur)
    SESSION: browserSessionPersistence, // Persistance de session (déconnecté à la fermeture du navigateur)
    NONE: inMemoryPersistence, // Pas de persistance (déconnecté au refresh de la page)
  },
  SESSION_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 jours en millisecondes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes en millisecondes
} as const;

export const AUTH_PERSISTENCE = AUTH_CONFIG.PERSISTENCE.LOCAL; // Persistance par défaut

/** Configuration de l'application */
export const APP_CONFIG = {
  NAME: "TokenForge",
  VERSION: "1.0.0",
  DESCRIPTION: "Plateforme de création et gestion de tokens",
  AUTHOR: "TokenForge Team",
  CONTACT: "contact@tokenforge.io",
  SUPPORT_EMAIL: "support@tokenforge.io",
  WEBSITE: "https://tokenforge.io",
  SOCIAL: {
    TWITTER: "https://twitter.com/tokenforge",
    TELEGRAM: "https://t.me/tokenforge",
    DISCORD: "https://discord.gg/tokenforge",
    GITHUB: "https://github.com/tokenforge",
  },
} as const;

export const APP_NAME = APP_CONFIG.NAME;
