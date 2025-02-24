import { TokenForgeAuthState, WalletState } from '../types';
import { Auth, onAuthStateChanged } from 'firebase/auth';
import { firebaseService } from './firebaseService';
import { walletReconnectionService } from './walletReconnectionService';
import { errorService } from './errorService';
import { AuthErrorCode } from '../errors/AuthError';
import { logger } from '@/utils/firebase-logger';

const LOG_CATEGORY = 'AuthSyncService';

class AuthSyncService {
  private static instance: AuthSyncService;
  private refreshTokenInterval?: NodeJS.Timeout;

  private constructor() {}

  static getInstance(): AuthSyncService {
    if (!AuthSyncService.instance) {
      AuthSyncService.instance = new AuthSyncService();
      logger.info(LOG_CATEGORY, { message: 'AuthSyncService instance created' });
    }
    return AuthSyncService.instance;
  }

  async synchronizeWalletAndAuth(
    walletState: WalletState,
    authState: TokenForgeAuthState
  ): Promise<void> {
    try {
      logger.debug(LOG_CATEGORY, { 
        message: ' Synchronisation Wallet et Auth',
        walletConnected: walletState.isConnected,
        authState: authState.isAuthenticated
      });

      if (!walletState.isConnected && authState.isAuthenticated) {
        // Si le wallet est déconnecté mais l'utilisateur est authentifié,
        // on déconnecte l'authentification
        logger.debug(LOG_CATEGORY, { 
          message: ' Déconnexion de l\'authentification (wallet déconnecté)' 
        });
        await firebaseService.signOut();
      } else if (walletState.isConnected && !authState.isAuthenticated) {
        // Si le wallet est connecté mais l'utilisateur n'est pas authentifié,
        // on vérifie d'abord le réseau
        if (!walletState.isCorrectNetwork) {
          logger.error(LOG_CATEGORY, { 
            message: ' Réseau incorrect',
            currentNetwork: walletState.network 
          });
          throw errorService.createAuthError(
            AuthErrorCode.NETWORK_MISMATCH,
            'Please switch to the correct network before connecting.'
          );
        }

        // Vérifier si le wallet est valide
        if (!walletState.address) {
          logger.error(LOG_CATEGORY, { message: ' Adresse wallet non trouvée' });
          throw errorService.createAuthError(
            AuthErrorCode.WALLET_NOT_FOUND,
            'No wallet address found.'
          );
        }

        // Tout est bon, on peut procéder à l'authentification
        logger.debug(LOG_CATEGORY, { 
          message: ' Authentification avec le wallet',
          address: walletState.address 
        });
        await this.authenticateWithWallet(walletState.address);
      }
    } catch (error) {
      logger.error(LOG_CATEGORY, {
        message: ' Erreur lors de la synchronisation',
        error: error as Error
      });
      throw error;
    }
  }

  private async authenticateWithWallet(address: string): Promise<void> {
    try {
      logger.debug(LOG_CATEGORY, { 
        message: ' Début de l\'authentification avec le wallet',
        address 
      });
      
      // Vérifier si une reconnexion est nécessaire
      const shouldReconnect = await walletReconnectionService.checkReconnection(address);
      
      if (shouldReconnect) {
        logger.info(LOG_CATEGORY, { 
          message: ' Reconnexion du wallet nécessaire',
          address 
        });
        await walletReconnectionService.handleReconnection(address);
      }
      
      logger.info(LOG_CATEGORY, { 
        message: ' Authentification avec le wallet réussie',
        address 
      });
    } catch (error) {
      logger.error(LOG_CATEGORY, {
        message: ' Erreur lors de l\'authentification avec le wallet',
        address,
        error: error as Error
      });
      throw error;
    }
  }

  startTokenRefresh(): void {
    logger.debug(LOG_CATEGORY, { message: ' Démarrage du rafraîchissement du token' });
    
    // Nettoyer l'intervalle existant s'il y en a un
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }

    // Créer un nouvel intervalle
    this.refreshTokenInterval = setInterval(async () => {
      try {
        const user = firebaseService.auth.currentUser;
        if (user) {
          const token = await user.getIdToken(true);
          logger.debug(LOG_CATEGORY, { 
            message: ' Token rafraîchi avec succès',
            userId: user.uid 
          });
        }
      } catch (error) {
        logger.error(LOG_CATEGORY, {
          message: ' Erreur lors du rafraîchissement du token',
          error: error as Error
        });
      }
    }, 3600000); // Rafraîchir toutes les heures
  }

  stopTokenRefresh(): void {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = undefined;
      logger.debug(LOG_CATEGORY, { message: ' Arrêt du rafraîchissement du token' });
    }
  }
}

export const authSyncService = AuthSyncService.getInstance();
