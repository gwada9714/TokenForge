import { TokenForgeAuthState, WalletState } from '../types';
import { Auth, onAuthStateChanged } from 'firebase/auth';
import { firebaseService } from './firebaseService';
import { walletReconnectionService } from './walletReconnectionService';
import { errorService } from './errorService';
import { AuthErrorCode } from '../errors/AuthError';
import { logger } from '@/core/logger';
import { SUPPORTED_CHAINS } from '@/types/common';

const LOG_CATEGORY = 'AuthSyncService';

class AuthSyncService {
  private static instance: AuthSyncService;
  private refreshTokenInterval?: NodeJS.Timeout;
  private syncInProgress = false;
  private lastSyncTimestamp = 0;
  private readonly MIN_SYNC_INTERVAL = 1000; // 1 seconde minimum entre les syncs

  private constructor() {}

  static getInstance(): AuthSyncService {
    if (!AuthSyncService.instance) {
      AuthSyncService.instance = new AuthSyncService();
    }
    return AuthSyncService.instance;
  }

  async synchronizeWalletAndAuth(
    walletState: WalletState,
    authState: TokenForgeAuthState
  ): Promise<void> {
    // Éviter les synchronisations trop fréquentes
    const now = Date.now();
    if (now - this.lastSyncTimestamp < this.MIN_SYNC_INTERVAL) {
      return;
    }
    
    // Éviter les synchronisations simultanées
    if (this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    this.lastSyncTimestamp = now;

    try {
      logger.debug(LOG_CATEGORY, { 
        message: 'Début de la synchronisation',
        walletConnected: walletState.isConnected,
        authState: authState.isAuthenticated
      });

      if (!walletState.isConnected && authState.isAuthenticated) {
        // Si le wallet est déconnecté mais l'utilisateur est authentifié,
        // on déconnecte l'authentification
        logger.debug(LOG_CATEGORY, { 
          message: 'Déconnexion de l\'authentification (wallet déconnecté)' 
        });
        await firebaseService.signOut();
        return;
      }

      if (walletState.isConnected && !authState.isAuthenticated) {
        // Vérifier d'abord le réseau
        if (!walletState.chainId || !(walletState.chainId in SUPPORTED_CHAINS)) {
          logger.error(LOG_CATEGORY, { 
            message: 'Réseau incorrect',
            chainId: walletState.chainId 
          });
          throw errorService.createAuthError(
            AuthErrorCode.NETWORK_MISMATCH,
            'Veuillez vous connecter à un réseau supporté'
          );
        }

        // Vérifier si le wallet est valide
        if (!walletState.address) {
          logger.error(LOG_CATEGORY, { message: 'Adresse wallet non trouvée' });
          throw errorService.createAuthError(
            AuthErrorCode.WALLET_NOT_FOUND,
            'Aucune adresse wallet trouvée'
          );
        }

        // Tout est bon, on peut procéder à l'authentification
        logger.debug(LOG_CATEGORY, { 
          message: 'Authentification avec le wallet',
          address: walletState.address 
        });
        
        try {
          await this.authenticateWithWallet(walletState.address);
          logger.info(LOG_CATEGORY, { 
            message: 'Authentification réussie',
            address: walletState.address 
          });
        } catch (error) {
          logger.error(LOG_CATEGORY, {
            message: 'Échec de l\'authentification',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          throw error;
        }
      }
    } catch (error) {
      logger.error(LOG_CATEGORY, {
        message: 'Erreur lors de la synchronisation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async authenticateWithWallet(address: string): Promise<void> {
    try {
      logger.debug(LOG_CATEGORY, { 
        message: 'Début de l\'authentification avec le wallet',
        address 
      });
      
      // Vérifier si une reconnexion est nécessaire
      const shouldReconnect = await walletReconnectionService.checkReconnection(address);
      
      if (shouldReconnect) {
        logger.info(LOG_CATEGORY, { 
          message: 'Reconnexion du wallet nécessaire',
          address 
        });
        await walletReconnectionService.handleReconnection(address);
      }
      
      // Démarrer le rafraîchissement du token
      this.startTokenRefresh();
      
      logger.info(LOG_CATEGORY, { 
        message: 'Authentification avec le wallet réussie',
        address 
      });
    } catch (error) {
      logger.error(LOG_CATEGORY, {
        message: 'Erreur lors de l\'authentification avec le wallet',
        address,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  startTokenRefresh(): void {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }

    // Rafraîchir le token toutes les 55 minutes
    this.refreshTokenInterval = setInterval(async () => {
      try {
        await firebaseService.refreshToken();
      } catch (error) {
        logger.error(LOG_CATEGORY, {
          message: 'Échec du rafraîchissement du token',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 55 * 60 * 1000);
  }

  stopTokenRefresh(): void {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = undefined;
    }
  }
}

export const authSyncService = AuthSyncService.getInstance();
