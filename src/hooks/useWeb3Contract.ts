import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3Provider } from './useWeb3Provider';

// Interface minimale pour le contrat token
interface ITokenContract extends ethers.BaseContract {
  transfer(to: string, amount: bigint): Promise<ethers.ContractTransactionResponse>;
  mint(to: string, amount: bigint): Promise<ethers.ContractTransactionResponse>;
  burn(amount: bigint): Promise<ethers.ContractTransactionResponse>;
}

interface TransactionParams {
  type: 'transfer' | 'mint' | 'burn';
  tokenAddress: string;
  amount: string;
  recipient?: string;
}

const TOKEN_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount)',
  'function burn(uint256 amount)'
] as const;

export const useWeb3Contract = () => {
  const { signer } = useWeb3Provider();

  const executeTransaction = useCallback(async ({
    type,
    tokenAddress,
    amount,
    recipient
  }: TransactionParams) => {
    if (!signer) throw new Error('Wallet non connecté');

    const tokenContract = new ethers.Contract(
      tokenAddress,
      TOKEN_ABI,
      signer
    ) as unknown as ITokenContract;

    const parsedAmount = ethers.parseUnits(amount, 18);

    switch (type) {
      case 'transfer':
        if (!recipient) throw new Error('Destinataire requis');
        return await tokenContract.transfer(recipient, parsedAmount);
      case 'mint':
        return await tokenContract.mint(await signer.getAddress(), parsedAmount);
      case 'burn':
        return await tokenContract.burn(parsedAmount);
      default:
        throw new Error('Type de transaction non supporté');
    }
  }, [signer]);

  return { executeTransaction };
}; 