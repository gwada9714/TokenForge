import { IBlockchainService } from '../interfaces/IBlockchainService';
import { createEvmProvider } from '../providers';

/**
 * Service de base pour les blockchains EVM
 * Implémente les fonctionnalités communes à toutes les blockchains EVM
 */
export class BlockchainService implements IBlockchainService {
  protected publicClient;
  protected walletClient;
  protected chainName: string;

  constructor(chainName: string, walletProvider?: any) {
    this.chainName = chainName;
    const { publicClient, walletClient } = createEvmProvider(chainName, walletProvider);
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  getProvider() {
    return { publicClient: this.publicClient, walletClient: this.walletClient };
  }

  async getBalance(address: string): Promise<bigint> {
    return await this.publicClient.getBalance({ address: address as `0x${string}` });
  }

  async getNetworkId(): Promise<number> {
    const chainId = await this.publicClient.getChainId();
    return chainId;
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.publicClient.getChainId();
      return true;
    } catch (error) {
      return false;
    }
  }

  async estimateGas(transaction: any): Promise<bigint> {
    return await this.publicClient.estimateGas(transaction);
  }
}
