import { TokenConfig } from '@/types/token';
import { AuthState } from './slices/authSlice';
import { AnalyticsState } from './slices/analyticsSlice';
import { UserTokensState } from './slices/userTokensSlice';

export interface TokenCreationState {
  currentStep: number;
  tokenConfig: TokenConfig;
  isDeploying: boolean;
  deploymentError: string | null;
  deploymentStatus: {
    step: number;
    message: string;
  } | null;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  balance: string;
}

export interface UIState {
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>;
  isLoading: boolean;
}

export interface RootState {
  tokenCreation: TokenCreationState;
  wallet: WalletState;
  ui: UIState;
  analytics: AnalyticsState;
  userTokens: UserTokensState;
  auth: AuthState;
}
