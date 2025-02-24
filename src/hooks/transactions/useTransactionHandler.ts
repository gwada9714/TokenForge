import { useCallback } from 'react';
import { Hash } from 'viem';
import { usePublicClient } from 'wagmi';
import { useTransactionState } from './useTransactionState';

interface TransactionConfig {
  onSuccess?: (hash: Hash) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

export const useTransactionHandler = (config: TransactionConfig = {}) => {
  const {
    state,
    reset,
    setMining,
    setPending,
    setSuccess,
    setError
  } = useTransactionState();

  const publicClient = usePublicClient();

  const { onSuccess, onError, onSettled } = config;

  const waitForTransaction = useCallback(async (hash: Hash) => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    try {
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const blockNumber = Number(receipt.blockNumber);
      setSuccess(hash, blockNumber);
      onSuccess?.(hash);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Transaction failed'));
      onError?.(error instanceof Error ? error : new Error('Transaction failed'));
    } finally {
      onSettled?.();
    }
  }, [publicClient, setSuccess, setError, onSuccess, onError, onSettled]);

  const handleTransaction = useCallback(async <T extends () => Promise<Hash>>(
    transactionFn: T
  ) => {
    try {
      setPending();
      const hash = await transactionFn();
      setMining(hash);
      await waitForTransaction(hash);
      return hash;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Transaction failed'));
      onError?.(error instanceof Error ? error : new Error('Transaction failed'));
      return null;
    } finally {
      onSettled?.();
    }
  }, [setPending, setMining, waitForTransaction, setError, onError, onSettled]);

  return {
    handleTransaction,
    transactionState: state,
    reset,
  };
};

export default useTransactionHandler;
