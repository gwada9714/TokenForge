import React, { createContext, useContext } from 'react';
import { TokenForgeAuth } from '../types';
import { useTokenForgeAuth } from '../hooks/useTokenForgeAuth';

interface TokenForgeAuthContextValue extends TokenForgeAuth {
  // Ajouter ici d'autres valeurs spécifiques au contexte si nécessaire
}

const TokenForgeAuthContext = createContext<TokenForgeAuthContextValue | null>(null);

export function useTokenForgeAuthContext() {
  const context = useContext(TokenForgeAuthContext);
  if (!context) {
    throw new Error('useTokenForgeAuthContext must be used within a TokenForgeAuthProvider');
  }
  return context;
}

interface TokenForgeAuthProviderProps {
  children: React.ReactNode;
}

export function TokenForgeAuthProvider({ children }: TokenForgeAuthProviderProps) {
  const auth = useTokenForgeAuth();

  return (
    <TokenForgeAuthContext.Provider value={auth}>
      {children}
    </TokenForgeAuthContext.Provider>
  );
}
