import React from 'react';
import { TokenForgeAuthProvider } from '../features/auth/providers/TokenForgeAuthProvider';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TokenForgeAuthProvider>
      {children}
    </TokenForgeAuthProvider>
  );
};
