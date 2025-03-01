/**
 * Interface de base pour les services blockchain
 * Définit les méthodes communes à toutes les blockchains
 */
export interface IBlockchainService {
  // Méthodes communes à toutes les blockchains
  getProvider(): any;
  getBalance(address: string): Promise<bigint>;
  getNetworkId(): Promise<number>;
  isConnected(): Promise<boolean>;
  estimateGas(transaction: any): Promise<bigint>;
}
