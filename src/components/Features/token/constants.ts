// Token configuration constants
export const TKN_TOKEN_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with actual address
export const PREMIUM_TIER_PRICE = '0.1';
export const BASIC_TIER_PRICE = '0.05';
export const TKN_PAYMENT_DISCOUNT = 20; // 20% discount when paying with TKN

// Token validation constants
export const TOKEN_VALIDATION = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 50,
  SYMBOL_MIN_LENGTH: 2,
  SYMBOL_MAX_LENGTH: 10,
  MAX_DECIMALS: 18,
} as const;

// Token types
export const TOKEN_TYPES = {
  STANDARD: 'standard',
  MINTABLE: 'mintable',
  BURNABLE: 'burnable',
  PAUSABLE: 'pausable',
} as const;

// Default configurations
export const DEFAULT_TOKEN_CONFIG = {
  decimals: 18,
  features: {
    mintable: false,
    burnable: false,
    pausable: false,
  },
} as const;
