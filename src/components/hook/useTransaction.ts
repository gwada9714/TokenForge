// src/components/hook/useTransaction.ts
import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

export const useTransaction = () => {
  const [isPending, setIsPending] = useState(false);
  const { handleError } = useErrorHandler();

  const executeTransaction = useCallback(async (
    transaction: () => Promise<any>
  ) => {
    setIsPending(true);
    try {
      const result = await transaction();
      return result;
    } catch (error) {
      handleError(error as Error);
      return null;
    } finally {
      setIsPending(false);
    }
  }, [handleError]);

  return { isPending, executeTransaction };
};