import React, { createContext, useReducer, useEffect, useContext, useState } from 'react';
import { useAccount } from 'wagmi';
import { authReducer, initialState, TokenForgeAuthState } from '../store/authReducer';
import { authActions } from '../store/authActions';
import { firebaseAuth } from '../services/firebaseAuth';
import { sessionService } from '../services/sessionService';
import { authSyncService } from '../services/authSyncService';
import { errorService } from '../services/errorService';
import { secureStorageService } from '../services/secureStorageService';
import { securityHeadersService } from '../services/securityHeadersService';
import { AuthAction, TokenForgeUser } from '../../../types/authTypes';
import { User as FirebaseUser } from 'firebase/auth';

interface TokenForgeAuthContextValue extends TokenForgeAuthState {
  dispatch: React.Dispatch<AuthAction>;
  isInitialized: boolean;
}

export const TokenForgeAuthContext = createContext<TokenForgeAuthContextValue | null>(null);

export const TokenForgeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const { address, isConnected } = useAccount();

  // Initialisation de Firebase Auth
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await firebaseAuth.waitForAuthInit();
        setIsInitialized(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de Firebase Auth:', error);
        dispatch(authActions.loginFailure(error as Error));
      }
    };

    initializeAuth();
  }, []);

  // Synchroniser l'état du wallet
  useEffect(() => {
    if (!isInitialized) return;

    if (address !== undefined) {
      dispatch(authActions.updateWallet({
        address: address || null,
        isConnected: isConnected || false
      }));
    }
  }, [address, isConnected, isInitialized]);

  // Firebase Auth listener avec stockage sécurisé
  useEffect(() => {
    if (!isInitialized) return;

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const setupAuthListener = async () => {
      try {
        unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
          if (!mounted) return;

          if (firebaseUser) {
            try {
              const token = await firebaseUser.getIdToken();
              await secureStorageService.setAuthToken(token);

              const sessionData = await sessionService.getUserSession(firebaseUser.uid);
              const user: TokenForgeUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                emailVerified: firebaseUser.emailVerified,
                isAdmin: sessionData?.isAdmin ?? false,
                canCreateToken: sessionData?.canCreateToken ?? false,
                canUseServices: sessionData?.canUseServices ?? false,
                metadata: {
                  creationTime: firebaseUser.metadata.creationTime || '',
                  lastSignInTime: firebaseUser.metadata.lastSignInTime || '',
                  lastLoginTime: Date.now(),
                  walletAddress: address || undefined,
                  chainId: undefined
                }
              };

              dispatch(authActions.loginSuccess(user));
              await authSyncService.startTokenRefresh();
            } catch (error) {
              const authError = errorService.handleError(error);
              dispatch(authActions.loginFailure(authError));
            }
          } else {
            dispatch(authActions.logout());
            secureStorageService.removeAuthToken();
            authSyncService.stopTokenRefresh();
          }
        });
      } catch (error) {
        console.error('Erreur lors de la configuration du listener Auth:', error);
        dispatch(authActions.loginFailure(error as Error));
      }
    };

    setupAuthListener();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [address, isInitialized]);

  // Vérification des headers de sécurité
  useEffect(() => {
    if (!isInitialized) return;

    if (!securityHeadersService.verifySecurityHeaders()) {
      console.error('Security headers are not properly configured');
    }
  }, [isInitialized]);

  const contextValue: TokenForgeAuthContextValue = {
    ...state,
    dispatch,
    isInitialized
  };

  return (
    <TokenForgeAuthContext.Provider value={contextValue}>
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
