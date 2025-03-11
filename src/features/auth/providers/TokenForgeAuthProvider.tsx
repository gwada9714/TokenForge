import React, { createContext, useContext, ReactNode, useReducer, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  updateProfile as firebaseUpdateProfile,
  getAuth
} from 'firebase/auth';
import { useWalletStatus } from '../hooks/useWalletStatus';
import { useAuthState } from '../hooks/useAuthState';
import { AuthError, AuthErrorCode, createAuthError } from '../errors/AuthError';
import { TokenForgeAuthContextValue, TokenForgeUser, WalletState } from '../types/auth';
import { authReducer, initialState } from '../reducers/authReducer';
import { logger } from '../../../core/logger';
import { createAuthAction } from '../actions/authActions';
import { firebaseAuth } from '../../../lib/firebase/auth';

export const TokenForgeAuthContext = createContext<TokenForgeAuthContextValue | undefined>(undefined);

export const TokenForgeAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { user, isAuthenticated: isFirebaseAuthenticated, loading: firebaseLoading, error: authError } = useAuthState();
  const {
    isConnected,
    isCorrectNetwork,
    address,
    connect,
    disconnect
    // switchNetwork is available but not used in this component
  } = useWalletStatus();

  // Synchroniser l'état d'erreur provenant du hook useAuthState
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
          AuthErrorCode.UNKNOWN_ERROR,
          'Erreur inconnue lors de l\'authentification',
          error instanceof Error ? error : new Error(String(error))
        );
      }
      
      dispatch(createAuthAction.setError(authErrorObj));
    }
  }, [authError]);

  // Synchroniser l'état de connexion wallet avec l'état global
  useEffect(() => {
    if (isConnected && isCorrectNetwork && address) {
      dispatch(createAuthAction.connectWalletSuccess({
        isConnected,
        isCorrectNetwork,
        address
      }));
    } else if (!isConnected && state.wallet.isConnected) {
      dispatch(createAuthAction.disconnectWalletSuccess());
    }
  }, [isConnected, isCorrectNetwork, address, state.wallet.isConnected]);

  // Connecter l'utilisateur avec email et mot de passe
  const signIn = async (email: string, password: string): Promise<TokenForgeUser | null> => {
    try {
      dispatch(createAuthAction.signInStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative de connexion utilisateur',
        data: { emailProvided: !!email }
      });
      
      // Utilisation du service d'authentification Firebase
      // Obtenir l'instance Auth standard
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        const tokenForgeUser: TokenForgeUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          displayName: userCredential.user.displayName || '',
          emailVerified: userCredential.user.emailVerified,
          isAnonymous: userCredential.user.isAnonymous,
          providerData: userCredential.user.providerData
        };
        
        dispatch(createAuthAction.signInSuccess(tokenForgeUser));
        
        logger.info({
          category: 'Auth',
          message: 'Connexion utilisateur réussie',
          data: { uid: tokenForgeUser.uid }
        });
        
        return tokenForgeUser;
      }
      
      dispatch(createAuthAction.signInSuccess(null));
      return null;
    } catch (error) {
      let authError: AuthError;
      
      if (error instanceof Error) {
        // Traiter les erreurs d'authentification Firebase
        authError = createAuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          'Email ou mot de passe incorrect',
          error
        );
      } else {
        authError = createAuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'Erreur inconnue lors de la connexion',
          error instanceof Error ? error : new Error(String(error))
        );
      }
      
      logger.error({
        category: 'Auth',
        message: 'Échec de connexion utilisateur',
        error: authError
      });
      
      dispatch(createAuthAction.signInFailure(authError));
      return null;
    }
  };

  // Créer un nouveau compte utilisateur
  const signUp = async (email: string, password: string): Promise<TokenForgeUser | null> => {
    try {
      dispatch(createAuthAction.signUpStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative de création de compte',
        data: { emailProvided: !!email }
      });
      
      // Utilisation du service d'authentification Firebase
      // Obtenir l'instance Auth standard
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        const tokenForgeUser: TokenForgeUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          displayName: userCredential.user.displayName || '',
          emailVerified: userCredential.user.emailVerified,
          isAnonymous: userCredential.user.isAnonymous,
          providerData: userCredential.user.providerData
        };
        
        dispatch(createAuthAction.signUpSuccess(tokenForgeUser));
        
        logger.info({
          category: 'Auth',
          message: 'Création de compte réussie',
          data: { uid: tokenForgeUser.uid }
        });
        
        return tokenForgeUser;
      }
      
      dispatch(createAuthAction.signUpSuccess(null));
      return null;
    } catch (error) {
      let authError: AuthError;
      
      if (error instanceof Error) {
        // Traiter les erreurs d'authentification Firebase
        authError = createAuthError(
          AuthErrorCode.EMAIL_ALREADY_IN_USE,
          'Cet email est déjà utilisé',
          error
        );
      } else {
        authError = createAuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'Erreur inconnue lors de la création du compte',
          error instanceof Error ? error : new Error(String(error))
        );
      }
      
      logger.error({
        category: 'Auth',
        message: 'Échec de création de compte',
        error: authError
      });
      
      dispatch(createAuthAction.signUpFailure(authError));
      return null;
    }
  };

  // Déconnecter l'utilisateur (Firebase et wallet)
  const signOut = async (): Promise<void> => {
    try {
      dispatch(createAuthAction.logoutStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative de déconnexion'
      });
      
      // Utilisation du service d'authentification Firebase
      // Obtenir l'instance Auth standard
      const auth = getAuth();
      await firebaseSignOut(auth);
      
      // Déconnexion du wallet si connecté
      if (isConnected) {
        try {
          await disconnect();
        } catch (error) {
          logger.warn({
            category: 'Auth',
            message: 'Erreur lors de la déconnexion du wallet',
            error: error instanceof Error ? error : new Error(String(error))
          });
        }
      }
      
      dispatch(createAuthAction.logoutSuccess());
      
      logger.info({
        category: 'Auth',
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      const authError = createAuthError(
        AuthErrorCode.SIGNOUT_ERROR,
        'Erreur lors de la déconnexion',
        error instanceof Error ? error : new Error(String(error))
      );
      
      logger.error({
        category: 'Auth',
        message: 'Échec de déconnexion',
        error: authError
      });
      
      dispatch(createAuthAction.logoutFailure(authError));
    }
  };

  // Réinitialiser le mot de passe
  const resetPassword = async (email: string): Promise<void> => {
    try {
      dispatch(createAuthAction.resetPasswordStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative de réinitialisation de mot de passe',
        data: { emailProvided: !!email }
      });
      
      // Utilisation du service d'authentification Firebase
      // Obtenir l'instance Auth standard
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      
      dispatch(createAuthAction.resetPasswordSuccess());
      
      logger.info({
        category: 'Auth',
        message: 'Email de réinitialisation de mot de passe envoyé avec succès',
        data: { emailProvided: !!email }
      });
    } catch (error) {
      let authError: AuthError;
      
      if (error instanceof Error) {
        authError = createAuthError(
          AuthErrorCode.RESET_PASSWORD_ERROR,
          'Erreur lors de la réinitialisation du mot de passe',
          error
        );
      } else {
        authError = createAuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'Erreur inconnue lors de la réinitialisation du mot de passe',
          error instanceof Error ? error : new Error(String(error))
        );
      }
      
      logger.error({
        category: 'Auth',
        message: 'Échec de réinitialisation de mot de passe',
        error: authError
      });
      
      dispatch(createAuthAction.resetPasswordFailure(authError));
    }
  };

  // Mettre à jour le profil utilisateur
  const updateProfile = async (displayName: string, photoURL?: string): Promise<void> => {
    try {
      dispatch(createAuthAction.updateProfileStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative de mise à jour du profil utilisateur',
        data: { hasDisplayName: !!displayName, hasPhotoURL: !!photoURL }
      });
      
      // Utilisation du service d'authentification Firebase
      // Obtenir l'instance Auth standard
      const auth = getAuth();
      
      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName,
          photoURL: photoURL || null
        });
        
        dispatch(createAuthAction.updateProfileSuccess({
          ...state.user,
          displayName
        }));
        
        logger.info({
          category: 'Auth',
          message: 'Profil utilisateur mis à jour avec succès',
          data: { uid: auth.currentUser.uid }
        });
      } else {
        throw new Error('Aucun utilisateur connecté');
      }
    } catch (error) {
      const authError = createAuthError(
        AuthErrorCode.UPDATE_PROFILE_ERROR,
        'Erreur lors de la mise à jour du profil',
        error instanceof Error ? error : new Error(String(error))
      );
      
      logger.error({
        category: 'Auth',
        message: 'Échec de mise à jour du profil utilisateur',
        error: authError
      });
      
      dispatch(createAuthAction.updateProfileFailure(authError));
    }
  };

  // Connecter le wallet
  const connectWallet = async (): Promise<void> => {
    try {
      dispatch(createAuthAction.connectWalletStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative de connexion du wallet'
      });
      
      await connect();
      
      if (address) {
        const walletState: WalletState = {
          isConnected: true,
          isCorrectNetwork,
          address
        };
        
        dispatch(createAuthAction.connectWalletSuccess(walletState));
        
        logger.info({
          category: 'Auth',
          message: 'Connexion du wallet réussie',
          data: { address }
        });
      } else {
        throw new Error('Adresse wallet non disponible après connexion');
      }
    } catch (error) {
      const authError = createAuthError(
        AuthErrorCode.WALLET_CONNECTION_ERROR,
        'Erreur lors de la connexion du wallet',
        error instanceof Error ? error : new Error(String(error))
      );
      
      logger.error({
        category: 'Auth',
        message: 'Échec de connexion du wallet',
        error: authError
      });
      
      dispatch(createAuthAction.connectWalletFailure(authError));
    }
  };

  // Déconnecter le wallet
  const disconnectWallet = async (): Promise<void> => {
    try {
      dispatch(createAuthAction.disconnectWalletStart());
      
      logger.info({
        category: 'Auth',
        message: 'Tentative de déconnexion du wallet'
      });
      
      await disconnect();
      
      dispatch(createAuthAction.disconnectWalletSuccess());
      
      logger.info({
        category: 'Auth',
        message: 'Déconnexion du wallet réussie'
      });
    } catch (error) {
      const authError = createAuthError(
        AuthErrorCode.WALLET_DISCONNECTION_ERROR,
        'Erreur lors de la déconnexion du wallet',
        error instanceof Error ? error : new Error(String(error))
      );
      
      logger.error({
        category: 'Auth',
        message: 'Échec de déconnexion du wallet',
        error: authError
      });
      
      dispatch(createAuthAction.disconnectWalletFailure(authError));
    }
  };

  // Effacer les erreurs
  const clearError = (): void => {
    dispatch(createAuthAction.clearError());
  };

  // Valeur du contexte
  const contextValue: TokenForgeAuthContextValue = {
    user: state.user,
    isAuthenticated: isFirebaseAuthenticated,
    isLoading: state.isLoading || firebaseLoading,
    error: state.error,
    wallet: state.wallet,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    connectWallet,
    disconnectWallet,
    clearError,
    dispatch
  };

  return (
    <TokenForgeAuthContext.Provider value={contextValue}>
      {children}
    </TokenForgeAuthContext.Provider>
  );
};

// Hook personnalisé pour accéder au contexte
export const useTokenForgeAuth = (): TokenForgeAuthContextValue => {
  const context = useContext(TokenForgeAuthContext);
  
  if (!context) {
    throw new Error('useTokenForgeAuth doit être utilisé à l\'intérieur d\'un TokenForgeAuthProvider');
  }
  
  return context;
};

export default TokenForgeAuthProvider;
