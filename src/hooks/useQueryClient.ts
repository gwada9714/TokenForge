import { QueryClient } from '@tanstack/react-query';
import { handleQueryError } from '../utils/errorHandler';

export const useQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Ne pas réessayer les erreurs ABI car elles sont probablement dues à une mauvaise configuration
          if (error instanceof Error && error.name === 'AbiEncodingLengthMismatchError') {
            return false;
          }
          // Réessayer les autres erreurs jusqu'à 2 fois
          handleQueryError(error instanceof Error ? error : new Error(String(error)));
          return failureCount < 2;
        },
        staleTime: 5000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true
      },
      mutations: {
        retry: (failureCount, error) => {
          // Ne pas réessayer les erreurs ABI
          if (error instanceof Error && error.name === 'AbiEncodingLengthMismatchError') {
            return false;
          }
          handleQueryError(error instanceof Error ? error : new Error(String(error)));
          return failureCount < 1;
        }
      }
    }
  });
};
