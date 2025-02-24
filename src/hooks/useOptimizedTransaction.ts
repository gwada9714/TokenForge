import { useState, useCallback, useRef } from 'react';
import { useErrorHandler } from '../components/hook/useErrorHandler';
import { TokenForgeErrorCode, TokenForgeError } from '../utils/errors';

interface TransactionState {
  isPending: boolean;
  isSuccess: boolean;
  hash?: string;
  confirmations: number;
}

interface TransactionOptions {
  maxRetries?: number;
  baseDelay?: number;
  minConfirmations?: number;
}

const DEFAULT_OPTIONS: Required<TransactionOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  minConfirmations: 1
};

export const useOptimizedTransaction = () => {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    confirmations: 0
  });

  const { handleError, retryOperation } = useErrorHandler();
  const abortController = useRef<AbortController>();

  // Nettoie les ressources précédentes
  const cleanup = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  const executeTransaction = useCallback(async <T>(
    transaction: () => Promise<T>
  ): Promise<T | null> => {
    cleanup();
    abortController.current = new AbortController();
    
    setState({
      isPending: true,
      isSuccess: false,
      confirmations: 0
    });

    try {
      // Exécute la transaction avec retry automatique
      const result = await retryOperation(
        transaction,
        DEFAULT_OPTIONS.maxRetries,
        DEFAULT_OPTIONS.baseDelay
      );

      if (abortController.current.signal.aborted) {
        throw new TokenForgeError(
          'Transaction annulée',
          TokenForgeErrorCode.TX_REJECTED
        );
      }

      setState(prev => ({
        ...prev,
        isSuccess: true,
        isPending: false,
        hash: typeof result === 'string' ? result : undefined
      }));

      return result;
    } catch (error) {
      handleError(error);
      setState(prev => ({
        ...prev,
        isPending: false,
        isSuccess: false
      }));
      return null;
    }
  }, [handleError, retryOperation, cleanup]);

  const cancelTransaction = useCallback(() => {
    cleanup();
    setState({
      isPending: false,
      isSuccess: false,
      confirmations: 0
    });
  }, [cleanup]);

  return {
    ...state,
    executeTransaction,
    cancelTransaction
  };
};
