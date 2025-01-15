import { useContractWrite, useContractEvent } from 'wagmi';
import { parseEther } from 'viem';
import { erc20ABI } from 'wagmi';
import { toast } from 'react-hot-toast';

interface UseTokenTransferProps {
  tokenAddress: string;
}

export function useTokenTransfer({ tokenAddress }: UseTokenTransferProps) {
  const { write: writeContract, isLoading, isError, error } = useContractWrite({
    address: tokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: 'transfer',
  });

  // Watch for transfer events
  useContractEvent({
    address: tokenAddress as `0x${string}`,
    abi: erc20ABI,
    eventName: 'Transfer',
    listener() {
      toast.success('Transfer successful!');
    },
  });

  const sendTokens = async (to: string, amount: string) => {
    try {
      if (!writeContract) {
        throw new Error('Transfer function not ready');
      }

      await writeContract({
        args: [to as `0x${string}`, parseEther(amount)],
      });

    } catch (error) {
      console.error('Error during transfer:', error);
      toast.error('Transfer failed');
      throw error;
    }
  };

  return {
    sendTokens,
    isLoading,
    isError,
    error,
  };
}
