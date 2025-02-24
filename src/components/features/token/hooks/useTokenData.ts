import { useState, useEffect } from 'react';
import { TokenInfo } from '../../../../types/tokens';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import { useTokenContract } from './useTokenContract';

interface TokenDataResult {
  token: TokenInfo | null;
  isLoading: boolean;
  error: Error | null;
}

export const useTokenData = (tokenId: string | undefined): TokenDataResult => {
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();
  const tokenContract = useTokenContract();

  useEffect(() => {
    const fetchTokenData = async () => {
      if (!tokenId || !tokenContract) {
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const tokenData = await tokenContract.getTokenData(tokenId);
        setToken(tokenData);
      } catch (err) {
        handleError(err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenData();
  }, [tokenId, tokenContract, handleError]);

  return { token, isLoading, error };
};
