// src/components/hook/useErrorHandler.ts
import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  code?: string;
  isVisible: boolean;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({ 
    message: '', 
    isVisible: false 
  });

  const handleError = useCallback((error: Error | string) => {
    const message = typeof error === 'string' ? error : error.message;
    setError({ message, isVisible: true });
    
    setTimeout(() => {
      setError(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  }, []);

  return { error, handleError };
};