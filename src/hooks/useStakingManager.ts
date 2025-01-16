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
}

export const useStakingManager = () => {
  const [state, setState] = useState<StakingState>({
    stakedAmount: 0n,
    rewards: 0n,
    apr: 0,
    totalStaked: 0n,
    stakingHistory: [],
    isLoading: true
  });

  const { provider } = useWeb3Provider();
  const { address } = useAccount();
  const [contract, setContract] = useState<Contract | null>(null);

  // Initialisation du contrat
  useEffect(() => {
    if (!provider || !address) return;
    
    const stakingContract = new Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_ABI,
      provider
    );
    
    setContract(stakingContract);
  }, [provider, address]);

  // Fonction pour charger les données de staking
  const loadStakingData = useCallback(async () => {
    if (!contract || !address) return;

    try {
      // Chargement des données principales
      const [stakedAmount, rewards, totalStaked] = await Promise.all([
        contract.stakedAmount(address),
        contract.pendingRewards(address),
        contract.totalStaked()
      ]);

      // Mise à jour de l'état initial
      setState(prev => ({
        ...prev,
        stakedAmount,
        rewards,
        totalStaked,
        isLoading: false
      }));

      // Chargement asynchrone de l'historique
      loadStakingHistory();
      
      // Calcul de l'APR
      calculateAPR();
    } catch (error) {
      console.error('Error loading staking data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [contract, address]);

  // Fonction pour charger l'historique de staking
  const loadStakingHistory = useCallback(async () => {
    if (!contract || !address) return;

    try {
      const filter = contract.filters.StakingAction(address);
      const events = await contract.queryFilter(filter);
      const history = events.map(event => {
        // Utilisation du type correct pour les événements ethers v6
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

      setState(prev => ({
        ...prev,
        stakingHistory: history
      }));
    } catch (error) {
      console.error('Error loading staking history:', error);
    }
  }, [contract, address]);

  // Calcul de l'APR
  const calculateAPR = useCallback(async () => {
    if (!contract) return;

    try {
      const rewardRate = await contract.rewardRate();
      const totalStaked = await contract.totalStaked();
      
      if (totalStaked === 0n) {
        setState(prev => ({ ...prev, apr: 0 }));
        return;
      }

      const annualRewards = rewardRate * BigInt(365 * 24 * 60 * 60);
      const apr = Number(formatValue(annualRewards * 100n / totalStaked));
      
      setState(prev => ({ ...prev, apr }));
    } catch (error) {
      console.error('Error calculating APR:', error);
    }
  }, [contract]);

  // Chargement initial des données
  useEffect(() => {
    loadStakingData();
  }, [loadStakingData]);

  // Actions de staking
  const stake = async (amount: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    const parsedAmount = parseValue(amount);
    const tx = await contract.stake(parsedAmount);
    await tx.wait();
    
    await loadStakingData();
  };

  const unstake = async (amount: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    const parsedAmount = parseValue(amount);
    const tx = await contract.unstake(parsedAmount);
    await tx.wait();
    
    await loadStakingData();
  };

  const claimRewards = async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.claimRewards();
    await tx.wait();
    
    await loadStakingData();
  };

  return {
    ...state,
    stake,
    unstake,
    claimRewards
  };
};
