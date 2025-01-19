import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract, type Address, type PublicClient, type WalletClient, type Transport, type Chain, type Account } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contract';

type ContractType = ReturnType<typeof getContract<
  typeof CONTRACT_ABI,
  PublicClient | WalletClient,
  Chain | undefined,
  Account | undefined,
  Transport
>>;

export const useTokenForgeContract = (): {
  contract: ContractType;
  isPaused: () => Promise<boolean>;
  pause: () => Promise<void>;
  unpause: () => Promise<void>;
  transferOwnership: (newOwner: Address) => Promise<void>;
} => {
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
    if (!walletClient) throw new Error('No wallet connected');
    const { request } = await contract.simulate.pause({
      account: walletClient.account
    });
    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
  };

  const unpause = async (): Promise<void> => {
    if (!walletClient) throw new Error('No wallet connected');
    const { request } = await contract.simulate.unpause({
      account: walletClient.account
    });
    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
  };

  const transferOwnership = async (newOwner: Address): Promise<void> => {
    if (!walletClient) throw new Error('No wallet connected');
    const { request } = await contract.simulate.transferOwnership({
      args: [newOwner],
      account: walletClient.account
    });
    const hash = await walletClient.writeContract(request);
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
