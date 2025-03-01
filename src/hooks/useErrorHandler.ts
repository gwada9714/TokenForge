import { useState, useCallback } from 'react';

interface ErrorState {
  isVisible: boolean;
  message: string;
}

interface UseErrorHandlerReturn {
  error: ErrorState;
  handleError: (error: unknown) => void;
  clearError: () => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ErrorState>({
    isVisible: false,
    message: '',
  });

  const handleError = useCallback((err: unknown) => {
    console.error('Error caught:', err);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    } else if (err && typeof err === 'object' && 'message' in err) {
      errorMessage = String((err as { message: unknown }).message);
    }
    
    setError({
      isVisible: true,
      message: errorMessage,
    });
  }, []);

  const clearError = useCallback(() => {
    setError({
      isVisible: false,
      message: '',
    });
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
};
