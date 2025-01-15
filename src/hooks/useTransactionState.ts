import { useState } from 'react';

export const useTransactionState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const startTransaction = () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
  };

  const completeTransaction = () => {
    setIsLoading(false);
    setSuccess(true);
  };

  const failTransaction = (error: string) => {
    setIsLoading(false);
    setError(error);
  };

  return {
    isLoading,
    error,
    success,
    startTransaction,
    completeTransaction,
    failTransaction
  };
}; 