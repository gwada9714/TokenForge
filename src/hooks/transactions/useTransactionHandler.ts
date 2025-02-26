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
    console.log('Transaction: Waiting for confirmation', { hash });
    
    if (!publicClient) {
      console.error('Transaction: Public client not available');
      throw new Error('Public client not available');
    }

    try {
      console.log('Transaction: Fetching receipt');
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const blockNumber = Number(receipt.blockNumber);
      console.log('Transaction: Confirmed', { hash, blockNumber });
      setSuccess(hash, blockNumber);
      onSuccess?.(hash);
    } catch (error) {
      console.error('Transaction: Failed', { hash, error });
      setError(error instanceof Error ? error : new Error('Transaction failed'));
      onError?.(error instanceof Error ? error : new Error('Transaction failed'));
    } finally {
      console.log('Transaction: Settled', { hash });
      onSettled?.();
    }
  }, [publicClient, setSuccess, setError, onSuccess, onError, onSettled]);

  const handleTransaction = useCallback(async <T extends () => Promise<Hash>>(
    transactionFn: T
  ) => {
    console.log('Transaction: Starting');
    try {
      setPending();
      console.log('Transaction: Executing');
      const hash = await transactionFn();
      console.log('Transaction: Executed', { hash });
      setMining(hash);
      await waitForTransaction(hash);
      return hash;
    } catch (error) {
      console.error('Transaction: Failed to execute', error);
      setError(error instanceof Error ? error : new Error('Transaction failed'));
      onError?.(error instanceof Error ? error : new Error('Transaction failed'));
      return null;
    } finally {
      console.log('Transaction: Completed');
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
