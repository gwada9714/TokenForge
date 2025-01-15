import { useCallback } from 'react';
import { useContractWrite, useContractRead, useAccount } from 'wagmi';
import { LiquidityLockerABI } from '../contracts/abis';
import { Lock } from '../contracts/types';
import { toast } from 'react-hot-toast';

const CONTRACT_ADDRESS = ''; // À remplir après le déploiement

export const useLiquidityLocker = () => {
  const { address } = useAccount();

  const { data: userLocks } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: LiquidityLockerABI,
    functionName: 'getLocks',
    args: [address as `0x${string}`],
    enabled: !!address,
  });

  const { writeAsync: lockLiquidity } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: LiquidityLockerABI,
    functionName: 'lockLiquidity',
  });

  const { writeAsync: unlockLiquidity } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: LiquidityLockerABI,
    functionName: 'unlockLiquidity',
  });

  const handleLockLiquidity = useCallback(async (
    token: string,
    amount: bigint,
    duration: bigint
  ) => {
    try {
      await lockLiquidity({
        args: [token, amount, duration],
      });
      toast.success('Liquidité verrouillée avec succès!');
    } catch (error) {
      console.error('Erreur lors du verrouillage de la liquidité:', error);
      toast.error('Erreur lors du verrouillage de la liquidité');
    }
  }, [lockLiquidity]);

  const handleUnlockLiquidity = useCallback(async (lockIndex: number) => {
    try {
      await unlockLiquidity({
        args: [BigInt(lockIndex)],
      });
      toast.success('Liquidité déverrouillée avec succès!');
    } catch (error) {
      console.error('Erreur lors du déverrouillage de la liquidité:', error);
      toast.error('Erreur lors du déverrouillage de la liquidité');
    }
  }, [unlockLiquidity]);

  return {
    userLocks: userLocks as Lock[],
    lockLiquidity: handleLockLiquidity,
    unlockLiquidity: handleUnlockLiquidity,
  };
};
