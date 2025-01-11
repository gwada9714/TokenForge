import { Address, Chain, encodeDeployData, PublicClient, WalletClient, Account } from 'viem';
import { TokenBaseConfig, TokenAdvancedConfig, TokenDeploymentStatus } from '../types/tokens';
import { parseUnits } from 'viem';
import { mainnet } from 'viem/chains';
import { CONTRACT_BYTECODE, customERC20ABI } from '../contracts/compiled';

// ABI for our custom ERC20 contract
const localCustomERC20ABI = [
  ...customERC20ABI,
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'decimals', type: 'uint8' },
      { name: 'initialSupply', type: 'uint256' },
      { name: 'mintable', type: 'bool' },
      { name: 'burnable', type: 'bool' },
      { name: 'pausable', type: 'bool' },
      { name: 'permit', type: 'bool' },
      { name: 'votes', type: 'bool' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
] as const;

export const deployToken = async (
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig,
  walletClient: WalletClient,
  publicClient: PublicClient
): Promise<TokenDeploymentStatus> => {
  try {
    if (!walletClient.account) {
      throw new Error('No account connected');
    }

    const constructorArgs = [
      baseConfig.name,
      baseConfig.symbol,
      baseConfig.decimals,
      parseUnits(baseConfig.initialSupply.toString(), baseConfig.decimals),
      advancedConfig.mintable,
      advancedConfig.burnable,
      advancedConfig.pausable,
      advancedConfig.permit,
      advancedConfig.votes,
    ] as const;

    // Deploy the contract
    const hash = await walletClient.deployContract({
      abi: customERC20ABI,
      bytecode: CONTRACT_BYTECODE,
      args: constructorArgs,
      account: walletClient.account,
      chain: walletClient.chain ?? mainnet,
    });

    // Wait for deployment receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (!receipt.contractAddress) {
      throw new Error('Contract deployment failed: no contract address in receipt');
    }

    return {
      status: 'success',
      contractAddress: receipt.contractAddress,
      txHash: hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Token deployment failed:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
