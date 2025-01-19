import { TokenConfig } from '../types';
import { TOKEN_VALIDATION } from '../constants';

export const validateTokenName = (name: string): string | null => {
  if (!name) return 'Token name is required';
  if (name.length < TOKEN_VALIDATION.NAME_MIN_LENGTH) {
    return `Token name must be at least ${TOKEN_VALIDATION.NAME_MIN_LENGTH} characters`;
  }
  if (name.length > TOKEN_VALIDATION.NAME_MAX_LENGTH) {
    return `Token name must be less than ${TOKEN_VALIDATION.NAME_MAX_LENGTH} characters`;
  }
  return null;
};

export const validateTokenSymbol = (symbol: string): string | null => {
  if (!symbol) return 'Token symbol is required';
  if (symbol.length < TOKEN_VALIDATION.SYMBOL_MIN_LENGTH) {
    return `Token symbol must be at least ${TOKEN_VALIDATION.SYMBOL_MIN_LENGTH} characters`;
  }
  if (symbol.length > TOKEN_VALIDATION.SYMBOL_MAX_LENGTH) {
    return `Token symbol must be less than ${TOKEN_VALIDATION.SYMBOL_MAX_LENGTH} characters`;
  }
  return null;
};

export const validateTokenConfig = (config: TokenConfig): Record<string, string | null> => {
  return {
    name: validateTokenName(config.name),
    symbol: validateTokenSymbol(config.symbol),
    decimals: config.decimals > TOKEN_VALIDATION.MAX_DECIMALS 
      ? `Decimals must be less than or equal to ${TOKEN_VALIDATION.MAX_DECIMALS}`
      : null,
    totalSupply: !config.totalSupply 
      ? 'Total supply is required'
      : null,
  };
};
