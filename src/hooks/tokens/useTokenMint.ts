import { useCallback } from 'react';
import { Address, parseUnits } from 'viem';
import { useWalletClient } from 'wagmi';
import { tokenControlAbi } from '@/contracts/abis/tokenControl';
import { useTransactionHandler } from '../transactions';
import { TokenContract } from '@/providers/contract/ContractProvider';

export const useTokenMint = (token?: TokenContract) => {
  const { data: walletClient } = useWalletClient();
  const { handleTransaction } = useTransactionHandler();

  const mint = useCallback(async (to: Address, amount: string) => {
    if (!token || !walletClient) {
      throw new Error('Token and wallet are required');
    }

    const parsedAmount = parseUnits(amount, token.decimals);

    return handleTransaction(async () => {
      const hash = await walletClient.writeContract({
        address: token.address,
        abi: tokenControlAbi,
        functionName: 'mint',
        args: [to, parsedAmount],
      });

      return hash;
    });
  }, [token, walletClient, handleTransaction]);

  const burn = useCallback(async (from: Address, amount: string) => {
    if (!token || !walletClient) {
      throw new Error('Token and wallet are required');
    }

    const parsedAmount = parseUnits(amount, token.decimals);

    return handleTransaction(async () => {
      const hash = await walletClient.writeContract({
        address: token.address,
        abi: tokenControlAbi,
        functionName: 'burn',
        args: [from, parsedAmount],
      });

      return hash;
    });
  }, [token, walletClient, handleTransaction]);

  return {
    mint,
    burn,
  };
};

export default useTokenMint;
