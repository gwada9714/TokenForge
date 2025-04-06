import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { moonpayService, MoonPayTransaction } from "../services/moonpayService";

interface UseMoonPayResult {
  initiatePayment: (amount: string) => Promise<MoonPayTransaction>;
  checkTransactionStatus: (
    transactionId: string
  ) => Promise<MoonPayTransaction | null>;
  loading: boolean;
  error: Error | null;
}

const validateAmount = (amount: string): boolean => {
  const parsedAmount = parseFloat(amount);
  return !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= 100; // Limite max de 100 ETH
};

export const useMoonPay = (): UseMoonPayResult => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initiatePayment = useCallback(
    async (amount: string): Promise<MoonPayTransaction> => {
      if (!address) {
        throw new Error("Portefeuille non connecté");
      }

      if (!validateAmount(amount)) {
        throw new Error("Le montant doit être compris entre 0 et 100 ETH");
      }

      try {
        setLoading(true);
        setError(null);

        const transaction = await moonpayService.initiateTransaction(
          address,
          amount
        );
        return transaction;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Erreur lors de l'initialisation du paiement");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [address]
  );

  const checkTransactionStatus = useCallback(
    async (transactionId: string): Promise<MoonPayTransaction | null> => {
      if (!transactionId) {
        throw new Error("ID de transaction invalide");
      }

      try {
        setLoading(true);
        setError(null);

        const transaction = await moonpayService.getTransaction(transactionId);

        if (!transaction) {
          throw new Error("Transaction non trouvée");
        }

        return transaction;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Erreur lors de la vérification de la transaction");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    initiatePayment,
    checkTransactionStatus,
    loading,
    error,
  };
};
