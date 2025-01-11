export interface MoonPayConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'live' | 'sandbox';
}

export interface MoonPayTransaction {
  id: string;
  status: MoonPayTransactionStatus;
  baseCurrencyAmount: number;
  quoteCurrencyAmount: number;
  baseCurrency: string;
  quoteCurrency: string;
  walletAddress: string;
  createdAt: string;
}

export type MoonPayTransactionStatus =
  | 'waiting'
  | 'pending'
  | 'failed'
  | 'completed';

export interface MoonPayQuote {
  baseCurrencyAmount: number;
  quoteCurrencyAmount: number;
  feeAmount: number;
  extraFeeAmount: number;
  networkFeeAmount: number;
  totalAmount: number;
}
