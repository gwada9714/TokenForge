import { useContext } from 'react';
import { TokenForgeAuthContext } from '../providers/TokenForgeAuthProvider';
import { TokenForgeAuthContextValue } from '../types/auth';

export function useTokenForgeAuth(): TokenForgeAuthContextValue {
  const context = useContext(TokenForgeAuthContext);
  if (!context) {
    throw new Error('useTokenForgeAuth must be used within a TokenForgeAuthProvider');
  }
  return context;
}
