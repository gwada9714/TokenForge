import { useEffect, useCallback } from 'react';
import { useAccount, useChainId, useDisconnect } from 'wagmi';
import { logger } from '@/utils/firebase-logger';
import { SUPPORTED_CHAINS, DEFAULT_CHAIN, isChainSupported } from '@/config/constants/chains';
import { EthereumError } from '../types/ethereum';

const LOG_CATEGORY = 'WalletReconnection';

export const useWalletReconnection = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();

  const isCorrectNetwork = useCallback(() => {
    if (!chainId) return false;
    return isChainSupported(chainId);
  }, [chainId]);

  const handleNetworkChange = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdNumber = parseInt(chainId, 16);

      if (!isChainSupported(chainIdNumber)) {
        logger.warn('Réseau non supporté détecté', { chainId: chainIdNumber });

        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${DEFAULT_CHAIN.id.toString(16)}` }],
          });
        } catch (switchError) {
          const error = switchError as EthereumError;
          if (error.code === '4902') {
            logger.info('Tentative d\'ajout du réseau par défaut');
            // Ici, vous pouvez implémenter l'ajout du réseau
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      const ethError = error as EthereumError;
      logger.error('Erreur lors du changement de réseau', { 
        code: ethError.code,
        message: ethError.message,
        data: ethError.data
      });
      disconnect();
    }
  }, [disconnect]);

  const attemptReconnection = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });

      if (accounts && accounts.length > 0) {
        logger.info('Wallet reconnecté avec succès', { address: accounts[0] });
        await handleNetworkChange();
      }
    } catch (error) {
      const ethError = error as EthereumError;
      logger.error('Erreur lors de la tentative de reconnexion', {
        code: ethError.code,
        message: ethError.message,
        data: ethError.data
      });
      disconnect();
    }
  }, [handleNetworkChange, disconnect]);

  useEffect(() => {
    if (isConnected && !isCorrectNetwork()) {
      handleNetworkChange();
    }
  }, [isConnected, isCorrectNetwork, handleNetworkChange]);

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        logger.info('Déconnexion du wallet détectée');
        disconnect();
      } else if (address !== accounts[0]) {
        logger.info('Changement de compte détecté', { newAddress: accounts[0] });
        window.location.reload();
      }
    };

    const handleChainChanged = () => {
      logger.info('Changement de réseau détecté');
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [address, disconnect]);

  return {
    attemptReconnection,
    handleNetworkChange,
    isCorrectNetwork: isCorrectNetwork(),
  };
}; 