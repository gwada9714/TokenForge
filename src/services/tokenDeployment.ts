import { Client } from 'wagmi';
import { getTokenFactoryContract } from './contracts';
import { TokenBaseConfig, TokenAdvancedConfig, TokenDeploymentStatus } from '../types/tokens';

export async function deployToken(
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig,
  client: Client,
  publicClient: Client
): Promise<TokenDeploymentStatus> {
  try {
    const contract = getTokenFactoryContract(client);
    
    const { request } = await publicClient.simulateContract({
      ...contract,
      functionName: 'createToken',
      args: [
        baseConfig.name,
        baseConfig.symbol,
        baseConfig.decimals,
        baseConfig.totalSupply,
        advancedConfig.burnable,
        advancedConfig.mintable,
        advancedConfig.pausable
      ],
    });

    const hash = await client.writeContract(request);
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      return {
        status: 'success',
        hash: receipt.transactionHash,
      };
    } else {
      return {
        status: 'error',
        error: 'Transaction failed',
      };
    }
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message || 'Unknown error occurred',
    };
  }
}
