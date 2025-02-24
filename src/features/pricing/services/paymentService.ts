import { PaymentDetails, PlanType, PaymentCurrency } from '../types/plans';
import { NetworkConfig } from '@/features/auth/types/wallet';
import { logger } from '@/utils/firebase-logger';
import { PLANS } from '../config/plans';

class PaymentService {
  private static instance: PaymentService;

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  public async initiatePayment(
    planId: PlanType,
    currency: PaymentCurrency,
    network: NetworkConfig
  ): Promise<PaymentDetails> {
    try {
      const plan = PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan non trouvé');
      }

      // Vérifier si le réseau est supporté pour ce plan
      if (!plan.limitations.networks.includes(network.name)) {
        throw new Error('Réseau non supporté pour ce plan');
      }

      // Créer les détails du paiement
      const paymentDetails: PaymentDetails = {
        planId,
        amount: plan.price.amount,
        currency,
        network,
        timestamp: Date.now(),
        status: 'pending'
      };

      // Enregistrer le paiement dans la base de données
      await this.savePaymentDetails(paymentDetails);

      logger.info('Paiement initié', {
        planId,
        currency,
        network: network.name
      });

      return paymentDetails;
    } catch (error) {
      logger.error('Erreur lors de l\'initiation du paiement', { error });
      throw error;
    }
  }

  public async confirmPayment(
    paymentDetails: PaymentDetails,
    transactionHash: string
  ): Promise<PaymentDetails> {
    try {
      // Vérifier la transaction sur la blockchain
      const isValid = await this.verifyTransaction(transactionHash, paymentDetails);
      
      if (!isValid) {
        throw new Error('Transaction invalide');
      }

      // Mettre à jour le statut du paiement
      const updatedPayment: PaymentDetails = {
        ...paymentDetails,
        status: 'completed',
        transactionHash
      };

      // Sauvegarder les détails mis à jour
      await this.savePaymentDetails(updatedPayment);

      logger.info('Paiement confirmé', {
        planId: paymentDetails.planId,
        transactionHash
      });

      return updatedPayment;
    } catch (error) {
      logger.error('Erreur lors de la confirmation du paiement', { error });
      throw error;
    }
  }

  private async verifyTransaction(
    transactionHash: string,
    paymentDetails: PaymentDetails
  ): Promise<boolean> {
    try {
      // TODO: Implémenter la vérification de la transaction sur la blockchain
      // - Vérifier que le montant correspond
      // - Vérifier que la transaction est confirmée
      // - Vérifier que le destinataire est correct
      return true;
    } catch (error) {
      logger.error('Erreur lors de la vérification de la transaction', { error });
      return false;
    }
  }

  private async savePaymentDetails(paymentDetails: PaymentDetails): Promise<void> {
    try {
      // TODO: Implémenter la sauvegarde dans Firebase
      logger.info('Détails du paiement sauvegardés', {
        paymentId: paymentDetails.timestamp
      });
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde des détails du paiement', { error });
      throw error;
    }
  }
}

export const paymentService = PaymentService.getInstance(); 