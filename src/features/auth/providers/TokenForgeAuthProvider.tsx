import React, { createContext, useReducer, useCallback, useContext } from 'react';
import { TokenForgeAuthContextValue, TokenForgeUser, AuthError } from '../types/auth';
import { authReducer, initialState } from '../reducers/authReducer';
import { UnifiedWalletService } from '../services/UnifiedWalletService';
import { firebaseAuth } from '../services/firebaseAuth';
import { errorService } from '../services/errorService';

export const TokenForgeAuthContext = createContext<TokenForgeAuthContextValue | null>(null);

export const TokenForgeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const walletService = UnifiedWalletService.getInstance();

  const handleAuthError = useCallback((error: unknown) => {
    const authError = errorService.handleError(error) as AuthError;
    dispatch({ type: 'LOGIN_FAILURE', payload: authError });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
      const user: TokenForgeUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        emailVerified: userCredential.user.emailVerified,
        displayName: userCredential.user.displayName || '',
        photoURL: userCredential.user.photoURL,
        isAdmin: false, // À définir selon votre logique
        canCreateToken: true,
        canUseServices: true,
        metadata: {
          creationTime: userCredential.user.metadata.creationTime!,
          lastSignInTime: userCredential.user.metadata.lastSignInTime!,
          lastLoginTime: Date.now()
        }
      };
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: await userCredential.user.getIdToken() } });
    } catch (error) {
      handleAuthError(error);
    }
  }, [handleAuthError]);

  const signOut = useCallback(async () => {
    try {
      dispatch({ type: 'LOGOUT_START' });
      await firebaseAuth.signOut();
      dispatch({ type: 'LOGOUT_SUCCESS' });
    } catch (error) {
      handleAuthError(error);
    }
  }, [handleAuthError]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      dispatch({ type: 'SIGNUP_START' });
      const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName });
      
      const user: TokenForgeUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        emailVerified: userCredential.user.emailVerified,
        displayName: displayName,
        photoURL: null,
        isAdmin: false,
        canCreateToken: true,
        canUseServices: true,
        metadata: {
          creationTime: userCredential.user.metadata.creationTime!,
          lastSignInTime: userCredential.user.metadata.lastSignInTime!,
          lastLoginTime: Date.now()
        }
      };
      
      dispatch({ type: 'SIGNUP_SUCCESS', payload: user });
    } catch (error) {
      handleAuthError(error);
    }
  }, [handleAuthError]);

  const connectWallet = useCallback(async () => {
    try {
      dispatch({ type: 'WALLET_CONNECTING' });
      const walletState = await walletService.connect();
      dispatch({ 
        type: 'WALLET_CONNECTED', 
        payload: { 
          address: walletState.address!, 
          chainId: walletState.chainId! 
        } 
      });
    } catch (error) {
      handleAuthError(error);
    }
  }, [handleAuthError]);

  const disconnectWallet = useCallback(async () => {
    try {
      await walletService.disconnect();
      dispatch({ type: 'WALLET_DISCONNECTED' });
    } catch (error) {
      handleAuthError(error);
    }
  }, [handleAuthError]);

  const switchNetwork = useCallback(async (chainId: number) => {
    try {
      dispatch({ type: 'NETWORK_SWITCHING' });
      await walletService.switchNetwork(chainId);
      dispatch({ type: 'NETWORK_CHANGED', payload: { chainId } });
    } catch (error) {
      handleAuthError(error);
    }
  }, [handleAuthError]);

  const value: TokenForgeAuthContextValue = {
    state,
    actions: {
      signIn,
      signUp,
      signOut,
      connectWallet,
      disconnectWallet,
      switchNetwork
    }
  };

  return (
    <TokenForgeAuthContext.Provider value={value}>
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
