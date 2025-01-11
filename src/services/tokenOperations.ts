import { Address, parseUnits } from 'viem';
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

  const contract = getContract({
    address: token.address as Address,
    abi: erc20ABI,
    publicClient,
    walletClient,
  });

  const decimals = token.decimals;
  const parsedAmount = parseUnits(amount, decimals);

  let hash: Address;
  const account = await walletClient.getAddresses();
  const from = account[0];

  switch (operation) {
    case 'mint':
      if (!token.mintable) {
        throw new Error('Token is not mintable');
      }
      hash = await contract.write.mint([from, parsedAmount]);
      break;

    case 'burn':
      if (!token.burnable) {
        throw new Error('Token is not burnable');
      }
      hash = await contract.write.burn([parsedAmount]);
      break;

    case 'transfer':
      if (!toAddress) {
        throw new Error('Transfer address is required');
      }
      hash = await contract.write.transfer([toAddress, parsedAmount]);
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
    from,
    timestamp: Math.floor(Date.now() / 1000),
    transactionHash: hash,
  };
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
  const contract = getContract({
    address: token.address as Address,
    abi: erc20ABI,
    publicClient,
  });

  const balance = await contract.read.balanceOf([address]);
  return balance.toString();
};
