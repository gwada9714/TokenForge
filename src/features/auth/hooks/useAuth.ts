import { useContext } from 'react';
import { TokenForgeAuthContext } from '../providers/TokenForgeAuthProvider';
import { TokenForgeAuthContextValue } from '../types/auth';

export const useAuth = (): TokenForgeAuthContextValue => {
  const context = useContext(TokenForgeAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a TokenForgeAuthProvider');
  }
  return context;
};
