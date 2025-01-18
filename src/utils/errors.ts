// Codes d'erreur spécifiques à TokenForge
export enum TokenForgeErrorCode {
  // Erreurs de validation
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_TOKEN_NAME = "INVALID_TOKEN_NAME",
  INVALID_TOKEN_SYMBOL = "INVALID_TOKEN_SYMBOL",
  INVALID_AMOUNT = "INVALID_AMOUNT",
  INVALID_DECIMALS = "INVALID_DECIMALS",
  INVALID_CONFIG = "INVALID_CONFIG",
  
  // Erreurs de contrat
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
  CONTRACT_CALL_FAILED = "CONTRACT_CALL_FAILED",
  DEPLOYMENT_FAILED = "DEPLOYMENT_FAILED",
  CONTRACT_PAUSED = "CONTRACT_PAUSED",
  
  // Erreurs de transaction
  TX_FAILED = 'TX_FAILED',
  TX_REJECTED = 'TX_REJECTED',
  TX_PREPARATION_FAILED = 'TX_PREPARATION_FAILED',
  TX_TIMEOUT = "TX_TIMEOUT",
  TX_IN_PROGRESS = 'TX_IN_PROGRESS',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  
  // Erreurs de connexion
  NOT_CONNECTED = 'NOT_CONNECTED',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  
  // Erreurs de réseau
  WRONG_NETWORK = 'WRONG_NETWORK',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Erreurs de permission
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_ADMIN = 'NOT_ADMIN',
  
  // Autres erreurs
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

// Classe d'erreur personnalisée pour TokenForge
export class TokenForgeError extends Error {
  code: TokenForgeErrorCode;
  public readonly originalError?: unknown;
  
  constructor(message: string, code: TokenForgeErrorCode, originalError?: unknown) {
    super(message);
    this.name = 'TokenForgeError';
    this.code = code;
    this.originalError = originalError;
    
    // Capture de la stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TokenForgeError);
    }
  }
}

// Fonction utilitaire pour obtenir le message d'erreur
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof TokenForgeError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Une erreur inconnue est survenue';
};

import { memoize } from './memoize';

// Memoize les fonctions de vérification d'erreur pour de meilleures performances
export const isUserRejection = memoize((error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('user rejected') || 
         message.includes('user denied') || 
         message.includes('user cancelled');
});

export const isNetworkError = memoize((error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('network') || 
         message.includes('connection') || 
         message.includes('timeout') ||
         message.includes('disconnected');
});

// Optimisation du withRetry avec exponential backoff et jitter
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isNetworkError(error)) throw error;
      
      // Exponential backoff with jitter
      const jitter = Math.random() * 0.3 - 0.15; // ±15%
      const delay = baseDelay * Math.pow(2, i) * (1 + jitter);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Fonction utilitaire pour gérer les erreurs
export const handleError = (error: unknown): TokenForgeError => {
  // Log l'erreur pour le debugging
  console.error('[TokenForge Error]:', error);

  if (error instanceof TokenForgeError) {
    return error;
  }

  const message = getErrorMessage(error);
  
  // Catégorisation améliorée des erreurs
  if (isUserRejection(error)) {
    return new TokenForgeError(message, TokenForgeErrorCode.TX_REJECTED, error);
  }
  
  if (isNetworkError(error)) {
    return new TokenForgeError(message, TokenForgeErrorCode.NETWORK_ERROR, error);
  }

  // Gestion des erreurs de contrat
  if (message.includes("execution reverted")) {
    return new TokenForgeError(
      "L'exécution du contrat a échoué",
      TokenForgeErrorCode.CONTRACT_CALL_FAILED,
      error
    );
  }

  return new TokenForgeError(message, TokenForgeErrorCode.UNKNOWN_ERROR, error);
};
