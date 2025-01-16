import { useCallback } from 'react';
import { ethers, utils, BigNumber, Overrides } from 'ethers';
import { useWeb3Provider } from './useWeb3Provider';

// Interface minimale pour le contrat token
interface ITokenContract extends ethers.BaseContract {
  transfer(to: string, amount: BigNumber, overrides?: Overrides): Promise<ethers.ContractTransaction>;
  mint(to: string, amount: BigNumber, overrides?: Overrides): Promise<ethers.ContractTransaction>;
  burn(amount: BigNumber, overrides?: Overrides): Promise<ethers.ContractTransaction>;
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

    const parsedAmount = utils.parseUnits(amount, 18);

    // Configuration du gas pour Sepolia
    const overrides: Overrides = {
      gasPrice: utils.parseUnits("2", "gwei"),
      gasLimit: BigNumber.from(100000)
    };

    try {
      switch (type) {
        case 'transfer':
          if (!recipient) throw new Error('Destinataire requis');
          return await tokenContract.transfer(recipient, parsedAmount, overrides);
        case 'mint':
          return await tokenContract.mint(await signer.getAddress(), parsedAmount, overrides);
        case 'burn':
          return await tokenContract.burn(parsedAmount, overrides);
        default:
          throw new Error('Type de transaction non supporté');
      }
    } catch (error) {
      console.error('Erreur lors de la transaction:', error);
      throw error;
    }
  }, [signer]);

  return { executeTransaction };
};