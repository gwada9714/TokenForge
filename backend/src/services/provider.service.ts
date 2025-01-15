import { ethers } from 'ethers';
import logger from '../utils/logger';

export class ProviderService {
  private provider: ethers.Provider;

  constructor() {
    const providerUrl = process.env.PROVIDER_URL;
    if (!providerUrl) {
      throw new Error('PROVIDER_URL environment variable is not set');
    }

    try {
      this.provider = new ethers.JsonRpcProvider(providerUrl);
      logger.info('Ethereum provider initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Ethereum provider:', error);
      throw error;
    }
  }

  getProvider(): ethers.Provider {
    return this.provider;
  }

  async getNetwork() {
    try {
      const network = await this.provider.getNetwork();
      return network;
    } catch (error) {
      logger.error('Error getting network information:', error);
      throw error;
    }
  }

  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getFeeData();
      return gasPrice;
    } catch (error) {
      logger.error('Error getting gas price:', error);
      throw error;
    }
  }
}
