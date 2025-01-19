export const TOKEN_TYPES = {
  STANDARD: 'standard',
  MINTABLE: 'mintable',
  BURNABLE: 'burnable',
  PAUSABLE: 'pausable',
} as const;

export const DEFAULT_TOKEN_CONFIG = {
  decimals: 18,
  features: {
    mintable: false,
    burnable: false,
    pausable: false,
  },
} as const;

export const TOKEN_VALIDATION = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 50,
  SYMBOL_MIN_LENGTH: 2,
  SYMBOL_MAX_LENGTH: 10,
  MAX_DECIMALS: 18,
} as const;
