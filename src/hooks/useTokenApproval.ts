import { useContractWrite, useContractRead, useAccount } from 'wagmi';
import { TKNTokenABI } from '../contracts/abi/TKNToken';
import { parseEther, formatEther, Address } from 'viem';
import { toast } from 'react-hot-toast';

const TKN_ADDRESS = '0x6829C3fAdcD7a68f613b9d68a1ed873d5C2E745d' as const;

export const useTokenApproval = (spenderAddress: Address) => {
  const { address } = useAccount();

  // Lecture de l'allowance actuelle
  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: TKN_ADDRESS as Address,
    abi: TKNTokenABI,
    functionName: 'allowance',
    args: address ? [address as Address, spenderAddress] : undefined,
    enabled: !!address,
  });

  // Lecture du solde TKN
  const { data: balance, refetch: refetchBalance } = useContractRead({
    address: TKN_ADDRESS as Address,
    abi: TKNTokenABI,
    functionName: 'balanceOf',
    args: address ? [address as Address] : undefined,
    enabled: !!address,
  });

  // Approbation des tokens
  const { write: approve, isLoading: isApproving } = useContractWrite({
    address: TKN_ADDRESS as Address,
    abi: TKNTokenABI,
    functionName: 'approve',
    onSuccess: () => {
      toast.success('Approbation TKN réussie');
      refetchAllowance();
    },
    onError: (error: Error) => {
      toast.error('Erreur lors de l\'approbation TKN');
      console.error('Erreur d\'approbation:', error);
    },
  });

  const approveTokens = async (amount: string) => {
    try {
      const parsedAmount = parseEther(amount);
      await approve({ 
        args: [spenderAddress, parsedAmount] 
      });
    } catch (error: unknown) {
      console.error('Erreur lors de l\'approbation:', error);
      throw error;
    }
  };

  return {
    approveTokens,
    allowance: allowance ? formatEther(allowance as bigint) : '0',
    balance: balance ? formatEther(balance as bigint) : '0',
    isApproving,
    refetchAllowance,
    refetchBalance
  };
};
