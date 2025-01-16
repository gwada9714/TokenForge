import { useState, useEffect, useCallback } from 'react';
import { useWeb3Provider } from './useWeb3Provider';
import { Contract } from 'ethers';
import { formatValue, parseValue } from '@/utils/web3Adapters';
import { STAKING_ABI } from '@/constants/abis';
import { STAKING_CONTRACT_ADDRESS } from '@/constants/addresses';
import { useAccount } from 'wagmi';

interface StakingState {
  stakedAmount: bigint;
  rewards: bigint;
  apr: number;
  totalStaked: bigint;
  stakingHistory: Array<{
    timestamp: number;
    action: 'stake' | 'unstake' | 'claim';
    amount: bigint;
  }>;
  isLoading: boolean;
  error: Error | null;
  networkInfo: {
    chainId: number;
    name: string;
  } | null;
}

export const useStakingManager = () => {
  const [state, setState] = useState<StakingState>({
    stakedAmount: 0n,
    rewards: 0n,
    apr: 0,
    totalStaked: 0n,
    stakingHistory: [],
    isLoading: true,
    error: null,
    networkInfo: null
  });

  const { provider } = useWeb3Provider();
  const { address } = useAccount();
  const [contract, setContract] = useState<Contract | null>(null);

  // Get network information
  const getNetworkInfo = useCallback(async () => {
    if (!provider) return null;
    try {
      const network = await provider.getNetwork();
      return {
        chainId: network.chainId,
        name: network.name,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting network info:', error);
      return null;
    }
  }, [provider]);

  // Contract initialization with enhanced error handling
  useEffect(() => {
    const initializeContract = async () => {
      if (!provider || !address) return;
      
      try {
        const networkInfo = await getNetworkInfo();
        // eslint-disable-next-line no-console
        console.log('Contract initialization details:', {
          address: STAKING_CONTRACT_ADDRESS,
          networkInfo,
          userAddress: address,
        });

        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_ABI,
          provider
        );
        
        setContract(stakingContract);
        setState(prev => ({ ...prev, networkInfo }));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error initializing contract:', error);
        setState(prev => ({ 
          ...prev, 
          error: new Error('Failed to initialize staking contract'),
          isLoading: false 
        }));
      }
    };

    initializeContract();
  }, [provider, address, getNetworkInfo]);

  // Enhanced staking data loading with detailed error handling
  const loadStakingData = useCallback(async () => {
    if (!contract || !address) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // eslint-disable-next-line no-console
      console.log('Loading staking data for address:', address);
      
      // Load main staking data with individual error handling
      const [stakedAmount, rewards, totalStaked] = await Promise.all([
        contract.stakedAmount(address).catch(error => {
          // eslint-disable-next-line no-console
          console.error('Error fetching staked amount:', error);
          throw new Error('Failed to fetch staked amount');
        }),
        contract.pendingRewards(address).catch(error => {
          // eslint-disable-next-line no-console
          console.error('Error fetching pending rewards:', error);
          throw new Error('Failed to fetch pending rewards');
        }),
        contract.totalStaked().catch(error => {
          // eslint-disable-next-line no-console
          console.error('Error fetching total staked:', error);
          throw new Error('Failed to fetch total staked amount');
        })
      ]);

      // eslint-disable-next-line no-console
      console.log('Raw staking data responses:', {
        stakedAmount,
        rewards,
        totalStaked
      });
      
      setState(prev => ({

        ...prev,
        stakedAmount,
        rewards,
        totalStaked,
        isLoading: false,
        error: null
      }));

      // Load additional data asynchronously
      loadStakingHistory();
      calculateAPR();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Detailed staking error:', {
        error,
        contractAddress: STAKING_CONTRACT_ADDRESS,
        userAddress: address,
        networkInfo: state.networkInfo
      });
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to load staking data')
      }));
    }
  }, [contract, address, state.networkInfo, loadStakingHistory, calculateAPR]);

  // Enhanced staking history loading
  const loadStakingHistory = useCallback(async () => {
    if (!contract || !address) return;

    try {
      // eslint-disable-next-line no-console
      console.log('Loading staking history for address:', address);
      
      const filter = contract.filters.StakingAction(address);
      const events = await contract.queryFilter(filter);
      
      const history = events.map(event => {
        const { args } = event as unknown as {
          args: [string, string, bigint, bigint] & {
            user: string;
            action: string;
            amount: bigint;
            timestamp: bigint;
          }
        };
        
        return {
          timestamp: Number(args.timestamp),
          action: args.action as 'stake' | 'unstake' | 'claim',
          amount: args.amount
        };
      });

      // eslint-disable-next-line no-console
      console.log('Successfully loaded staking history:', history.length, 'events');
      
      setState(prev => ({
        ...prev,
        stakingHistory: history
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading staking history:', error);
      // Don't update error state as this is not critical
    }
  }, [contract, address]);

  // Enhanced APR calculation
  const calculateAPR = useCallback(async () => {
    if (!contract) return;

    try {
      // eslint-disable-next-line no-console
      console.log('Calculating APR...');
      
      const rewardRate = await contract.rewardRate();
      const totalStaked = await contract.totalStaked();
      
      if (totalStaked === 0n) {
        setState(prev => ({ ...prev, apr: 0 }));
        return;
      }

      const annualRewards = rewardRate * BigInt(365 * 24 * 60 * 60);
      const apr = Number(formatValue(annualRewards * 100n / totalStaked));
      
      // eslint-disable-next-line no-console
      console.log('APR calculation result:', {
        rewardRate: rewardRate.toString(),
        totalStaked: totalStaked.toString(),
        calculatedAPR: apr
      });
      
      setState(prev => ({ ...prev, apr }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error calculating APR:', error);
      // Don't update error state as this is not critical
    }
  }, [contract]);

  // Initial data loading
  useEffect(() => {
    loadStakingData();
  }, [loadStakingData]);

  // Enhanced staking actions with better error handling
  const stake = async (amount: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      // eslint-disable-next-line no-console
      console.log('Initiating stake transaction:', amount);
      
      const parsedAmount = parseValue(amount);
      const tx = await contract.stake(parsedAmount);
      // eslint-disable-next-line no-console
      console.log('Stake transaction sent:', tx.hash);
      
      await tx.wait();
      // eslint-disable-next-line no-console
      console.log('Stake transaction confirmed');
      
      await loadStakingData();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Stake transaction failed:', error);
      throw error;
    }
  };

  const unstake = async (amount: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      // eslint-disable-next-line no-console
      console.log('Initiating unstake transaction:', amount);
      
      const parsedAmount = parseValue(amount);
      const tx = await contract.unstake(parsedAmount);
      // eslint-disable-next-line no-console
      console.log('Unstake transaction sent:', tx.hash);
      
      await tx.wait();
      // eslint-disable-next-line no-console
      console.log('Unstake transaction confirmed');
      
      await loadStakingData();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unstake transaction failed:', error);
      throw error;
    }
  };

  const claimRewards = async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      // eslint-disable-next-line no-console
      console.log('Initiating claim rewards transaction');
      
      const tx = await contract.claimRewards();
      // eslint-disable-next-line no-console
      console.log('Claim rewards transaction sent:', tx.hash);
      
      await tx.wait();
      // eslint-disable-next-line no-console
      console.log('Claim rewards transaction confirmed');
      
      await loadStakingData();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Claim rewards transaction failed:', error);
      throw error;
    }
  };

  // Add refresh function
  const refreshStakingData = useCallback(() => {
    loadStakingData();
  }, [loadStakingData]);

  return {
    ...state,
    stake,
    unstake,
    claimRewards,
    refreshStakingData
  };
};
