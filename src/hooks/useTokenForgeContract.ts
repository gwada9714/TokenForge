import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract, type Address, type GetContractReturnType } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contract';

type TokenForgeContract = GetContractReturnType<typeof CONTRACT_ABI>;

export const useTokenForgeContract = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  if (!publicClient) {
    throw new Error('Public client not available');
  }

  const contract = walletClient 
    ? getContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        client: {
          public: publicClient,
          wallet: walletClient,
        }
      })
    : getContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        client: publicClient,
      });

  const isPaused = async (): Promise<boolean> => {
    try {
      const result = await (contract as TokenForgeContract).read.paused();
      return result;
    } catch (error) {
      console.error('Error checking pause status:', error);
      return false;
    }
  };

  const pause = async (): Promise<void> => {
    if (!walletClient) throw new Error('No wallet connected');
    const hash = await (contract as TokenForgeContract).write.pause();
    await publicClient.waitForTransactionReceipt({ hash });
  };

  const unpause = async (): Promise<void> => {
    if (!walletClient) throw new Error('No wallet connected');
    const hash = await (contract as TokenForgeContract).write.unpause();
    await publicClient.waitForTransactionReceipt({ hash });
  };

  const transferOwnership = async (newOwner: Address): Promise<void> => {
    if (!walletClient) throw new Error('No wallet connected');
    const hash = await (contract as TokenForgeContract).write.transferOwnership([newOwner]);
    await publicClient.waitForTransactionReceipt({ hash });
  };

  return {
    contract: contract as TokenForgeContract,
    isPaused,
    pause,
    unpause,
    transferOwnership,
  };
};
