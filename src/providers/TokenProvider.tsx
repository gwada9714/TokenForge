import React, { useEffect, ReactNode } from 'react';
import { useWeb3 } from '../providers/Web3Provider';
import { useTokens } from '../contexts/TokenContext';

interface TokenProviderProps {
  children: ReactNode;
}

const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  const { isConnected } = useWeb3();
  const { loadTokens } = useTokens();

  useEffect(() => {
    if (isConnected) {
      loadTokens();
    }
  }, [isConnected, loadTokens]);

  return <>{children}</>;
};

export default TokenProvider; 