import { Address, Chain, encodeDeployData, PublicClient, WalletClient, Account } from 'viem';
import { TokenBaseConfig, TokenAdvancedConfig, TokenDeploymentStatus } from '../types/tokens';
import { parseUnits } from 'viem';
import { mainnet } from 'viem/chains';
import { CONTRACT_BYTECODE, customERC20ABI } from '../contracts/compiled';

// ABI pour notre contrat ERC20 personnalisé
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

    // Préparer les arguments du constructeur
    const constructorArgs = [
      baseConfig.name,
      baseConfig.symbol,
      baseConfig.decimals,
      parseUnits(String(baseConfig.initialSupply), baseConfig.decimals),
      advancedConfig.mintable,
      advancedConfig.burnable,
      advancedConfig.pausable,
      advancedConfig.permit,
      advancedConfig.votes,
    ] as const;

    // Déployer le contrat
    const hash = await walletClient.deployContract({
      abi: customERC20ABI,
      bytecode: CONTRACT_BYTECODE,
      args: constructorArgs,
      account: walletClient.account,
      chain: walletClient.chain ?? mainnet,
    });

    // Attendre la confirmation de la transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (!receipt.contractAddress) {
      throw new Error('Contract address not found in receipt');
    }

    return {
      status: 'success',
      contractAddress: receipt.contractAddress,
      transactionHash: hash,
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

export const estimateGas = async (
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig,
  walletClient: WalletClient,
  account: Address
): Promise<bigint> => {
  try {
    // Préparer les arguments du constructeur
    const constructorArgs = [
      baseConfig.name,
      baseConfig.symbol,
      baseConfig.decimals,
      parseUnits(String(baseConfig.initialSupply), baseConfig.decimals),
      advancedConfig.mintable,
      advancedConfig.burnable,
      advancedConfig.pausable,
      advancedConfig.permit,
      advancedConfig.votes,
    ] as const;

    // Estimer le gas en utilisant deployContract
    const estimate = await walletClient.estimateContractGas({
      account,
      abi: customERC20ABI,
      bytecode: CONTRACT_BYTECODE,
      args: constructorArgs,
      chain: walletClient.chain ?? mainnet,
    });

    return estimate;
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw error;
  }
};
