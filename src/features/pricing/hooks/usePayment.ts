import { useState, useCallback } from 'react';
import { useAccount, useNetwork, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { PaymentDetails, PlanType, PaymentCurrency } from '../types/plans';
import { paymentService } from '../services/paymentService';
import { logger } from '@/core/logger';
import { SUPPORTED_CHAINS } from '@/config/constants/chains';

interface UsePaymentReturn {
  initiatePayment: (planId: PlanType) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
  currentPayment: PaymentDetails | null;
}

export const usePayment = (): UsePaymentReturn => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: walletClient } = useWalletClient();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPayment, setCurrentPayment] = useState<PaymentDetails | null>(null);

  const initiatePayment = useCallback(async (planId: PlanType) => {
    if (!address || !chain || !walletClient) {
      setError('Wallet non connecté');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Déterminer la devise en fonction du réseau
      const currency = determineCurrency(chain.id);
      const network = SUPPORTED_CHAINS[chain.id];

      if (!network) {
        throw new Error('Réseau non supporté');
      }

      // Initier le paiement
      const paymentDetails = await paymentService.initiatePayment(
        planId,
        currency,
        network.config
      );

      setCurrentPayment(paymentDetails);

      // Envoyer la transaction
      const hash = await sendTransaction(
        walletClient,
        paymentDetails.amount,
        currency
      );

      // Confirmer le paiement
      const confirmedPayment = await paymentService.confirmPayment(
        paymentDetails,
        hash
      );

      setCurrentPayment(confirmedPayment);
      logger.info('Paiement effectué avec succès', { hash });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de paiement';
      setError(errorMessage);
      logger.error('Erreur lors du paiement', { error: err });
    } finally {
      setIsProcessing(false);
    }
  }, [address, chain, walletClient]);

  return {
    initiatePayment,
    isProcessing,
    error,
    currentPayment
  };
};

// Utilitaires
const determineCurrency = (chainId: number): PaymentCurrency => {
  switch (chainId) {
    case 1: // Ethereum
      return 'ETH';
    case 56: // BSC
      return 'BNB';
    case 137: // Polygon
      return 'MATIC';
    default:
      return 'ETH';
  }
};

const sendTransaction = async (
  walletClient: any,
  amount: number,
  currency: PaymentCurrency
): Promise<string> => {
  // Adresse du contrat de paiement (à remplacer par la vraie adresse)
  const CONTRACT_ADDRESS = '0x...';

  try {
    const hash = await walletClient.sendTransaction({
      to: CONTRACT_ADDRESS,
      value: parseEther(amount.toString())
    });

    return hash;
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de la transaction', { error });
    throw new Error('Échec de la transaction');
  }
}; 