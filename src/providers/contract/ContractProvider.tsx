import React, { createContext, useContext, useEffect, useState } from 'react';
import { Address, Hash } from 'viem';
import { sepolia } from 'viem/chains';
import { useNetworkManagement } from '@/hooks/useNetworkManagement';

export interface TokenContract {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  owner: Address;
  chainId: number;
  createdAt: number;
  type: 'ERC20' | 'ERC721' | 'ERC1155';
  metadata?: {
    description?: string;
    image?: string;
    externalLink?: string;
  };
}

interface ContractContextType {
  contracts: TokenContract[];
  addContract: (contract: TokenContract) => void;
  removeContract: (address: Address) => void;
  getContract: (address: Address) => TokenContract | undefined;
  updateContract: (address: Address, updates: Partial<TokenContract>) => void;
  deploymentStatus: {
    [key: string]: {
      status: 'pending' | 'success' | 'error';
      hash?: Hash;
      error?: string;
    };
  };
  setDeploymentStatus: (address: string, status: ContractContextType['deploymentStatus'][string]) => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contracts, setContracts] = useState<TokenContract[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<ContractContextType['deploymentStatus']>({});
  const { currentChainId } = useNetworkManagement(sepolia);

  // Charger les contrats depuis le stockage local au démarrage
  useEffect(() => {
    const loadContracts = () => {
      const savedContracts = localStorage.getItem('tokenforge_contracts');
      if (savedContracts) {
        try {
          const parsed = JSON.parse(savedContracts);
          setContracts(parsed);
        } catch (error) {
          console.error('Failed to load contracts from storage:', error);
        }
      }
    };

    loadContracts();
  }, []);

  // Sauvegarder les contrats dans le stockage local à chaque modification
  useEffect(() => {
    localStorage.setItem('tokenforge_contracts', JSON.stringify(contracts));
  }, [contracts]);

  // Réinitialiser le statut de déploiement lors du changement de réseau
  useEffect(() => {
    if (currentChainId) {
      setDeploymentStatus({});
    }
  }, [currentChainId]);

  const addContract = (contract: TokenContract) => {
    setContracts(prev => [...prev, contract]);
  };

  const removeContract = (address: Address) => {
    setContracts(prev => prev.filter(c => c.address !== address));
    const newStatus = { ...deploymentStatus };
    delete newStatus[address];
    setDeploymentStatus(newStatus);
  };

  const getContract = (address: Address) => {
    return contracts.find(c => c.address === address);
  };

  const updateContract = (address: Address, updates: Partial<TokenContract>) => {
    setContracts(prev => prev.map(c => 
      c.address === address ? { ...c, ...updates } : c
    ));
  };

  const handleSetDeploymentStatus = (address: string, status: ContractContextType['deploymentStatus'][string]) => {
    setDeploymentStatus(prev => ({
      ...prev,
      [address]: status,
    }));
  };

  return (
    <ContractContext.Provider
      value={{
        contracts,
        addContract,
        removeContract,
        getContract,
        updateContract,
        deploymentStatus,
        setDeploymentStatus: handleSetDeploymentStatus,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

export default ContractProvider;
