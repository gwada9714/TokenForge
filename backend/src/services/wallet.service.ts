import { ethers } from 'ethers';
import { WalletModel } from '../models/wallet.model';
import { ProviderService } from './provider.service';
import logger from '../utils/logger';

export class WalletService {
  private provider: ProviderService;

  constructor() {
    this.provider = new ProviderService();
  }

  async createTemporaryWallet() {
    try {
      // Créer un nouveau wallet
      const wallet = ethers.Wallet.createRandom();
      
      // Calculer la date d'expiration (24h)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Sauvegarder dans la base de données
      const newWallet = await WalletModel.create({
        address: wallet.address,
        privateKey: wallet.privateKey, // Note: En production, crypter la clé privée
        expiresAt
      });

      return {
        address: newWallet.address,
        expiresAt: newWallet.expiresAt
      };
    } catch (error) {
      logger.error('Error in createTemporaryWallet:', error);
      throw error;
    }
  }

  async getWalletByAddress(address: string) {
    try {
      const wallet = await WalletModel.findOne({ address });
      if (!wallet) return null;

      return {
        address: wallet.address,
        expiresAt: wallet.expiresAt
      };
    } catch (error) {
      logger.error('Error in getWalletByAddress:', error);
      throw error;
    }
  }

  async getWalletBalance(address: string) {
    try {
      const provider = this.provider.getProvider();
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Error in getWalletBalance:', error);
      throw error;
    }
  }

  // Méthode pour nettoyer les wallets expirés
  async cleanupExpiredWallets() {
    try {
      const result = await WalletModel.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      logger.info(`Cleaned up ${result.deletedCount} expired wallets`);
    } catch (error) {
      logger.error('Error in cleanupExpiredWallets:', error);
      throw error;
    }
  }
}
