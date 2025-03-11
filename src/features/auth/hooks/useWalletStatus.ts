import { WalletState } from '../types/auth';
import { useAccount, useChainId, useSwitchChain, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { createAuthError, AuthErrorCode } from '../errors/AuthError';
import { logger } from '../../../core/logger';

// Types pour les providers de wallet
interface WalletProvider {
  isMetaMask?: boolean;
  isTrust?: boolean;
  isCoinbaseWallet?: boolean;
  isWalletConnect?: boolean;
}

// Étendre la définition de window pour inclure ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isTrust?: boolean;
      isCoinbaseWallet?: boolean;
      isWalletConnect?: boolean;
      providers?: WalletProvider[];
    };
  }
}

export function useWalletStatus(): {
  wallet: WalletState | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  address: `0x${string}` | null;
  connect: (address?: string, chainId?: number) => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  hasInjectedProvider: boolean;
} {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const [hasInjectedProvider, setHasInjectedProvider] = useState<boolean>(false);

  // Vérifier la disponibilité d'un provider injecté au chargement
  useEffect(() => {
    const checkInjectedProvider = () => {
      // Approche multiple pour détecter un wallet
      // 1. Vérifier si window.ethereum existe
      const hasEthereum = typeof window !== 'undefined' && Boolean(window.ethereum);
      
      // 2. Vérifier les connecteurs disponibles
      const hasConnector = connectors.some(c => c.id === 'injected' && c.ready);
      
      // 3. Vérifier spécifiquement MetaMask
      const hasMetaMask = typeof window !== 'undefined' && 
                         Boolean(window.ethereum) && 
                         (window.ethereum.isMetaMask || window.ethereum.providers?.some((p: WalletProvider) => p.isMetaMask));
      
      // 4. Vérifier les autres wallets comme TrustWallet, Coinbase Wallet, etc.
      const hasOtherWallet = typeof window !== 'undefined' && 
                           Boolean(window.ethereum) && 
                           (window.ethereum.isTrust || 
                            window.ethereum.isCoinbaseWallet || 
                            window.ethereum.isWalletConnect || 
                            window.ethereum.providers?.some((p: WalletProvider) => p.isTrust || p.isCoinbaseWallet || p.isWalletConnect));
      
      const isProviderDetected = hasEthereum || hasConnector || hasMetaMask || hasOtherWallet;
      
      setHasInjectedProvider(isProviderDetected);
      
      logger.info({
        category: 'Wallet',
        message: 'Vérification approfondie du provider de wallet',
        data: { 
          hasEthereum, 
          hasConnector,
          hasMetaMask,
          hasOtherWallet,
          isProviderDetected,
          availableConnectors: connectors.map(c => ({ id: c.id, ready: c.ready })),
          ethereumObject: typeof window !== 'undefined' && window.ethereum ? {
            isMetaMask: window.ethereum.isMetaMask,
            isTrust: window.ethereum.isTrust,
            isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
            hasProviders: Boolean(window.ethereum.providers),
            providersCount: window.ethereum.providers?.length
          } : 'Non disponible'
        }
      });
    };
    
    // Exécuter la vérification initiale
    checkInjectedProvider();
    
    // Vérifier aussi après un court délai pour s'assurer que les extensions ont eu le temps de s'initialiser
    const timeoutId = setTimeout(() => {
      checkInjectedProvider();
    }, 1000);
    
    // Nettoyer le timeout
    return () => clearTimeout(timeoutId);
  }, [connectors]);

  // Determine if on correct network (replace with your network check logic)
  const isCorrectNetwork = chainId === 1 || chainId === 11155111; // Mainnet or Sepolia

  const walletState: WalletState = {
    address: address || null,
    isConnected: Boolean(isConnected),
    isCorrectNetwork,
    chainId
  };

  // Implement actual connect function using wagmi's connectAsync
  const connect = async (_address?: string, _chainId?: number) => {
    try {
      if (!hasInjectedProvider) {
        // Faire une dernière vérification au moment de la connexion
        const hasEthereumNow = typeof window !== 'undefined' && Boolean(window.ethereum);
        const hasMetaMaskNow = typeof window !== 'undefined' && 
                             Boolean(window.ethereum) && 
                             (window.ethereum.isMetaMask || window.ethereum.providers?.some((p: WalletProvider) => p.isMetaMask));
        
        if (hasEthereumNow || hasMetaMaskNow) {
          // Si le wallet est détecté maintenant, mettre à jour l'état et continuer
          setHasInjectedProvider(true);
          logger.info({
            category: 'Wallet',
            message: "Provider wallet détecté tardivement, tentative de connexion",
            data: { hasEthereumNow, hasMetaMaskNow }
          });
        } else {
          // Si toujours pas de wallet, lever une erreur
          const error = createAuthError(
            AuthErrorCode.WALLET_NOT_FOUND,
            "Aucun wallet n'a été détecté. Veuillez installer MetaMask ou un autre wallet compatible."
          );
          
          logger.error({
            category: 'Wallet',
            message: "Tentative de connexion sans wallet installé",
            error
          });
          
          throw error;
        }
      }
      
      logger.info({
        category: 'Wallet',
        message: 'Connecting wallet',
        data: { address: _address, chainId: _chainId }
      });

      // Find the injected connector (MetaMask, etc.)
      const injectedConnector = connectors.find(c => c.id === 'injected');

      if (!injectedConnector) {
        const error = createAuthError(
          AuthErrorCode.WALLET_CONNECTION_ERROR,
          "Le connecteur injecté n'est pas disponible. Veuillez vous assurer que votre wallet est correctement configuré."
        );
        
        logger.error({
          category: 'Wallet',
          message: 'No injected connector found',
          error
        });
        
        throw error;
      }

      await connectAsync({
        connector: injectedConnector,
        chainId: _chainId
      });

      logger.info({
        category: 'Wallet',
        message: 'Wallet connected successfully',
        data: { address, chainId }
      });
    } catch (error) {
      logger.error({
        category: 'Wallet',
        message: 'Failed to connect wallet',
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  };

  // Implement actual disconnect function using wagmi's disconnectAsync
  const disconnect = async () => {
    try {
      logger.info({
        category: 'Wallet',
        message: 'Disconnecting wallet'
      });

      await disconnectAsync();

      logger.info({
        category: 'Wallet',
        message: 'Wallet disconnected successfully'
      });
    } catch (error) {
      logger.error({
        category: 'Wallet',
        message: 'Failed to disconnect wallet',
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    try {
      if (!isConnected) {
        const error = createAuthError(
          AuthErrorCode.WALLET_DISCONNECTED,
          "Vous devez d'abord connecter votre wallet avant de changer de réseau."
        );
        
        logger.error({
          category: 'Wallet',
          message: 'Tentative de changement de réseau sans wallet connecté',
          error
        });
        
        throw error;
      }
      
      logger.info({
        category: 'Wallet',
        message: 'Switching network',
        data: { targetChainId }
      });

      await switchChain({ chainId: targetChainId });

      logger.info({
        category: 'Wallet',
        message: 'Network switched successfully',
        data: { targetChainId }
      });
    } catch (error) {
      logger.error({
        category: 'Wallet',
        message: 'Failed to switch network',
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  };

  return {
    wallet: walletState,
    isConnected,
    isCorrectNetwork,
    address: address || null,
    connect,
    disconnect,
    switchNetwork,
    hasInjectedProvider
  };
}
