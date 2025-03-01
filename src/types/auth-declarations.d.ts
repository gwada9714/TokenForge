declare module '../../providers/TokenForgeAuthProvider' {
  import { ReactNode } from 'react';

  export interface TokenForgeAuthContextValue {
    user: any;
    isAuthenticated: boolean;
    loading: boolean;
    error: Error | null;
    emailVerified?: boolean;
    isAdmin?: boolean;
    canCreateToken?: boolean;
    canUseServices?: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithUser: (user: any) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: any) => void;
    updateWalletState: (state: any) => void;
    startEmailVerification: () => Promise<void>;
    verifyEmail: () => Promise<void>;
  }

  export const TokenForgeAuthProvider: React.FC<{ children: ReactNode }>;
  export const useTokenForgeAuth: () => TokenForgeAuthContextValue;
}
