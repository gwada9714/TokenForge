import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { useAccount } from 'wagmi';
import { authReducer, initialState, TokenForgeAuthState } from '../store/authReducer';
import { authActions } from '../store/authActions';
import { firebaseAuth } from '../services/firebaseAuth';
import { sessionService } from '../services/sessionService';
import { authSyncService } from '../services/authSyncService';
import { errorService } from '../services/errorService';
import { secureStorageService } from '../services/secureStorageService';
import { securityHeadersService } from '../services/securityHeadersService';
import { AuthAction } from '../store/authReducer';

interface TokenForgeAuthContextValue extends TokenForgeAuthState {
  dispatch: React.Dispatch<AuthAction>;
}

export const TokenForgeAuthContext = createContext<TokenForgeAuthContextValue | null>(null);

export const TokenForgeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { address, isConnected } = useAccount();

  // Vérifier les headers de sécurité au montage
  useEffect(() => {
    if (!securityHeadersService.verifySecurityHeaders()) {
      console.error('Security headers are not properly configured');
    }
  }, []);

  // Synchroniser l'état du wallet
  useEffect(() => {
    dispatch(authActions.updateWallet({
      address: address || null,
      isConnected
    }));
  }, [address, isConnected]);

  // Firebase Auth listener avec stockage sécurisé
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          secureStorageService.setAuthToken(token);

          const sessionData = await sessionService.getUserSession(firebaseUser.uid);
          const user = {
            ...firebaseUser,
            isAdmin: sessionData?.isAdmin ?? false,
            canCreateToken: sessionData?.canCreateToken ?? false,
            canUseServices: sessionData?.canUseServices ?? false,
            metadata: {
              ...sessionData?.metadata,
              creationTime: firebaseUser.metadata.creationTime || '',
              lastSignInTime: firebaseUser.metadata.lastSignInTime || '',
              lastLoginTime: Date.now()
            }
          };

          dispatch(authActions.loginSuccess(user));
          await authSyncService.startTokenRefresh();
        } catch (error) {
          secureStorageService.removeAuthToken();
          dispatch(authActions.loginFailure(errorService.handleError(error)));
        }
      } else {
        secureStorageService.removeAuthToken();
        dispatch(authActions.logout());
        authSyncService.stopTokenRefresh();
      }
    });

    return () => {
      unsubscribe();
      secureStorageService.removeAuthToken();
    };
  }, []);

  return (
    <TokenForgeAuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TokenForgeAuthContext.Provider>
  );
};

export const useTokenForgeAuth = () => {
  const context = useContext(TokenForgeAuthContext);
  if (!context) {
    throw new Error('useTokenForgeAuth must be used within a TokenForgeAuthProvider');
  }
  return context;
};
