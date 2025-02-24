import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import { TokenInfo } from '../../../../types/tokens';
import { useTokenForgeConfig } from '../../../../hooks/useTokenForgeConfig';
import tokenABI from '../../../../contracts/abis/TokenForge.json';

interface TokenContract {
  getTokenData: (tokenId: string) => Promise<TokenInfo>;
  // Ajoutez d'autres méthodes du contrat selon les besoins
}

export const useTokenContract = () => {
  const { contractAddress } = useTokenForgeConfig();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const contract = getContract({
    address: contractAddress,
    abi: tokenABI.abi,
    publicClient,
    walletClient: walletClient || undefined,
  });

  return contract as unknown as TokenContract;
};
