import { Address } from 'viem';

// Adresses des contrats sur Sepolia
export const TKN_TOKEN_ADDRESS = '0x6829C3fAdcD7a68f613b9d68a1ed873d5C2E745d' as const;
export const TOKEN_FACTORY_ADDRESS = '0xB0B6ED3e12f9Bb24b1bBC3413E3bb374A6e8B2E5' as const;
export const TAX_SYSTEM_ADDRESS = '0x37A15951Ac7d8b24A0bB9c3Eb5fB788866238EcA' as const;

// Prix des plans (en wei)
export const BASIC_TIER_PRICE = BigInt(100 * 10**18); // 100 TKN
export const PREMIUM_TIER_PRICE = BigInt(1000 * 10**18); // 1000 TKN

// Configuration des frais
export const PLATFORM_FEE = 100; // 1% = 100 basis points
export const TKN_PAYMENT_DISCOUNT = 2000; // 20% = 2000 basis points

// Limites et configurations
export const MAX_TOKEN_SUPPLY = BigInt(1000000000 * 10**18); // 1 milliard de tokens
export const MIN_TOKEN_SUPPLY = BigInt(1000 * 10**18); // 1000 tokens
export const DEFAULT_DECIMALS = 18;

// Timeouts et retries
export const DEPLOYMENT_TIMEOUT = 180000; // 3 minutes
export const VERIFICATION_RETRIES = 3;
export const VERIFICATION_RETRY_DELAY = 10000; // 10 secondes

// Gas et prix
export const GAS_LIMIT_MULTIPLIER = 1.2;
export const GAS_PRICE_MULTIPLIER = 1.1;
