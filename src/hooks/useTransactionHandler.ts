import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  TransactionResponse,
  TransactionReceipt,
} from "@ethersproject/abstract-provider";
import { useNetwork } from "/useNetwork";
import { getNetwork } from "../config/networks";

interface TransactionState {
  isLoading: boolean;
  error: Error | null;
  hash: string | null;
  receipt: TransactionReceipt | null;
}

interface TransactionOptions {
  onSuccess?: (receipt: TransactionReceipt) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  pendingMessage?: string;
  errorPrefix?: string;
}

export const useTransactionHandler = () => {
  const { chain } = useNetwork();
  const [transactionState, setState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    hash: null,
    receipt: null,
  });

  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      hash: null,
      receipt: null,
    });
  }, []);

  const handleTransaction = useCallback(
    async (
      transactionPromise: Promise<TransactionResponse>,
      options: TransactionOptions = {}
    ) => {
      const {
        onSuccess,
        onError,
        successMessage = "Transaction réussie",
        pendingMessage = "Transaction en cours",
        errorPrefix = "Erreur de transaction",
      } = options;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Envoi de la transaction
        const tx = await transactionPromise;
        setState((prev) => ({ ...prev, hash: tx.hash }));

        // Notification de transaction en attente
        const pendingToast = toast.loading(pendingMessage);

        // Attente de la confirmation
        const receipt = await tx.wait();
        setState((prev) => ({
          ...prev,
          isLoading: false,
          receipt,
        }));

        // Notification de succès
        toast.dismiss(pendingToast);
        toast.success(successMessage);

        // Callback de succès
        onSuccess?.(receipt);

        // Lien vers l'explorateur
        const network = getNetwork(chain?.id || 0);
        if (network?.explorerUrl) {
          const explorerUrl = `${network.explorerUrl}/tx/${tx.hash}`;
          toast.success(`Transaction confirmée - ${explorerUrl}`, {
            duration: 5000,
          });
        }

        return receipt;
      } catch (err) {
        const error = err as Error;
        console.error("Transaction error:", error);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error,
        }));

        // Notification d'erreur
        toast.error(`${errorPrefix}: ${error.message}`);

        // Callback d'erreur
        onError?.(error);

        throw error;
      }
    },
    [chain?.id]
  );

  return {
    ...transactionState,
    handleTransaction,
    resetState,
  };
};
