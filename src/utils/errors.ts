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
  
  // Erreurs de transaction
  TX_FAILED = 'TX_FAILED',
  TX_REJECTED = 'TX_REJECTED',
  TX_PREPARATION_FAILED = 'TX_PREPARATION_FAILED',
  TX_TIMEOUT = "TX_TIMEOUT",
  TX_IN_PROGRESS = 'TX_IN_PROGRESS', // Ajout du nouveau code d'erreur
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  
  // Erreurs de réseau
  WRONG_NETWORK = 'WRONG_NETWORK',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Erreurs de permission
  UNAUTHORIZED = 'UNAUTHORIZED',
  
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
  }
}

// Fonction utilitaire pour obtenir le message d'erreur
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof TokenForgeError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    // Handle specific Ethereum errors
    if (error.message.includes("user rejected")) {
      return "Transaction rejected by user";
    }
    if (error.message.includes("insufficient funds")) {
      return "Insufficient funds for transaction";
    }
    if (error.message.includes("network changed")) {
      return "Network changed unexpectedly";
    }
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return "Une erreur inconnue est survenue";
};

// Fonction utilitaire pour gérer les erreurs
export const handleError = (error: unknown): TokenForgeError => {
  if (error instanceof TokenForgeError) {
    return error;
  }

  const message = getErrorMessage(error);

  if (error instanceof Error) {
    // Conversion des erreurs courantes en TokenForgeError
    if (message.includes("user rejected")) {
      return new TokenForgeError(message, TokenForgeErrorCode.TX_REJECTED);
    }
    if (message.includes("insufficient funds")) {
      return new TokenForgeError(message, TokenForgeErrorCode.INSUFFICIENT_FUNDS);
    }
    if (message.includes("network changed")) {
      return new TokenForgeError(message, TokenForgeErrorCode.WRONG_NETWORK);
    }
    if (message.includes("contract not deployed")) {
      return new TokenForgeError(message, TokenForgeErrorCode.CONTRACT_NOT_FOUND);
    }
  }

  return new TokenForgeError(message, TokenForgeErrorCode.UNKNOWN_ERROR, error);
};

export const isUserRejection = (error: unknown): boolean => {
  if (error instanceof TokenForgeError) {
    return error.code === TokenForgeErrorCode.TX_REJECTED;
  }
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("user rejected") || message.includes("user denied");
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof TokenForgeError) {
    return [
      TokenForgeErrorCode.WRONG_NETWORK,
      TokenForgeErrorCode.NETWORK_ERROR,
    ].includes(error.code);
  }
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("network") || message.includes("chain");
};
