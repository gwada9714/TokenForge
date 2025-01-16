import { useEffect, useState, useCallback } from 'react';
import { ethers, Contract, Interface, Signer, ContractInterface, Fragment } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import type { Web3Provider } from '@ethersproject/providers';

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
  const { provider: web3Provider, account } = useWeb3React<Web3Provider>();
  const [state, setState] = useState<StakingState>({
    totalStaked: '0',
    userStake: '0',
    isLoading: true,
    error: null,
    networkInfo: null,
  });

  const getNetworkInfo = useCallback(async () => {
    if (!web3Provider) return null;
    const network = await web3Provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name,
    };
  }, [web3Provider]);

  const loadStakingData = useCallback(async () => {
    if (!web3Provider || !account || !stakingAddress) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const networkInfo = await getNetworkInfo();
      
      // eslint-disable-next-line no-console
      console.log('Contract initialization details:', {
        stakingAddress,
        networkInfo,
        account,
      });

      const signer = await web3Provider.getSigner();
      const abiInterface = Array.isArray(stakingABI) 
        ? stakingABI 
        : typeof stakingABI === 'string' 
          ? [stakingABI]
          : stakingABI;
      const stakingContract = new Contract(
        stakingAddress,
        abiInterface as Interface | string[] | readonly (string | Fragment)[],
        signer as unknown as Signer
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
  }, [web3Provider, account, stakingAddress, stakingABI, getNetworkInfo]);

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
