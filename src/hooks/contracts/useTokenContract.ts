import { useContract } from '@/providers/contract';
import { Address } from 'viem';
import { useCallback } from 'react';
import { TokenContract } from '@/providers/contract/ContractProvider';

export const useTokenContract = () => {
  const { contracts, addContract, removeContract, updateContract, getContract } = useContract();

  const getTokenDetails = useCallback((address: Address) => {
    return getContract(address);
  }, [getContract]);

  const addTokenContract = useCallback((contract: TokenContract) => {
    addContract(contract);
  }, [addContract]);

  const removeTokenContract = useCallback((address: Address) => {
    removeContract(address);
  }, [removeContract]);

  const updateTokenContract = useCallback((address: Address, updates: Partial<TokenContract>) => {
    updateContract(address, updates);
  }, [updateContract]);

  return {
    contracts,
    getTokenDetails,
    addTokenContract,
    removeTokenContract,
    updateTokenContract,
  };
};

export default useTokenContract;
