// État initial
export interface TokenForgeAdminState {
  error: string | null;
  networkCheck: {
    isValid: boolean;
    message: string;
  };
  walletCheck: {
    isValid: boolean;
    message: string;
  };
}

// Types d'actions pour le reducer
type AdminAction =
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CHECKS'; payload: { networkCheck: { isValid: boolean; message: string }; walletCheck: { isValid: boolean; message: string } } };

export const initialState: TokenForgeAdminState = {
  error: null,
  networkCheck: {
    isValid: false,
    message: '',
  },
  walletCheck: {
    isValid: false,
    message: '',
  },
};

export function adminReducer(state: TokenForgeAdminState, action: AdminAction): TokenForgeAdminState {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CHECKS':
      return { 
        ...state, 
        networkCheck: action.payload.networkCheck,
        walletCheck: action.payload.walletCheck,
      };
    default:
      return state;
  }
}
