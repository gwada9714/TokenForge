import { TokenForgeAuthState, WalletState } from '../types';
import { firebaseService } from './firebaseService';
import { walletReconnectionService } from './walletReconnectionService';
import { errorService } from './errorService';
import { AUTH_ERROR_CODES } from '../errors/AuthError';

class AuthSyncService {
  private static instance: AuthSyncService;
  private refreshTokenInterval?: NodeJS.Timeout;

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
    try {
      if (!walletState.isConnected && authState.isAuthenticated) {
        // Si le wallet est déconnecté mais l'utilisateur est authentifié,
        // on déconnecte l'authentification
        await firebaseService.signOut();
      } else if (walletState.isConnected && !authState.isAuthenticated) {
        // Si le wallet est connecté mais l'utilisateur n'est pas authentifié,
        // on vérifie d'abord le réseau
        if (!walletState.isCorrectNetwork) {
          throw errorService.createAuthError(
            AUTH_ERROR_CODES.NETWORK_MISMATCH,
            'Please switch to the correct network before connecting.'
          );
        }

        // Vérifier si le wallet est valide
        if (!walletState.address) {
          throw errorService.createAuthError(
            AUTH_ERROR_CODES.WALLET_NOT_FOUND,
            'No wallet address found.'
          );
        }

        // Tout est bon, on peut procéder à l'authentification
        await this.authenticateWithWallet(walletState.address);
      }
    } catch (error) {
      throw errorService.handleAuthError(error);
    }
  }

  private async authenticateWithWallet(address: string): Promise<void> {
    try {
      // Ici, implémentez la logique d'authentification avec le wallet
      // Par exemple, signer un message et vérifier la signature
      const message = `Welcome to TokenForge! Please sign this message to authenticate.\n\nNonce: ${Date.now()}`;
      const signature = await this.signMessage(message, address);
      
      // Vérifier la signature côté serveur et obtenir un token JWT
      // Cette partie dépendra de votre backend
      await this.verifySignature(message, signature, address);
    } catch (error) {
      throw errorService.handleAuthError(error);
    }
  }

  private async signMessage(message: string, address: string): Promise<string> {
    try {
      const provider = window.ethereum;
      if (!provider) {
        throw errorService.createAuthError(
          AUTH_ERROR_CODES.PROVIDER_ERROR,
          'No Ethereum provider found'
        );
      }

      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address],
      });

      return signature;
    } catch (error) {
      throw errorService.handleAuthError(error);
    }
  }

  private async verifySignature(
    message: string,
    signature: string,
    address: string
  ): Promise<void> {
    // Implémenter la vérification de signature
    // Cette méthode devrait faire un appel à votre backend
  }

  startTokenRefresh(): void {
    this.stopTokenRefresh(); // Arrêter l'intervalle existant s'il y en a un

    this.refreshTokenInterval = setInterval(async () => {
      try {
        const user = await firebaseService.getCurrentUser();
        if (user) {
          await firebaseService.refreshToken();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 55 * 60 * 1000); // Refresh toutes les 55 minutes
  }

  stopTokenRefresh(): void {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = undefined;
    }
  }
}

export const authSyncService = AuthSyncService.getInstance();
