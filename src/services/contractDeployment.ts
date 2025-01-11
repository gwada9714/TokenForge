import { TokenBaseConfig, TokenAdvancedConfig, DeploymentStatus } from '../types/tokens';
import { TokenType } from '../components/CreateTokenForm/TokenTypeSelector';
import { 
  WalletClient, 
  PublicClient, 
  Log,
  decodeEventLog,
  getEventSelector,
  Address,
  parseEther,
  encodeFunctionData,
  Abi,
} from 'viem';
import { TokenFactoryABI } from '../contracts/abi/TokenFactory';
import { TEST_WALLET_ADDRESS, TX_POLLING_INTERVAL, REQUIRED_CONFIRMATIONS } from '../config/constants';
import { getNetwork } from '../config/networks';

interface TokenDeploymentArgs {
  tokenType: string;
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  burnable: boolean;
  mintable: boolean;
  pausable: boolean;
  upgradeable: boolean;
  transparent: boolean;
  uups: boolean;
  permit: boolean;
  votes: boolean;
  accessControl: string;
  baseURI: string;
  asset: Address;
  maxSupply: bigint;
  depositLimit: bigint;
}

const initializeAbi = [{
  inputs: [
    { name: 'name', type: 'string' },
    { name: 'symbol', type: 'string' },
    { name: 'decimals', type: 'uint8' },
    { name: 'initialSupply', type: 'uint256' },
    { name: 'initialOwner', type: 'address' }
  ],
  name: 'initialize',
  type: 'function',
  stateMutability: 'nonpayable',
  outputs: []
}] as const;

const prepareDeploymentArgs = (
  tokenType: TokenType,
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig,
  owner: Address = TEST_WALLET_ADDRESS as Address
): TokenDeploymentArgs => {
  return {
    tokenType,
    name: baseConfig.name,
    symbol: baseConfig.symbol,
    decimals: baseConfig.decimals,
    initialSupply: parseEther(baseConfig.initialSupply || '0'),
    burnable: advancedConfig.burnable,
    mintable: advancedConfig.mintable,
    pausable: advancedConfig.pausable,
    upgradeable: advancedConfig.upgradeable,
    transparent: advancedConfig.transparent,
    uups: advancedConfig.uups,
    permit: advancedConfig.permit,
    votes: advancedConfig.votes,
    accessControl: advancedConfig.accessControl,
    baseURI: advancedConfig.baseURI || '',
    asset: (advancedConfig.asset || '0x0000000000000000000000000000000000000000') as Address,
    maxSupply: parseEther(advancedConfig.maxSupply || '0'),
    depositLimit: parseEther(advancedConfig.depositLimit || '0')
  };
};

export const deployToken = async (
  tokenType: TokenType,
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig,
  walletClient: WalletClient,
  chainId: number
): Promise<Address> => {
  try {
    const network = getNetwork(chainId);
    if (!network?.factoryAddress) {
      throw new Error('Token Factory not deployed on this network');
    }

    const owner = walletClient.account?.address || (TEST_WALLET_ADDRESS as Address);
    const args = prepareDeploymentArgs(tokenType, baseConfig, advancedConfig, owner);

    // Encode constructor arguments for proxy if needed
    let initData: Address = '0x' as Address;
    if (advancedConfig.upgradeable) {
      const initializeData = encodeFunctionData({
        abi: initializeAbi,
        functionName: 'initialize',
        args: [
          args.name,
          args.symbol,
          args.decimals,
          args.initialSupply,
          owner
        ]
      });
      
      initData = initializeData as Address;
    }

    const hash = await walletClient.writeContract({
      chain: walletClient.chain,
      address: network.factoryAddress,
      abi: TokenFactoryABI as Abi,
      functionName: 'deployToken',
      args: [args, initData],
      account: owner,
    });

    return hash;
  } catch (error) {
    console.error('Token deployment error:', error);
    throw error;
  }
};

interface DecodedLog {
  args: {
    tokenAddress: Address;
    proxyAddress?: Address;
  };
}

const decodeLog = (log: Log, publicClient: PublicClient): DecodedLog | null => {
  try {
    const eventFragment = TokenFactoryABI.find(x => x.type === 'event' && x.name === 'TokenCreated');
    if (!eventFragment) return null;

    const decoded = decodeEventLog({
      abi: [eventFragment],
      data: log.data,
      topics: log.topics
    });

    return {
      args: {
        tokenAddress: decoded.args.tokenAddress as Address,
        proxyAddress: decoded.args.proxyAddress as Address | undefined
      }
    };
  } catch {
    return null;
  }
};

export const getDeploymentStatus = async (
  txHash: Address,
  publicClient: PublicClient
): Promise<DeploymentStatus> => {
  try {
    const tx = await publicClient.getTransaction({ hash: txHash });
    if (!tx) {
      return {
        status: 'pending',
        confirmations: 0
      };
    }

    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    const latestBlock = await publicClient.getBlockNumber();
    const confirmations = receipt ? Number(latestBlock - receipt.blockNumber) : 0;
    const requiredConfirmations = REQUIRED_CONFIRMATIONS[publicClient.chain?.id as keyof typeof REQUIRED_CONFIRMATIONS] || 1;

    if (!receipt) {
      return {
        status: 'pending',
        confirmations
      };
    }

    if (receipt.status === 'reverted') {
      return {
        status: 'failed',
        confirmations,
        error: 'Transaction reverted'
      };
    }

    const eventFragment = TokenFactoryABI.find(x => x.type === 'event' && x.name === 'TokenCreated');
    if (!eventFragment) {
      return {
        status: 'failed',
        confirmations,
        error: 'Event signature not found'
      };
    }

    const logs = receipt.logs.filter(log => {
      return log.topics[0] === getEventSelector(eventFragment);
    });

    if (logs.length === 0) {
      return {
        status: 'failed',
        confirmations,
        error: 'No TokenCreated event found'
      };
    }

    const decodedLog = decodeLog(logs[0], publicClient);
    if (!decodedLog) {
      return {
        status: 'failed',
        confirmations,
        error: 'Failed to decode event log'
      };
    }

    return {
      status: confirmations >= requiredConfirmations ? 'success' : 'pending',
      confirmations,
      txHash,
      tokenAddress: decodedLog.args.tokenAddress,
      proxyAddress: decodedLog.args.proxyAddress
    };
  } catch (error) {
    return {
      status: 'failed',
      confirmations: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
