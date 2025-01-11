import { Address, parseUnits, ContractFunctionExecutionError } from 'viem';
import { TokenInfo } from '../types/tokens';
import { getContract } from 'viem';
import { erc20ABI } from 'wagmi';

export interface TokenOperation {
  type: 'mint' | 'burn' | 'transfer';
  amount: string;
  to?: Address;
  from?: Address;
  timestamp: number;
  transactionHash: Address;
}

export const executeTokenOperation = async (
  token: TokenInfo,
  operation: 'mint' | 'burn' | 'transfer',
  amount: string,
  toAddress?: Address,
  publicClient?: any,
  walletClient?: any
): Promise<TokenOperation> => {
  if (!publicClient || !walletClient) {
    throw new Error('Wallet not connected');
  }

  const [account] = await walletClient.getAddresses();
  const parsedAmount = parseUnits(amount, token.decimals);

  let hash: Address;

  const contract = {
    abi: erc20ABI,
    address: token.address as Address,
    walletClient,
    account,
  };

  try {
    switch (operation) {
      case 'mint':
        if (!token.mintable) {
          throw new Error('Token is not mintable');
        }
        hash = await walletClient.writeContract({
          ...contract,
          functionName: 'mint',
          args: [account, parsedAmount],
        });
        break;

      case 'burn':
        if (!token.burnable) {
          throw new Error('Token is not burnable');
        }
        hash = await walletClient.writeContract({
          ...contract,
          functionName: 'burn',
          args: [parsedAmount],
        });
        break;

      case 'transfer':
        if (!toAddress) {
          throw new Error('Transfer address is required');
        }
        hash = await walletClient.writeContract({
          ...contract,
          functionName: 'transfer',
          args: [toAddress, parsedAmount],
        });
        break;

      default:
        throw new Error('Invalid operation');
    }

    // Attendre la confirmation de la transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      type: operation,
      amount,
      to: toAddress,
      from: account,
      timestamp: Math.floor(Date.now() / 1000),
      transactionHash: hash,
    };
  } catch (error) {
    if (error instanceof ContractFunctionExecutionError) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
    throw error;
  }
};

export const getTokenHistory = async (
  token: TokenInfo,
  publicClient: any
): Promise<TokenOperation[]> => {
  const transferFilter = await publicClient.createEventFilter({
    address: token.address as Address,
    event: erc20ABI.find(x => x.name === 'Transfer'),
    fromBlock: 'earliest',
  });

  const logs = await publicClient.getFilterLogs({ filter: transferFilter });

  return logs.map((log: any) => ({
    type: 'transfer',
    amount: log.args.value.toString(),
    from: log.args.from,
    to: log.args.to,
    timestamp: Number(log.blockTimestamp),
    transactionHash: log.transactionHash as Address,
  }));
};

export const getTokenBalance = async (
  token: TokenInfo,
  address: Address,
  publicClient: any
): Promise<string> => {
  const balance = await publicClient.readContract({
    address: token.address as Address,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  return balance.toString();
};
