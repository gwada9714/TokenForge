import React, { createContext, useContext } from 'react';
import { useTokenForgeAuth } from '../hooks/useTokenForgeAuth';
import { TokenForgeAuthState } from '../types';

const TokenForgeAuthContext = createContext<TokenForgeAuthState | undefined>(undefined);

export function TokenForgeAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useTokenForgeAuth();

  return (
    <TokenForgeAuthContext.Provider value={auth}>
      {children}
    </TokenForgeAuthContext.Provider>
  );
}

export function useTokenForgeAuthContext() {
  const context = useContext(TokenForgeAuthContext);
  if (context === undefined) {
    throw new Error('useTokenForgeAuthContext must be used within a TokenForgeAuthProvider');
  }
  return context;
}
