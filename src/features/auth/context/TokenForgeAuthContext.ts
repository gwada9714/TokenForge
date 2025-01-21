import { createContext } from 'react';
import { TokenForgeAuthState } from '../types/auth';
import { AuthAction } from '../actions/authActions';

interface TokenForgeAuthContextType extends TokenForgeAuthState {
  dispatch: React.Dispatch<AuthAction>;
}

export const TokenForgeAuthContext = createContext<TokenForgeAuthContextType | null>(null);
