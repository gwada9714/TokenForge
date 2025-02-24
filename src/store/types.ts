import { TokenConfig } from '@/types/token';
import { store } from './index';

// Base types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// State interfaces
export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
  } | null;
}

export interface SerializedError {
  name?: string;
  message?: string;
  code?: string;
  stack?: string;
}

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

// Ajout du type StakingState manquant
export interface StakingState {
  stakes: Array<{
    id: string;
    amount: string;
    timestamp: number;
  }>;
  totalStaked: string;
  rewards: string;
}
