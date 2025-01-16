import { useEffect, useState, useCallback } from 'react';
import { ethers, BrowserProvider, Contract, Signer } from 'ethers';
import { useWeb3React } from '@web3-react/core';

interface StakingState {
  totalStaked: string;
  userStake: string;
  isLoading: boolean;
  error: Error | null;
  networkInfo: {
    chainId: number;
    name: string;
  } | null;
}

export const useStakingManagerV2 = (stakingAddress: string, stakingABI: ethers.ContractInterface) => {
  const { library, account } = useWeb3React();
  const [state, setState] = useState<StakingState>({
    totalStaked: '0',
    userStake: '0',
    isLoading: true,
    error: null,
    networkInfo: null,
  });

  const getNetworkInfo = useCallback(async () => {
    if (!library) return null;
    const provider = library as BrowserProvider;
    const network = await provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name,
    };
  }, [library]);

  const loadStakingData = useCallback(async () => {
    if (!library || !account || !stakingAddress) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const provider = library as BrowserProvider;
      const networkInfo = await getNetworkInfo();
      
      // eslint-disable-next-line no-console
      console.log('Contract initialization details:', {
        stakingAddress,
        networkInfo,
        account,
      });

      const signer: Signer = await provider.getSigner();
      const stakingContract = new Contract(
        stakingAddress,
        stakingABI,
        signer
      );

      let totalStaked = '0';
      let userStake = '0';

      try {
        const totalStakedBN = await stakingContract.totalStaked();
        // eslint-disable-next-line no-console
        console.log('Raw totalStaked response:', totalStakedBN);
        const formattedTotalStaked = ethers.formatUnits(totalStakedBN, 18);
        totalStaked = formattedTotalStaked;
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error('Error fetching totalStaked:', error instanceof Error ? error.message : 'Unknown error');
        throw new Error(`Failed to fetch totalStaked: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      try {
        const userStakeBN = await stakingContract.balanceOf(account);
        // eslint-disable-next-line no-console
        console.log('Raw userStake response:', userStakeBN);
        const formattedUserStake = ethers.formatUnits(userStakeBN, 18);
        userStake = formattedUserStake;
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error('Error fetching user stake:', error instanceof Error ? error.message : 'Unknown error');
        throw new Error(`Failed to fetch user stake: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      setState(prev => ({
        ...prev,
        totalStaked,
        userStake,
        isLoading: false,
        error: null,
        networkInfo,
      }));
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error loading staking data:', error instanceof Error ? error.message : 'Unknown error');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      }));
    }
  }, [library, account, stakingAddress, stakingABI, getNetworkInfo]);

  useEffect(() => {
    loadStakingData();
  }, [loadStakingData]);

  const refreshStakingData = useCallback(() => {
    loadStakingData();
  }, [loadStakingData]);

  return {
    ...state,
    refreshStakingData,
  };
};
