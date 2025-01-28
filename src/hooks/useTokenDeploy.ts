import { useState } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { CUSTOM_ERC20_ABI } from '../contracts/CustomERC20';
import { bytecode } from '../contracts/bytecode';

interface TokenDeployParams {
  name: string;
  symbol: string;
  initialSupply: string;
  decimals: number;
  isMintable: boolean;
  isBurnable: boolean;
}

export function useTokenDeploy() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const deployToken = async ({ name, symbol, initialSupply, decimals, isMintable, isBurnable }: TokenDeployParams) => {
    try {
      setIsDeploying(true);
      setError(null);
      
      if (!walletClient) {
        throw new Error('Wallet not connected');
      }

      const hash = await walletClient.deployContract({
        abi: CUSTOM_ERC20_ABI,
        bytecode: bytecode as `0x${string}`,
        args: [name, symbol, parseEther(initialSupply), decimals, isMintable, isBurnable],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setIsSuccess(true);
      return receipt;
    } catch (err) {
      const error = err as Error;
      console.error('Error deploying token:', error);
      setError(error);
      throw error;
    } finally {
      setIsDeploying(false);
    }
  };

  return {
    deployToken,
    isDeploying,
    isSuccess,
    error
  };
}
