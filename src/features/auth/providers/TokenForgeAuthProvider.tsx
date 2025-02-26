import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface TokenForgeAuthContextType {
  user: any;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const TokenForgeAuthContext = createContext<TokenForgeAuthContextType | undefined>(undefined);

export const TokenForgeAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <TokenForgeAuthContext.Provider value={auth}>
      {children}
    </TokenForgeAuthContext.Provider>
  );
};

export const useTokenForgeAuth = () => {
  const context = useContext(TokenForgeAuthContext);
  if (context === undefined) {
    throw new Error('useTokenForgeAuth must be used within a TokenForgeAuthProvider');
  }
  return context;
};

export default TokenForgeAuthProvider;
