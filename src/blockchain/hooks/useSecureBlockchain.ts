import { useState, useEffect, useCallback } from 'react';
import { secureWalletService } from '../services/SecureWalletService';
import { IBlockchainService } from '../interfaces/IBlockchainService';
import { logger } from '@/core/logger';

/**
 * Interface pour les résultats du hook useSecureBlockchain
 */
interface UseSecureBlockchainResult {
  service: IBlockchainService | null;
  isConnected: boolean;
  networkId: number | null;
  account: string | null;
  error: string | null;
  walletType: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isAllowedNetwork: boolean;
}

/**
 * Hook React sécurisé pour utiliser les services blockchain dans l'UI
 * Utilise le SecureWalletService pour une connexion wallet sécurisée
 * 
 * @param chainName Nom de la blockchain (ethereum, binance, polygon, avalanche, arbitrum, solana)
 * @param walletProvider Provider du wallet (window.ethereum, etc.)
 * @returns Résultat contenant le service blockchain, l'état de connexion, et les fonctions de connexion/déconnexion
 */
export const useSecureBlockchain = (
  chainName: string,
  walletProvider?: any
): UseSecureBlockchainResult => {
  const [service, setService] = useState<IBlockchainService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isAllowedNetwork, setIsAllowedNetwork] = useState(false);

  /**
   * Fonction de connexion au wallet
   */
  const connect = useCallback(async () => {
    try {
      setError(null);
      
      if (!walletProvider) {
        throw new Error('Provider de wallet non disponible');
      }
      
      // Connecter le wallet de manière sécurisée
      const blockchainService = await secureWalletService.connectWallet(chainName, walletProvider);
      
      // Mettre à jour l'état
      setService(blockchainService);
      setIsConnected(true);
      
      // Récupérer l'ID du réseau
      const networkId = await blockchainService.getNetworkId();
      setNetworkId(networkId);
      
      // Vérifier si le réseau est autorisé
      const allowedNetworks = secureWalletService.getAllowedNetworks(chainName);
      setIsAllowedNetwork(allowedNetworks.includes(networkId));
      
      // Récupérer le compte principal
      const primaryAccount = secureWalletService.getPrimaryAccount(chainName);
      setAccount(primaryAccount);
      
      // Déterminer le type de wallet
      setWalletType(
        walletProvider.isMetaMask ? 'metamask' :
        walletProvider.isTrust ? 'trust' :
        walletProvider.isCoinbaseWallet ? 'coinbase' :
        walletProvider.isWalletConnect ? 'walletconnect' :
        walletProvider.isBraveWallet ? 'brave' :
        'unknown'
      );
      
      logger.info('useSecureBlockchain', `Wallet connecté pour ${chainName}`, {
        networkId,
        account: primaryAccount,
        walletType
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      setIsConnected(false);
      setService(null);
      setNetworkId(null);
      setAccount(null);
      
      logger.error('useSecureBlockchain', `Erreur lors de la connexion au wallet pour ${chainName}`, error);
    }
  }, [chainName, walletProvider]);

  /**
   * Fonction de déconnexion du wallet
   */
  const disconnect = useCallback(async () => {
    try {
      if (isConnected) {
        await secureWalletService.disconnectWallet(chainName);
      }
      
      // Réinitialiser l'état
      setService(null);
      setIsConnected(false);
      setNetworkId(null);
      setAccount(null);
      setWalletType(null);
      
      logger.info('useSecureBlockchain', `Wallet déconnecté pour ${chainName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      
      logger.error('useSecureBlockchain', `Erreur lors de la déconnexion du wallet pour ${chainName}`, error);
    }
  }, [chainName, isConnected]);

  /**
   * Effet pour initialiser la connexion et configurer les écouteurs d'événements
   */
  useEffect(() => {
    // Vérifier si le wallet est déjà connecté
    const checkConnection = async () => {
      try {
        if (secureWalletService.isWalletConnected(chainName)) {
          const service = secureWalletService.getBlockchainService(chainName);
          if (service) {
            setService(service);
            setIsConnected(true);
            
            const networkId = await service.getNetworkId();
            setNetworkId(networkId);
            
            const allowedNetworks = secureWalletService.getAllowedNetworks(chainName);
            setIsAllowedNetwork(allowedNetworks.includes(networkId));
            
            const primaryAccount = secureWalletService.getPrimaryAccount(chainName);
            setAccount(primaryAccount);
            
            logger.info('useSecureBlockchain', `Wallet déjà connecté pour ${chainName}`, {
              networkId,
              account: primaryAccount
            });
          }
        }
      } catch (error) {
        logger.error('useSecureBlockchain', `Erreur lors de la vérification de connexion pour ${chainName}`, error);
      }
    };
    
    checkConnection();
    
    // Configurer les écouteurs d'événements pour les changements de compte et de réseau
    const setupListeners = () => {
      if (walletProvider?.on) {
        // Changement de compte
        walletProvider.on('accountsChanged', (accounts: string[]) => {
          setAccount(accounts.length > 0 ? accounts[0] : null);
          
          logger.info('useSecureBlockchain', `Comptes changés pour ${chainName}`, {
            accounts
          });
        });
        
        // Changement de chaîne
        walletProvider.on('chainChanged', async (chainId: string) => {
          // Convertir l'ID de chaîne en nombre
          const newNetworkId = parseInt(chainId, 16);
          setNetworkId(newNetworkId);
          
          // Vérifier si le réseau est autorisé
          const allowedNetworks = secureWalletService.getAllowedNetworks(chainName);
          const isAllowed = allowedNetworks.includes(newNetworkId);
          setIsAllowedNetwork(isAllowed);
          
          logger.info('useSecureBlockchain', `Réseau changé pour ${chainName}`, {
            networkId: newNetworkId,
            isAllowed
          });
          
          // Si le réseau n'est pas autorisé, afficher une erreur
          if (!isAllowed) {
            setError(`Réseau non autorisé: ${newNetworkId}`);
          } else {
            setError(null);
          }
        });
        
        // Déconnexion
        walletProvider.on('disconnect', (error: any) => {
          setIsConnected(false);
          setService(null);
          setNetworkId(null);
          setAccount(null);
          
          logger.info('useSecureBlockchain', `Wallet déconnecté pour ${chainName}`, {
            error
          });
        });
      }
    };
    
    if (walletProvider) {
      setupListeners();
    }
    
    // Nettoyer les écouteurs d'événements lors du démontage
    return () => {
      if (walletProvider?.removeListener) {
        walletProvider.removeListener('accountsChanged', () => {});
        walletProvider.removeListener('chainChanged', () => {});
        walletProvider.removeListener('disconnect', () => {});
      }
    };
  }, [chainName, walletProvider]);

  return {
    service,
    isConnected,
    networkId,
    account,
    error,
    walletType,
    connect,
    disconnect,
    isAllowedNetwork
  };
};
