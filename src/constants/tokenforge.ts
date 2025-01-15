import { Address } from 'viem';

// Token TKN addresses par réseau
export const TKN_TOKEN_ADDRESS: { [chainId: number]: Address } = {
  1: '0x...' as Address, // Ethereum Mainnet
  56: '0x...' as Address, // BSC Mainnet
  137: '0x...' as Address, // Polygon Mainnet
  43114: '0x...' as Address, // Avalanche Mainnet
};

// Adresses du Treasury par réseau
export const TREASURY_ADDRESS: { [chainId: number]: Address } = {
  1: '0x...' as Address,
  56: '0x...' as Address,
  137: '0x...' as Address,
  43114: '0x...' as Address,
};

// Prix des niveaux de service (en TKN)
export const BASIC_TIER_PRICE = BigInt(100 * 10**18); // 100 TKN
export const PREMIUM_TIER_PRICE = BigInt(1000 * 10**18); // 1000 TKN

// Réduction pour paiement en TKN (20%)
export const TKN_PAYMENT_DISCOUNT = 2000; // 20% = 2000 basis points

// Taux de taxe de la forge
export const FORGE_TAX_RATE = 100; // 1% = 100 basis points

// Configuration du staking
export const STAKING_CONFIG = {
  MINIMUM_AMOUNT: BigInt(1000 * 10**18), // 1000 TKN
  LOCK_PERIOD: 30 * 24 * 60 * 60, // 30 jours en secondes
  APY: 500, // 5% = 500 basis points
};

// Répartition des taxes
export const TAX_DISTRIBUTION = {
  TREASURY: 7000, // 70%
  DEVELOPMENT: 1500, // 15%
  BUYBACK: 1000, // 10%
  STAKING: 500, // 5%
};
