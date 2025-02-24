import { TokenForgeUser } from '../types';
import { storageService } from './storageService';
import { logService } from './logService';
import { errorService } from './errorService';
import { AuthErrorCode } from '../errors/AuthError';

const LOG_CATEGORY = 'AdminService';

interface AdminRights {
  isAdmin: boolean;
  canCreateToken: boolean;
  canUseServices: boolean;
}

class AdminService {
  private static instance: AdminService;
  
  private constructor() {}

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  async getAdminRights(user: TokenForgeUser): Promise<AdminRights> {
    try {
      const storedData = await storageService.getUserData(user.uid);
      if (!storedData) {
        throw errorService.createAuthError(
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
      const authError = errorService.handleError(error);
      logService.error(
        LOG_CATEGORY,
        'Failed to get admin rights',
        authError,
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
        throw errorService.createAuthError(
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
      const authError = errorService.handleError(error);
      logService.error(
        LOG_CATEGORY,
        'Failed to update admin rights',
        authError,
        { userId, rights }
      );
      throw authError;
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
        reason: errorService.getLocalizedMessage(AuthErrorCode.USER_NOT_FOUND)
      };
    }

    if (!isAdmin) {
      return {
        canAccess: false,
        reason: errorService.getLocalizedMessage(AuthErrorCode.OPERATION_NOT_ALLOWED)
      };
    }

    if (!isConnected) {
      return {
        canAccess: false,
        reason: errorService.getLocalizedMessage(AuthErrorCode.WALLET_NOT_FOUND)
      };
    }

    if (!isCorrectNetwork) {
      return {
        canAccess: false,
        reason: errorService.getLocalizedMessage(AuthErrorCode.NETWORK_MISMATCH)
      };
    }

    return { canAccess: true };
  }
}

export const adminService = AdminService.getInstance();
