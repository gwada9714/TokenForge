import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from '@wagmi/core';
import { bsc, bscTestnet } from 'viem/chains';
import { 
  TokenForgeAuthState, 
  TokenForgeAuthContextValue,
  User,
  AuthError,
  AuthStatus 
} from '../types';
import { authReducer } from '../reducers/authReducer';

const initialState: TokenForgeAuthState = {
  status: 'idle',
  isAuthenticated: false,
  user: null,
  error: null,
  isAdmin: false,
  canCreateToken: false,
  canUseServices: false,
  isConnected: false,
  address: null,
  chainId: null,
  walletClient: null,
  signOut: async () => {},
  login: () => {},
  logout: () => {},
  setError: () => {},
  updateUser: () => {},
};

export const TokenForgeAuthContext = createContext<TokenForgeAuthContextValue | null>(null);

export const TokenForgeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const auth = getAuth();

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const tokenForgeUser: User = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isAdmin: user.email?.endsWith('@tokenforge.com') || false,
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
          },
        };
        dispatch({ type: 'LOGIN', payload: tokenForgeUser });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Wallet connection listener
  useEffect(() => {
    dispatch({ 
      type: 'UPDATE_WALLET_STATE', 
      payload: { 
        isConnected, 
        address: address || null, 
        chainId: null // We'll update this when we implement chain detection
      } 
    });
  }, [isConnected, address]);

  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_STATUS', payload: 'loading' });
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError: AuthError = {
        message: 'Failed to sign in',
        name: 'AuthError',
        code: (error as any).code || 'unknown',
        details: error
      };
      dispatch({ type: 'SET_ERROR', payload: authError });
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_STATUS', payload: 'loading' });
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError: AuthError = {
        message: 'Failed to create account',
        name: 'AuthError',
        code: (error as any).code || 'unknown',
        details: error
      };
      dispatch({ type: 'SET_ERROR', payload: authError });
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      await disconnectAsync();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      const authError: AuthError = {
        message: 'Failed to sign out',
        name: 'AuthError',
        code: 'auth/sign-out-failed',
        details: error
      };
      dispatch({ type: 'SET_ERROR', payload: authError });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      dispatch({ type: 'SET_STATUS', payload: 'loading' });
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const authError: AuthError = {
        message: 'Failed to reset password',
        name: 'AuthError',
        code: (error as any).code || 'unknown',
        details: error
      };
      dispatch({ type: 'SET_ERROR', payload: authError });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!auth.currentUser) return;

    try {
      dispatch({ type: 'SET_STATUS', payload: 'loading' });
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
      });
      dispatch({ type: 'UPDATE_USER', payload: data });
    } catch (error) {
      const authError: AuthError = {
        message: 'Failed to update profile',
        name: 'AuthError',
        code: 'auth/update-profile-failed',
        details: error
      };
      dispatch({ type: 'SET_ERROR', payload: authError });
    }
  };

  const connectWallet = async () => {
    try {
      await connectAsync({ connector: new InjectedConnector() });
    } catch (error) {
      const authError: AuthError = {
        message: 'Failed to connect wallet',
        name: 'AuthError',
        code: 'wallet/connect-failed',
        details: error
      };
      dispatch({ type: 'SET_ERROR', payload: authError });
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnectAsync();
    } catch (error) {
      const authError: AuthError = {
        message: 'Failed to disconnect wallet',
        name: 'AuthError',
        code: 'wallet/disconnect-failed',
        details: error
      };
      dispatch({ type: 'SET_ERROR', payload: authError });
    }
  };

  const switchNetwork = async (chainId: number) => {
    try {
      // Pour l'instant, on ne fait rien car nous n'avons pas implémenté le changement de réseau
      console.warn('Network switching not implemented yet');
    } catch (error) {
      const authError: AuthError = {
        message: 'Failed to switch network',
        name: 'AuthError',
        code: 'wallet/network-switch-failed',
        details: error
      };
      dispatch({ type: 'SET_ERROR', payload: authError });
    }
  };

  const value: TokenForgeAuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    connectWallet,
    disconnectWallet,
    switchNetwork,
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
