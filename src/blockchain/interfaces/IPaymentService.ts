import {
  PaymentStatus,
  LegacyPaymentStatus,
  CryptocurrencyInfo,
  FeeEstimate,
  CryptoAmount,
  PaymentInitParams,
  PaymentSession,
} from "../types/payment";

/**
 * Interface pour les services de paiement blockchain
 * Définit les méthodes pour gérer les paiements sur différentes blockchains
 */
export interface IPaymentService {
  // Méthodes pour la gestion des paiements (nouvelle API)
  initPaymentSession(params: PaymentInitParams): Promise<PaymentSession>;
  checkPaymentStatus(sessionId: string): Promise<PaymentStatus>;
  confirmPayment(sessionId: string, txHash: string): Promise<boolean>;
  getSupportedCryptocurrencies(): Promise<CryptocurrencyInfo[]>;
  estimateTransactionFees(
    amount: number,
    currencyAddress: string | null
  ): Promise<FeeEstimate>;
  convertEURtoCrypto(
    amountEUR: number,
    currencySymbol: string
  ): Promise<CryptoAmount>;

  // Méthodes pour la compatibilité avec l'ancienne API
  createPaymentSession(amount: bigint, currency: string): Promise<string>;
  getPaymentStatus(sessionId: string): Promise<LegacyPaymentStatus>;
  verifyPayment(transactionHash: string): Promise<boolean>;
  calculateFees(amount: bigint): Promise<bigint>;
}
