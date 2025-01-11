import { Address, Chain, encodeDeployData, PublicClient, WalletClient } from 'viem';
import { TokenBaseConfig, TokenAdvancedConfig, TokenDeploymentStatus } from '../types/tokens';
import { erc20ABI } from 'wagmi';
import { parseUnits } from 'viem';

// ABI pour notre contrat ERC20 personnalisé
const customERC20ABI = [
  ...erc20ABI,
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
];

export const deployToken = async (
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig,
  walletClient: WalletClient,
  publicClient: PublicClient
): Promise<TokenDeploymentStatus> => {
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
    ];

    // Encoder les données de déploiement
    const bytecode = ''; // TODO: Ajouter le bytecode du contrat
    const deployData = encodeDeployData({
      abi: customERC20ABI,
      bytecode,
      args: constructorArgs,
    });

    // Déployer le contrat
    const hash = await walletClient.deployContract({
      abi: customERC20ABI,
      bytecode,
      args: constructorArgs,
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

export const estimateDeploymentGas = async (
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig,
  publicClient: PublicClient,
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
    ];

    // Encoder les données de déploiement
    const bytecode = ''; // TODO: Ajouter le bytecode du contrat
    const deployData = encodeDeployData({
      abi: customERC20ABI,
      bytecode,
      args: constructorArgs,
    });

    // Estimer le gas
    const gasEstimate = await publicClient.estimateContractDeploymentGas({
      abi: customERC20ABI,
      bytecode,
      args: constructorArgs,
      account,
    });

    return gasEstimate;
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw error;
  }
};
