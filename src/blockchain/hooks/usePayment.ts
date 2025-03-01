import { useState, useCallback } from 'react';
import { createPaymentService } from '../factory';
import { PaymentStatus } from '../types';

/**
 * Hook React pour la gestion des paiements
 * Permet de créer et gérer des sessions de paiement sur différentes blockchains
 * 
 * @param chainName Nom de la blockchain (ethereum, binance, polygon, avalanche, etc.)
 * @param walletProvider Provider du wallet (window.ethereum, etc.)
 * @returns Fonctions et états pour la gestion des paiements
 */
export const usePayment = (chainName: string, walletProvider?: any) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedFees, setEstimatedFees] = useState<bigint | null>(null);

  // Créer une session de paiement
  const createPaymentSession = useCallback(async (amount: bigint, currency: string) => {
    setError(null);
    setIsProcessing(true);
    try {
      const paymentService = createPaymentService(chainName, walletProvider);
      const id = await paymentService.createPaymentSession(amount, currency);
      setSessionId(id);
      setIsProcessing(false);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsProcessing(false);
      return null;
    }
  }, [chainName, walletProvider]);

  // Obtenir le statut d'un paiement
  const getPaymentStatus = useCallback(async (id: string) => {
    setError(null);
    try {
      const paymentService = createPaymentService(chainName, walletProvider);
      const status = await paymentService.getPaymentStatus(id);
      setPaymentStatus(status);
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    }
  }, [chainName, walletProvider]);

  // Vérifier un paiement par hash de transaction
  const verifyPayment = useCallback(async (transactionHash: string) => {
    setError(null);
    setIsProcessing(true);
    try {
      const paymentService = createPaymentService(chainName, walletProvider);
      const isValid = await paymentService.verifyPayment(transactionHash);
      setIsProcessing(false);
      return isValid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsProcessing(false);
      return false;
    }
  }, [chainName, walletProvider]);

  // Calculer les frais pour un montant donné
  const calculateFees = useCallback(async (amount: bigint) => {
    setError(null);
    try {
      const paymentService = createPaymentService(chainName, walletProvider);
      const fees = await paymentService.calculateFees(amount);
      setEstimatedFees(fees);
      return fees;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    }
  }, [chainName, walletProvider]);

  // Rafraîchir le statut du paiement actuel
  const refreshCurrentStatus = useCallback(async () => {
    if (!sessionId) return null;
    return await getPaymentStatus(sessionId);
  }, [sessionId, getPaymentStatus]);

  return {
    createPaymentSession,
    getPaymentStatus,
    verifyPayment,
    calculateFees,
    refreshCurrentStatus,
    sessionId,
    paymentStatus,
    isProcessing,
    estimatedFees,
    error
  };
};
