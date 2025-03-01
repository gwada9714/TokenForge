/**
 * Interface de base pour les services blockchain
 * Définit les méthodes communes à toutes les blockchains
 */
export interface IBlockchainService {
  // Méthodes communes à toutes les blockchains
  getProvider(): any;
  getSigner(): any;
  getBalance(address: string): Promise<bigint>;
  getNetworkId(): Promise<number>;
  getChainId(): Promise<number>;
  isConnected(): Promise<boolean>;
  estimateGas(transaction: any): Promise<bigint>;
  
  // Méthodes pour la gestion des comptes
  getAccounts(): Promise<string[]>;
  
  // Méthodes pour la signature et vérification
  signMessage(message: string, address?: string): Promise<string>;
  verifySignature(message: string, signature: string, address: string): Promise<boolean>;
  
  // Méthodes optionnelles pour la connexion/déconnexion
  connect?(): Promise<boolean>;
  disconnect?(): Promise<boolean>;
}
