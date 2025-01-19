import { useEffect, useState, useCallback } from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { toast } from 'react-hot-toast';
import { SUPPORTED_NETWORKS, networks } from '../config/networks';

type SupportedChainId = 
  | typeof SUPPORTED_NETWORKS.MAINNET
  | typeof SUPPORTED_NETWORKS.SEPOLIA
  | typeof SUPPORTED_NETWORKS.BSC
  | typeof SUPPORTED_NETWORKS.BSC_TESTNET
  | typeof SUPPORTED_NETWORKS.POLYGON
  | typeof SUPPORTED_NETWORKS.POLYGON_MUMBAI
  | typeof SUPPORTED_NETWORKS.AVALANCHE
  | typeof SUPPORTED_NETWORKS.AVALANCHE_FUJI;

interface NetworkStatusState {
  isSupported: boolean;
  isMainnet: boolean;
  isTestnet: boolean;
  currentNetwork: string | undefined;
  error: string | null;
}

export const useNetworkStatus = () => {
  const { chain } = useNetwork();
  const { switchNetwork, isLoading: isSwitching, error: switchError } = useSwitchNetwork();
  
  const [state, setState] = useState<NetworkStatusState>({
    isSupported: false,
    isMainnet: false,
    isTestnet: false,
    currentNetwork: undefined,
    error: null
  });

  // Vérifier le statut du réseau actuel
  const checkNetworkStatus = useCallback(() => {
    if (!chain) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        currentNetwork: undefined,
        error: 'Aucun réseau détecté'
      }));
      return;
    }

    const network = networks[chain.id];
    const supportedChainIds: SupportedChainId[] = [
      SUPPORTED_NETWORKS.MAINNET,
      SUPPORTED_NETWORKS.SEPOLIA,
      SUPPORTED_NETWORKS.BSC,
      SUPPORTED_NETWORKS.BSC_TESTNET,
      SUPPORTED_NETWORKS.POLYGON,
      SUPPORTED_NETWORKS.POLYGON_MUMBAI,
      SUPPORTED_NETWORKS.AVALANCHE,
      SUPPORTED_NETWORKS.AVALANCHE_FUJI
    ];

    const isSupported = supportedChainIds.includes(chain.id as SupportedChainId);

    setState({
      isSupported,
      isMainnet: network ? !network.isTestnet : false,
      isTestnet: network ? network.isTestnet : false,
      currentNetwork: network?.name || chain.name,
      error: isSupported ? null : 'Réseau non supporté'
    });
  }, [chain]);

  // Changer de réseau
  const switchToNetwork = useCallback(async (chainId: SupportedChainId) => {
    if (!switchNetwork) {
      toast.error('Changement de réseau non supporté');
      return;
    }

    try {
      await switchNetwork(chainId);
      toast.success('Réseau changé avec succès');
    } catch (error) {
      console.error('Erreur lors du changement de réseau:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur de changement de réseau');
    }
  }, [switchNetwork]);

  // Passer en réseau de test (Sepolia)
  const switchToTestnet = useCallback(() => {
    return switchToNetwork(SUPPORTED_NETWORKS.SEPOLIA);
  }, [switchToNetwork]);

  // Passer en réseau principal (Ethereum)
  const switchToMainnet = useCallback(() => {
    return switchToNetwork(SUPPORTED_NETWORKS.MAINNET);
  }, [switchToNetwork]);

  // Mettre à jour le statut quand le réseau change
  useEffect(() => {
    checkNetworkStatus();
  }, [chain, checkNetworkStatus]);

  // Gérer les erreurs de changement de réseau
  useEffect(() => {
    if (switchError) {
      setState(prev => ({
        ...prev,
        error: switchError.message
      }));
    }
  }, [switchError]);

  return {
    ...state,
    isSwitching,
    switchToTestnet,
    switchToMainnet,
    switchToNetwork
  };
};
