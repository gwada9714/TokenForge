import { TokenForgeUser } from '../types';
import { storageService } from './storageService';
import { logService } from './logService';
import { ErrorService } from './errorService';
import { AuthErrorCode } from '../errors/AuthError';

const LOG_CATEGORY = 'AdminService';

interface AdminRights {
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
}

class AdminService {
  private static instance: AdminService;

  private constructor() { }

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  /**
   * Vérifie si un utilisateur a le statut d'administrateur
   * @param userId Identifiant de l'utilisateur
   * @returns true si l'utilisateur est administrateur, false sinon
   */
  async verifyAdminStatus(userId: string): Promise<boolean> {
    try {
      const userData = await storageService.getUserData(userId);
      if (!userData) {
        return false;
      }

      return userData.isAdmin || false;
    } catch (error) {
      logService.error(
        LOG_CATEGORY,
        'Failed to verify admin status',
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );
      return false;
    }
  }

  async getAdminRights(user: TokenForgeUser): Promise<AdminRights> {
    try {
      const storedData = await storageService.getUserData(user.uid);
      if (!storedData) {
        throw ErrorService.createAuthError(
          AuthErrorCode.USER_NOT_FOUND,
          'User data not found'
        );
      }

      return {
        isAdmin: storedData.isAdmin || false,
        canCreateToken: storedData.canCreateToken || false,
        canUseServices: storedData.canUseServices || false
      };
    } catch (error) {
      // Gérer l'erreur et retourner des droits par défaut
      logService.error(
        LOG_CATEGORY,
        'Failed to get admin rights',
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.uid }
      );
      return {
        isAdmin: false,
        canCreateToken: false,
        canUseServices: false
      };
    }
  }

  async updateAdminRights(
    userId: string,
    rights: Partial<AdminRights>
  ): Promise<void> {
    try {
      const currentData = await storageService.getUserData(userId);
      if (!currentData) {
        throw ErrorService.createAuthError(
          AuthErrorCode.USER_NOT_FOUND,
          'User data not found'
        );
      }

      const updatedData = {
        ...currentData,
        ...rights
      };

      await storageService.updateUserData(userId, updatedData);

      logService.info(LOG_CATEGORY, 'Admin rights updated', {
        userId,
        rights
      });
    } catch (error) {
      logService.error(
        LOG_CATEGORY,
        'Failed to update admin rights',
        error instanceof Error ? error : new Error(String(error)),
        { userId, rights }
      );
      throw error;
    }
  }

  validateAdminAccess(
    isAdmin: boolean,
    isAuthenticated: boolean,
    isConnected: boolean,
    isCorrectNetwork: boolean
  ): {
    canAccess: boolean;
    reason?: string;
  } {
    if (!isAuthenticated) {
      return {
        canAccess: false,
        reason: 'Vous devez être connecté pour accéder à cette page'
      };
    }

    if (!isAdmin) {
      return {
        canAccess: false,
        reason: 'Vous n\'avez pas les droits d\'administration nécessaires'
      };
    }

    if (!isConnected) {
      return {
        canAccess: false,
        reason: 'Vous devez connecter votre portefeuille'
      };
    }

    if (!isCorrectNetwork) {
      return {
        canAccess: false,
        reason: 'Vous devez être connecté au bon réseau'
      };
    }

    return { canAccess: true };
  }
}

export const adminService = AdminService.getInstance();
