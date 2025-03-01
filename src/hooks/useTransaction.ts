import { useState, useCallback } from 'react';

interface UseTransactionReturn {
  isPending: boolean;
  error: Error | null;
  executeTransaction: <T>(transactionFn: () => Promise<T>) => Promise<T | undefined>;
}

export const useTransaction = (): UseTransactionReturn => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeTransaction = useCallback(async <T>(
    transactionFn: () => Promise<T>
  ): Promise<T | undefined> => {
    setIsPending(true);
    setError(null);

    try {
      const result = await transactionFn();
      return result;
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err instanceof Error ? err : new Error('Transaction failed'));
      return undefined;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    isPending,
    error,
    executeTransaction,
  };
};
