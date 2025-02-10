import { getWalletClient } from '@wagmi/core';
import { createAuthError, AUTH_ERROR_CODES } from '../errors/AuthError';

export class WalletService {
  private static instance: WalletService;

  private constructor() {}

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async connect(): Promise<boolean> {
    try {
      const walletClient = await getWalletClient();
      if (!walletClient) {
        throw createAuthError(
          AUTH_ERROR_CODES.WALLET_NOT_FOUND,
          'No wallet client found'
        );
      }
      return true;
    } catch (error) {
      throw createAuthError(
        AUTH_ERROR_CODES.WALLET_CONNECTION_FAILED,
        'Failed to connect wallet',
        { error }
      );
    }
  }

  async disconnect(): Promise<void> {
    // La déconnexion est gérée par wagmi
  }
}

export const walletService = WalletService.getInstance();
