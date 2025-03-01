import { useState, useCallback } from 'react';
import { PaymentService } from '../services/PaymentServiceFixed';
import { 
  PaymentStatus, 
  CryptocurrencyInfo, 
  FeeEstimate, 
  CryptoAmount, 
  PaymentInitParams, 
  PaymentSession 
} from '../types/payment';

/**
 * Hook React pour la gestion des paiements (nouvelle API)
 * Permet de créer et gérer des sessions de paiement sur différentes blockchains
 * 
 * @param chainName Nom de la blockchain (ethereum, binance, polygon, avalanche, arbitrum, solana)
 * @param walletProvider Provider du wallet (window.ethereum, etc.)
 * @returns Fonctions et états pour la gestion des paiements
 */
export const usePayment = (chainName: string, walletProvider?: any) => {
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedFees, setEstimatedFees] = useState<FeeEstimate | null>(null);
  const [supportedCurrencies, setSupportedCurrencies] = useState<CryptocurrencyInfo[]>([]);
  const [cryptoAmount, setCryptoAmount] = useState<CryptoAmount | null>(null);

  // Créer une instance du service de paiement
  const getPaymentService = useCallback(() => {
    return new PaymentService(chainName, walletProvider);
  }, [chainName, walletProvider]);

  // Récupérer les cryptomonnaies supportées
  const getSupportedCryptocurrencies = useCallback(async () => {
    setError(null);
    try {
      const paymentService = getPaymentService();
      const currencies = await paymentService.getSupportedCryptocurrencies();
      setSupportedCurrencies(currencies);
      return currencies;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    }
  }, [getPaymentService]);

  // Convertir un montant EUR en crypto
  const convertEURtoCrypto = useCallback(async (amountEUR: number, currencySymbol: string) => {
    setError(null);
    try {
      const paymentService = getPaymentService();
      const amount = await paymentService.convertEURtoCrypto(amountEUR, currencySymbol);
      setCryptoAmount(amount);
      return amount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    }
  }, [getPaymentService]);

  // Estimer les frais de transaction
  const estimateTransactionFees = useCallback(async (amount: number, currencyAddress: string | null) => {
    setError(null);
    try {
      const paymentService = getPaymentService();
      const fees = await paymentService.estimateTransactionFees(amount, currencyAddress);
      setEstimatedFees(fees);
      return fees;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    }
  }, [getPaymentService]);

  // Initialiser une session de paiement
  const initPaymentSession = useCallback(async (params: PaymentInitParams) => {
    setError(null);
    setIsProcessing(true);
    try {
      const paymentService = getPaymentService();
      const newSession = await paymentService.initPaymentSession(params);
      setSession(newSession);
      setPaymentStatus(newSession.status);
      setIsProcessing(false);
      return newSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsProcessing(false);
      return null;
    }
  }, [getPaymentService]);

  // Vérifier le statut d'un paiement
  const checkPaymentStatus = useCallback(async (sessionId: string) => {
    setError(null);
    try {
      const paymentService = getPaymentService();
      const status = await paymentService.checkPaymentStatus(sessionId);
      setPaymentStatus(status);
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    }
  }, [getPaymentService]);

  // Confirmer un paiement
  const confirmPayment = useCallback(async (sessionId: string, txHash: string) => {
    setError(null);
    setIsProcessing(true);
    try {
      const paymentService = getPaymentService();
      const confirmed = await paymentService.confirmPayment(sessionId, txHash);
      setIsProcessing(false);
      
      // Mettre à jour le statut si la confirmation a réussi
      if (confirmed) {
        await checkPaymentStatus(sessionId);
      }
      
      return confirmed;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsProcessing(false);
      return false;
    }
  }, [getPaymentService, checkPaymentStatus]);

  // Créer une session de paiement (ancienne API pour compatibilité)
  const createPaymentSession = useCallback(async (amount: bigint, currency: string) => {
    setError(null);
    setIsProcessing(true);
    try {
      const paymentService = getPaymentService();
      const id = await paymentService.createPaymentSession(amount, currency);
      setIsProcessing(false);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsProcessing(false);
      return null;
    }
  }, [getPaymentService]);

  // Obtenir le statut d'un paiement (ancienne API pour compatibilité)
  const getPaymentStatus = useCallback(async (id: string) => {
    setError(null);
    try {
      const paymentService = getPaymentService();
      const status = await paymentService.getPaymentStatus(id);
      setIsProcessing(false);
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    }
  }, [getPaymentService]);

  // Vérifier un paiement par hash de transaction (ancienne API pour compatibilité)
  const verifyPayment = useCallback(async (transactionHash: string) => {
    setError(null);
    setIsProcessing(true);
    try {
      const paymentService = getPaymentService();
      const isValid = await paymentService.verifyPayment(transactionHash);
      setIsProcessing(false);
      return isValid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsProcessing(false);
      return false;
    }
  }, [getPaymentService]);

  // Calculer les frais pour un montant donné (ancienne API pour compatibilité)
  const calculateFees = useCallback(async (amount: bigint) => {
    setError(null);
    try {
      const paymentService = getPaymentService();
      const fees = await paymentService.calculateFees(amount);
      return fees;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    }
  }, [getPaymentService]);

  // Rafraîchir le statut du paiement actuel
  const refreshCurrentStatus = useCallback(async () => {
    if (!session) return null;
    return await checkPaymentStatus(session.sessionId);
  }, [session, checkPaymentStatus]);

  return {
    // Nouvelle API
    getSupportedCryptocurrencies,
    convertEURtoCrypto,
    estimateTransactionFees,
    initPaymentSession,
    checkPaymentStatus,
    confirmPayment,
    session,
    supportedCurrencies,
    cryptoAmount,
    
    // Ancienne API pour compatibilité
    createPaymentSession,
    getPaymentStatus,
    verifyPayment,
    calculateFees,
    refreshCurrentStatus,
    
    // États partagés
    paymentStatus,
    isProcessing,
    estimatedFees,
    error
  };
};
