export class TokenForgeError extends Error {
  constructor(
    message: string,
    public readonly code: TokenForgeErrorCode,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'TokenForgeError';
  }
}

export enum TokenForgeErrorCode {
  // Validation errors
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_TOKEN_NAME = 'INVALID_TOKEN_NAME',
  INVALID_TOKEN_SYMBOL = 'INVALID_TOKEN_SYMBOL',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_DECIMALS = 'INVALID_DECIMALS',
  INVALID_CONFIG = 'INVALID_CONFIG',

  // Connection errors
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  WRONG_NETWORK = 'WRONG_NETWORK',
  NETWORK_ERROR = 'NETWORK_ERROR',

  // Transaction errors
  TX_REJECTED = 'TX_REJECTED',
  TX_FAILED = 'TX_FAILED',
  TX_TIMEOUT = 'TX_TIMEOUT',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',

  // Contract errors
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
  CONTRACT_CALL_FAILED = 'CONTRACT_CALL_FAILED',
  DEPLOYMENT_FAILED = 'DEPLOYMENT_FAILED',

  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof TokenForgeError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Handle specific Ethereum errors
    if (error.message.includes('user rejected')) {
      return 'Transaction rejected by user';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error.message.includes('network changed')) {
      return 'Network changed unexpectedly';
    }
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
};

export const handleError = (error: unknown): TokenForgeError => {
  if (error instanceof TokenForgeError) {
    return error;
  }

  const message = getErrorMessage(error);

  if (error instanceof Error) {
    // Conversion des erreurs courantes en TokenForgeError
    if (message.includes('user rejected')) {
      return new TokenForgeError(message, TokenForgeErrorCode.TX_REJECTED);
    }
    if (message.includes('insufficient funds')) {
      return new TokenForgeError(message, TokenForgeErrorCode.INSUFFICIENT_FUNDS);
    }
    if (message.includes('network changed')) {
      return new TokenForgeError(message, TokenForgeErrorCode.WRONG_NETWORK);
    }
    if (message.includes('contract not deployed')) {
      return new TokenForgeError(message, TokenForgeErrorCode.CONTRACT_NOT_FOUND);
    }
  }

  // Erreur par défaut
  return new TokenForgeError(
    'An unexpected error occurred',
    TokenForgeErrorCode.UNKNOWN_ERROR,
    error
  );
};

export const isUserRejection = (error: unknown): boolean => {
  if (error instanceof TokenForgeError) {
    return error.code === TokenForgeErrorCode.TX_REJECTED;
  }
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('user rejected') || message.includes('user denied');
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof TokenForgeError) {
    return [TokenForgeErrorCode.WRONG_NETWORK, TokenForgeErrorCode.NETWORK_ERROR].includes(error.code);
  }
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('network') || message.includes('chain');
};
