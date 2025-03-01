import { PaymentStatus } from '../types';

/**
 * Interface pour les services de paiement blockchain
 * Définit les méthodes pour gérer les paiements sur différentes blockchains
 */
export interface IPaymentService {
  // Méthodes pour la gestion des paiements
  createPaymentSession(amount: bigint, currency: string): Promise<string>; // Retourne ID session
  getPaymentStatus(sessionId: string): Promise<PaymentStatus>;
  verifyPayment(transactionHash: string): Promise<boolean>;
  calculateFees(amount: bigint): Promise<bigint>;
}
