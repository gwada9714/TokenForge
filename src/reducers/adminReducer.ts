import { NetworkCheckResult, ContractCheckResult, WalletCheckResult } from '../types/hooks';

// État initial
export interface TokenForgeAdminState {
  error: string | null;
  successMessage: string | null;
  networkCheck: NetworkCheckResult;
  contractCheck: ContractCheckResult;
  walletCheck: WalletCheckResult;
  adminCheckCompleted: boolean;
}

// Types d'actions pour le reducer
type AdminAction =
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_NETWORK_CHECK'; payload: NetworkCheckResult }
  | { type: 'SET_CONTRACT_CHECK'; payload: ContractCheckResult }
  | { type: 'SET_WALLET_CHECK'; payload: WalletCheckResult }
  | { type: 'SET_ADMIN_CHECK_COMPLETED'; payload: boolean };

export const initialState: TokenForgeAdminState = {
  error: null,
  successMessage: null,
  networkCheck: {
    isConnected: false,
    isCorrectNetwork: false,
    requiredNetwork: 'Sepolia',
  },
  contractCheck: {
    isValid: false,
    isDeployed: false,
  },
  walletCheck: {
    isConnected: false,
  },
  adminCheckCompleted: false,
};

export function adminReducer(state: TokenForgeAdminState, action: AdminAction): TokenForgeAdminState {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SUCCESS':
      return { ...state, successMessage: action.payload };
    case 'SET_NETWORK_CHECK':
      return { ...state, networkCheck: action.payload };
    case 'SET_CONTRACT_CHECK':
      return { ...state, contractCheck: action.payload };
    case 'SET_WALLET_CHECK':
      return { ...state, walletCheck: action.payload };
    case 'SET_ADMIN_CHECK_COMPLETED':
      return { ...state, adminCheckCompleted: action.payload };
    default:
      return state;
  }
}
