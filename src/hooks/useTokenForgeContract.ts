import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract, type Address } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contract';

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
      return await contract.read.paused();
    } catch (error) {
      console.error('Error checking pause status:', error);
      return false;
    }
  };

  const pause = async (): Promise<void> => {
    if (!walletClient || !walletClient.account) throw new Error('No wallet connected');
    
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'pause',
    });
    await publicClient.waitForTransactionReceipt({ hash });
  };

  const unpause = async (): Promise<void> => {
    if (!walletClient || !walletClient.account) throw new Error('No wallet connected');
    
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'unpause',
    });
    await publicClient.waitForTransactionReceipt({ hash });
  };

  const transferOwnership = async (newOwner: Address): Promise<void> => {
    if (!walletClient || !walletClient.account) throw new Error('No wallet connected');
    
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'transferOwnership',
      args: [newOwner],
    });
    await publicClient.waitForTransactionReceipt({ hash });
  };

  return {
    contract,
    isPaused,
    pause,
    unpause,
    transferOwnership,
  } as const;
};
