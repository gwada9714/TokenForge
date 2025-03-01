import { useState, useCallback } from 'react';
import { secureWalletService } from '../services/SecureWalletService';
import { logger } from '@/utils/logger';

/**
 * Interface pour les résultats du hook useSecureSignature
 */
interface UseSecureSignatureResult {
  signMessage: (message: string) => Promise<string | null>;
  verifySignature: (message: string, signature: string, address: string) => Promise<boolean>;
  isSigningMessage: boolean;
  error: string | null;
}

/**
 * Hook React sécurisé pour la signature et vérification de messages
 * Utilise le SecureWalletService pour sécuriser les opérations de signature
 * 
 * @param chainName Nom de la blockchain (ethereum, binance, polygon, avalanche, arbitrum)
 * @returns Fonctions pour signer et vérifier des messages
 */
export const useSecureSignature = (chainName: string): UseSecureSignatureResult => {
  const [isSigningMessage, setIsSigningMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Signe un message avec le wallet connecté
   * @param message Message à signer
   * @returns Signature ou null en cas d'erreur
   */
  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    try {
      setError(null);
      setIsSigningMessage(true);
      
      // Vérifier si le wallet est connecté
      if (!secureWalletService.isWalletConnected(chainName)) {
        throw new Error('Wallet non connecté');
      }
      
      // Récupérer le service blockchain
      const service = secureWalletService.getBlockchainService(chainName);
      if (!service) {
        throw new Error('Service blockchain non disponible');
      }
      
      // Récupérer l'adresse du compte
      const account = secureWalletService.getPrimaryAccount(chainName);
      if (!account) {
        throw new Error('Aucun compte disponible');
      }
      
      // Journaliser la demande de signature
      logger.info('useSecureSignature', 'Demande de signature', {
        chainName,
        account,
        messageLength: message.length
      });
      
      // Signer le message
      const signature = await service.signMessage(message, account);
      
      // Journaliser la signature réussie
      logger.info('useSecureSignature', 'Signature réussie', {
        chainName,
        account,
        signatureLength: signature.length
      });
      
      return signature;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      
      // Journaliser l'erreur
      logger.error('useSecureSignature', 'Erreur lors de la signature', error);
      
      return null;
    } finally {
      setIsSigningMessage(false);
    }
  }, [chainName]);

  /**
   * Vérifie une signature
   * @param message Message original
   * @param signature Signature à vérifier
   * @param address Adresse du signataire
   * @returns true si la signature est valide, false sinon
   */
  const verifySignature = useCallback(async (
    message: string,
    signature: string,
    address: string
  ): Promise<boolean> => {
    try {
      setError(null);
      
      // Vérifier si le wallet est connecté
      if (!secureWalletService.isWalletConnected(chainName)) {
        throw new Error('Wallet non connecté');
      }
      
      // Récupérer le service blockchain
      const service = secureWalletService.getBlockchainService(chainName);
      if (!service) {
        throw new Error('Service blockchain non disponible');
      }
      
      // Vérifier la signature
      const isValid = await service.verifySignature(message, signature, address);
      
      // Journaliser le résultat de la vérification
      logger.info('useSecureSignature', 'Vérification de signature', {
        chainName,
        address,
        isValid
      });
      
      return isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      
      // Journaliser l'erreur
      logger.error('useSecureSignature', 'Erreur lors de la vérification de signature', error);
      
      return false;
    }
  }, [chainName]);

  return {
    signMessage,
    verifySignature,
    isSigningMessage,
    error
  };
};
