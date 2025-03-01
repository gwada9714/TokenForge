import { IBlockchainService } from '../interfaces/IBlockchainService';
import { ethers } from 'ethers';

/**
 * Adaptateur pour les services blockchain
 * Permet d'adapter différentes implémentations de services blockchain à l'interface IBlockchainService
 */
export class BlockchainServiceAdapter implements IBlockchainService {
  private service: any;

  constructor(service: any) {
    this.service = service;
  }

  /**
   * Vérifie si le service est connecté
   * @returns true si connecté, false sinon
   */
  async isConnected(): Promise<boolean> {
    if (typeof this.service.isConnected === 'function') {
      return this.service.isConnected();
    }
    return !!this.service.provider;
  }

  /**
   * Récupère le provider blockchain
   * @returns Provider blockchain
   */
  getProvider(): any {
    return this.service.provider || this.service.getProvider();
  }

  /**
   * Récupère le signer blockchain
   * @returns Signer blockchain
   */
  getSigner(): any {
    if (typeof this.service.getSigner === 'function') {
      return this.service.getSigner();
    }
    const provider = this.getProvider();
    return provider.getSigner();
  }

  /**
   * Récupère le solde d'une adresse
   * @param address Adresse à vérifier
   * @returns Solde en wei
   */
  async getBalance(address: string): Promise<bigint> {
    if (typeof this.service.getBalance === 'function') {
      return this.service.getBalance(address);
    }
    const provider = this.getProvider();
    return await provider.getBalance(address);
  }

  /**
   * Récupère l'ID du réseau
   * @returns ID du réseau
   */
  async getNetworkId(): Promise<number> {
    if (typeof this.service.getNetworkId === 'function') {
      return this.service.getNetworkId();
    }
    if (typeof this.service.getChainId === 'function') {
      return this.service.getChainId();
    }
    const provider = this.getProvider();
    const network = await provider.getNetwork();
    return network.chainId;
  }

  /**
   * Récupère l'ID de la chaîne
   * @returns ID de la chaîne
   */
  async getChainId(): Promise<number> {
    if (typeof this.service.getChainId === 'function') {
      return this.service.getChainId();
    }
    return this.getNetworkId();
  }

  /**
   * Récupère les comptes connectés
   * @returns Liste des adresses de comptes
   */
  async getAccounts(): Promise<string[]> {
    if (typeof this.service.getAccounts === 'function') {
      return this.service.getAccounts();
    }
    const provider = this.getProvider();
    return await provider.listAccounts();
  }

  /**
   * Signe un message
   * @param message Message à signer
   * @param address Adresse du signataire (optionnel)
   * @returns Signature
   */
  async signMessage(message: string, address?: string): Promise<string> {
    if (typeof this.service.signMessage === 'function') {
      return this.service.signMessage(message, address);
    }
    const provider = this.getProvider();
    const signer = address ? provider.getSigner(address) : provider.getSigner();
    return await signer.signMessage(message);
  }

  /**
   * Vérifie une signature
   * @param message Message original
   * @param signature Signature à vérifier
   * @param address Adresse du signataire
   * @returns true si la signature est valide, false sinon
   */
  async verifySignature(message: string, signature: string, address: string): Promise<boolean> {
    if (typeof this.service.verifySignature === 'function') {
      return this.service.verifySignature(message, signature, address);
    }
    
    // Utiliser ethers pour vérifier la signature
    const signerAddress = ethers.verifyMessage(message, signature);
    return signerAddress.toLowerCase() === address.toLowerCase();
  }

  /**
   * Estime les frais de gaz pour une transaction
   * @param transaction Transaction à estimer
   * @returns Estimation des frais de gaz
   */
  async estimateGas(transaction: any): Promise<bigint> {
    if (typeof this.service.estimateGas === 'function') {
      return this.service.estimateGas(transaction);
    }
    const provider = this.getProvider();
    const gasEstimate = await provider.estimateGas(transaction);
    return BigInt(gasEstimate.toString());
  }

  /**
   * Connecte le service blockchain
   * @returns true si la connexion a réussi, false sinon
   */
  async connect(): Promise<boolean> {
    if (typeof this.service.connect === 'function') {
      return this.service.connect();
    }
    return true;
  }

  /**
   * Déconnecte le service blockchain
   * @returns true si la déconnexion a réussi, false sinon
   */
  async disconnect(): Promise<boolean> {
    if (typeof this.service.disconnect === 'function') {
      return this.service.disconnect();
    }
    return true;
  }
}
