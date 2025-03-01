/**
 * Types partagés pour le système de paiement
 */

export enum PaymentStatus {
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  FAILED = 'failed'
}

export interface CryptocurrencyInfo {
  symbol: string; // Ex: 'ETH', 'USDT'
  address: string | null; // Null for native cryptos like ETH, BNB
  name: string; // Ex: 'Ethereum', 'Tether USD'
  decimals: number; // Nombre de décimales
  isNative: boolean; // true for ETH, BNB, MATIC, etc.
  isStablecoin: boolean; // true for USDT, USDC, etc.
  logoUrl: string; // URL du logo
  minAmount: number; // Montant minimum accepté en valeur EUR
}

export interface CryptoAmount {
  amount: string; // Amount in smallest unit (wei, satoshi, etc.)
  formatted: string; // Human-readable formatted amount with symbol
  valueEUR: number; // Equivalent value in EUR
}

export interface FeeEstimate {
  baseFee: CryptoAmount;
  maxFee: CryptoAmount;
  estimatedTimeSeconds: number;
}

export interface PaymentInitParams {
  userId: string;
  productId: string;
  productType: 'token_creation' | 'subscription' | 'premium_service' | 'marketplace';
  amount: number; // Montant en équivalent EUR
  discountCode?: string;
  subscriptionPeriod?: 'monthly' | 'annual';
  currency: string; // Symbol or address of the cryptocurrency/token to use
  payerAddress: string; // Address of the user's wallet
}

export interface PaymentSession {
  sessionId: string;
  receivingAddress: string; // Adresse du wallet MetaMask (92e92b2705edc3d4c7204f961cc659c0)
  amountDue: CryptoAmount;
  currency: CryptocurrencyInfo;
  exchangeRate: number;
  expiresAt: number; // Timestamp d'expiration
  chainId: number; // ID de la blockchain
  status: PaymentStatus;
  minConfirmations: number; // Nombre de confirmations requis
}

// Type pour la compatibilité avec l'ancien système
export interface LegacyPaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  details: Record<string, any>;
}
