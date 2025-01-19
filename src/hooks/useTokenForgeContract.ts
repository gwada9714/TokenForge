import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contract';

export const useTokenForgeContract = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const contract = walletClient 
    ? getContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        publicClient,
        walletClient,
      })
    : getContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        publicClient,
      });

  const isPaused = async (): Promise<boolean> => {
    try {
      return await contract.read.paused();
    } catch (error) {
      console.error('Error checking pause status:', error);
      return false;
    }
  };

  const pause = async (): Promise<void> => {
    if (!walletClient) throw new Error('No wallet connected');
    const hash = await contract.write.pause();
    await publicClient.waitForTransactionReceipt({ hash });
  };

  const unpause = async (): Promise<void> => {
    if (!walletClient) throw new Error('No wallet connected');
    const hash = await contract.write.unpause();
    await publicClient.waitForTransactionReceipt({ hash });
  };

  const transferOwnership = async (newOwner: string): Promise<void> => {
    if (!walletClient) throw new Error('No wallet connected');
    const hash = await contract.write.transferOwnership([newOwner]);
    await publicClient.waitForTransactionReceipt({ hash });
  };

  return {
    contract,
    isPaused,
    pause,
    unpause,
    transferOwnership,
  };
};
