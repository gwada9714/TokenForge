import React, { createContext, ReactNode, useReducer, useEffect, useState, useContext } from 'react';
import { User } from 'firebase/auth';
import { useWalletStatus } from '../hooks/useWalletStatus';
import { useAuthState } from '../hooks/useAuthState';
import { AuthError, AuthErrorCode, createAuthError } from '../errors/AuthError';
import { TokenForgeUser, WalletConnectionState, WalletConnectionStatus } from '../../../types/authTypes';
import { authReducer, initialState } from '../reducers/authReducer';
import { logger } from '@/core/logger';
import { createAuthAction } from '../actions/authActions';
import { firebaseAuth } from '@/lib/firebase/auth';
import { TokenForgeAuthContextValue } from '../types/auth';

export const TokenForgeAuthContext = createContext<TokenForgeAuthContextValue | undefined>(undefined);

// Créer et exporter le hook d'utilisation du contexte d'authentification
export const useTokenForgeAuth = () => {
  const context = useContext(TokenForgeAuthContext);
  
  if (!context) {
    const errorMessage = 'useTokenForgeAuth doit être utilisé à l\'intérieur d\'un TokenForgeAuthProvider';
    logger.error({
      category: 'Auth',
      message: errorMessage,
      error: new Error(errorMessage)
    });
    throw new Error(errorMessage);
  }
  
  return context;
};

// Alias pour compatibilité avec le code existant
export const useTokenForgeAuthContext = useTokenForgeAuth;

export const TokenForgeAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const { error: authError } = useAuthState();
  const {
    address,
    connect,
    disconnect,
    hasInjectedProvider,
    walletState
  } = useWalletStatus();

  useEffect(() => {
    if (authError) {
      let authErrorObj: AuthError;
      
      try {
        authErrorObj = createAuthError(
          AuthErrorCode.AUTHENTICATION_ERROR,
          authError.message || 'Erreur d\'authentification',
          authError
        );
      } catch (error) {
        authErrorObj = createAuthError(
          AuthErrorCode.INTERNAL_ERROR,
          'Erreur inconnue lors de l\'authentification',
          error instanceof Error ? error : new Error(String(error))
        );
      }
      
      dispatch(createAuthAction.setError(authErrorObj));
    }
  }, [authError]);

  // Surveiller la disponibilité du wallet et mettre à jour l'état
  useEffect(() => {
    dispatch(createAuthAction.setWalletProviderStatus(hasInjectedProvider));
    
    // Si aucun provider de wallet n'est disponible, enregistrer cet état
    if (!hasInjectedProvider) {
      logger.warn({
        category: 'Auth',
        message: 'Aucun provider de wallet détecté'
      });
      
      // Créer une erreur non-bloquante pour notifier l'utilisateur
      const walletError = createAuthError(
        AuthErrorCode.NO_WALLET_PROVIDER,
        'Aucun wallet détecté. Pour accéder à toutes les fonctionnalités, installez MetaMask ou un wallet compatible.',
        new Error('No wallet provider detected')
      );
      
      dispatch(createAuthAction.setWalletError(walletError));
    } else {
      // Effacer l'erreur de wallet si un provider est disponible
      dispatch(createAuthAction.clearWalletError());
    }
  }, [hasInjectedProvider]);

  // Surveiller les changements d'état du wallet et mettre à jour l'état d'authentification
  useEffect(() => {
    if (walletState) {
      // Récupérer l'état actuel pour la comparaison
      const currentState = state.wallet;
      
      const walletConnectionState: WalletConnectionState = {
        isConnected: walletState.isConnected,
        address: walletState.address,
        chainId: walletState.chainId,
        isCorrectNetwork: walletState.isCorrectNetwork,
        walletClient: walletState.walletClient,
        status: walletState.isConnected 
          ? (walletState.isCorrectNetwork ? WalletConnectionStatus.CONNECTED : WalletConnectionStatus.WRONG_NETWORK)
          : WalletConnectionStatus.DISCONNECTED
      };
      
      // Ne déclencher l'action que si l'état a vraiment changé
      const hasChanged = !currentState || 
          currentState.address !== walletConnectionState.address ||
          currentState.chainId !== walletConnectionState.chainId ||
          currentState.isConnected !== walletConnectionState.isConnected ||
          currentState.isCorrectNetwork !== walletConnectionState.isCorrectNetwork;
          
      if (hasChanged) {
        dispatch(createAuthAction.connectWalletSuccess(walletConnectionState));
      }
    }
  }, [walletState, state, dispatch]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        logger.info({
          category: 'Auth',
          message: 'Initialisation du contexte d\'authentification TokenForge'
        });
        
        // S'assurer que le service d'authentification est initialisé
        await firebaseAuth.getAuth();
        
        setIsInitialized(true);
        
        logger.info({
          category: 'Auth',
          message: 'Contexte d\'authentification TokenForge initialisé avec succès'
        });
      } catch (error) {
        logger.error({
          category: 'Auth',
          message: 'Erreur lors de l\'initialisation du contexte d\'authentification',
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
    };

    initAuth();
  }, []);

  /**
   * Convertit un utilisateur Firebase en utilisateur TokenForge
   */
  const convertToTokenForgeUser = (user: User): TokenForgeUser => {
    return {
      ...user,
      metadata: {
        ...user.metadata,
        creationTime: user.metadata.creationTime || '',
        lastSignInTime: user.metadata.lastSignInTime || '',
        lastLoginTime: Date.now(),
        walletAddress: address || undefined,
        chainId: state.wallet.chainId || undefined
      },
      isAdmin: false, // À mettre à jour avec les rôles depuis Firestore
      canCreateToken: true, // Valeur par défaut, à ajuster selon les droits utilisateur
      canUseServices: true // Valeur par défaut, à ajuster selon les droits utilisateur
    } as TokenForgeUser;
  };

  /**
   * Connexion utilisateur avec email et mot de passe
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      dispatch(createAuthAction.signInStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative de connexion utilisateur',
        data: { emailProvided: !!email }
      });
      
      const user = await firebaseAuth.signIn(email, password);
      
      if (user) {
        const tokenForgeUser = convertToTokenForgeUser(user);
        
        dispatch(createAuthAction.signInSuccess(tokenForgeUser));
        
        logger.info({
          category: 'Auth',
          message: 'Connexion utilisateur réussie',
          data: { uid: user.uid }
        });
      } else {
        throw new Error('Utilisateur non trouvé après connexion');
      }
    } catch (error) {
      logger.error({
        category: 'Auth',
        message: 'Erreur lors de la connexion utilisateur',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      const authError = createAuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        'Erreur lors de la connexion. Vérifiez vos identifiants.',
        error instanceof Error ? error : new Error(String(error))
      );
      
      dispatch(createAuthAction.signInFailure(authError));
      throw authError;
    }
  };

  /**
   * Inscription utilisateur avec email et mot de passe
   */
  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      dispatch(createAuthAction.signUpStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative d\'inscription utilisateur',
        data: { emailProvided: !!email, displayNameProvided: !!displayName }
      });
      
      const user = await firebaseAuth.signUp(email, password);
      
      if (user) {
        // Mettre à jour le profil si un nom d'affichage est fourni
        if (displayName) {
          await firebaseAuth.updateProfile({
            displayName
          });
        }
        
        const tokenForgeUser = convertToTokenForgeUser(user);
        
        dispatch(createAuthAction.signUpSuccess(tokenForgeUser));
        
        logger.info({
          category: 'Auth',
          message: 'Inscription utilisateur réussie',
          data: { uid: user.uid }
        });
      } else {
        throw new Error('Utilisateur non créé après inscription');
      }
    } catch (error) {
      logger.error({
        category: 'Auth',
        message: 'Erreur lors de l\'inscription utilisateur',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      const authError = createAuthError(
        AuthErrorCode.SIGNUP_FAILED,
        'Erreur lors de l\'inscription. Essayez avec une autre adresse email.',
        error instanceof Error ? error : new Error(String(error))
      );
      
      dispatch(createAuthAction.signUpFailure(authError));
      throw authError;
    }
  };

  /**
   * Déconnexion utilisateur
   */
  const signOut = async (): Promise<void> => {
    try {
      dispatch(createAuthAction.logoutStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative de déconnexion utilisateur'
      });
      
      await firebaseAuth.signOut();
      
      dispatch(createAuthAction.logoutSuccess());
      
      logger.info({
        category: 'Auth',
        message: 'Déconnexion utilisateur réussie'
      });
    } catch (error) {
      logger.error({
        category: 'Auth',
        message: 'Erreur lors de la déconnexion utilisateur',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      const authError = createAuthError(
        AuthErrorCode.LOGOUT_FAILED,
        'Erreur lors de la déconnexion',
        error instanceof Error ? error : new Error(String(error))
      );
      
      dispatch(createAuthAction.logoutFailure(authError));
      throw authError;
    }
  };

  /**
   * Réinitialisation du mot de passe
   */
  const resetPassword = async (email: string): Promise<void> => {
    try {
      dispatch(createAuthAction.resetPasswordStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative de réinitialisation de mot de passe',
        data: { emailProvided: !!email }
      });
      
      await firebaseAuth.resetPassword(email);
      
      dispatch(createAuthAction.resetPasswordSuccess());
      
      logger.info({
        category: 'Auth',
        message: 'Email de réinitialisation envoyé avec succès'
      });
    } catch (error) {
      logger.error({
        category: 'Auth',
        message: 'Erreur lors de l\'envoi de l\'email de réinitialisation',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      const authError = createAuthError(
        AuthErrorCode.RESET_PASSWORD_FAILED,
        'Erreur lors de la réinitialisation du mot de passe',
        error instanceof Error ? error : new Error(String(error))
      );
      
      dispatch(createAuthAction.resetPasswordFailure(authError));
      throw authError;
    }
  };

  /**
   * Connexion au wallet
   */
  const connectWallet = async (): Promise<void> => {
    try {
      dispatch(createAuthAction.connectWalletStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative de connexion au wallet'
      });
      
      await connect();
      
      // La mise à jour de l'état du wallet est déjà gérée par l'effet useEffect [walletState]
      
      logger.info({
        category: 'Auth',
        message: 'Connexion au wallet réussie',
        data: { address }
      });
    } catch (error) {
      logger.error({
        category: 'Auth',
        message: 'Erreur lors de la connexion au wallet',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      const authError = createAuthError(
        AuthErrorCode.WALLET_CONNECTION_ERROR,
        'Erreur lors de la connexion au wallet',
        error instanceof Error ? error : new Error(String(error))
      );
      
      dispatch(createAuthAction.connectWalletFailure(authError));
      throw authError;
    }
  };

  /**
   * Déconnexion du wallet
   */
  const disconnectWallet = async (): Promise<void> => {
    try {
      dispatch(createAuthAction.disconnectWalletStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative de déconnexion du wallet'
      });
      
      await disconnect();
      
      // La mise à jour de l'état du wallet est déjà gérée par l'effet useEffect [walletState]
      
      logger.info({
        category: 'Auth',
        message: 'Déconnexion du wallet réussie'
      });
    } catch (error) {
      logger.error({
        category: 'Auth',
        message: 'Erreur lors de la déconnexion du wallet',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      const authError = createAuthError(
        AuthErrorCode.WALLET_DISCONNECTION_ERROR,
        'Erreur lors de la déconnexion du wallet',
        error instanceof Error ? error : new Error(String(error))
      );
      
      dispatch(createAuthAction.disconnectWalletFailure(authError));
      throw authError;
    }
  };

  // Fonctions utilitaires pour la gestion des erreurs
  const clearError = (): void => {
    dispatch(createAuthAction.clearError());
  };

  const clearWalletError = (): void => {
    dispatch(createAuthAction.clearWalletError());
  };

  const validateAdminAccess = (): boolean => {
    return !!state.user?.isAdmin;
  };

  // Regrouper toutes les méthodes et états pour le contexte
  const contextValue: TokenForgeAuthContextValue = {
    // État de l'authentification
    isInitialized,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    error: state.error,
    status: state.status,
    loading: state.loading,
    isAdmin: state.isAdmin,
    canCreateToken: state.canCreateToken,
    canUseServices: state.canUseServices,
    
    // Méthodes d'authentification Firebase
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile: async (displayName?: string, photoURL?: string) => {
      await firebaseAuth.updateProfile({ displayName, photoURL });
    },
    updateUser: async (updates: Partial<TokenForgeUser>) => {
      dispatch(createAuthAction.updateUser(updates));
    },
    
    // État et méthodes du wallet
    wallet: state.wallet,
    hasWalletProvider: state.hasWalletProvider,
    walletError: state.walletError,
    connectWallet,
    disconnectWallet,
    
    // Utilitaires
    dispatch,
    clearError,
    clearWalletError,
    validateAdminAccess
  };

  return (
    <TokenForgeAuthContext.Provider value={contextValue}>
      {children}
    </TokenForgeAuthContext.Provider>
  );
};

export default TokenForgeAuthProvider;
