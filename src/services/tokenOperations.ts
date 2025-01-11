import { Address, parseUnits, ContractFunctionExecutionError, formatUnits } from 'viem';
import { TokenInfo, TokenOperation, TokenHistory, TokenStatistics, TokenAllowance, TokenRole } from '../types/tokens';
import { erc20ABI } from 'wagmi';

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

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      type: operation,
      amount,
      from: account,
      to: toAddress,
      timestamp: Math.floor(Date.now() / 1000),
      transactionHash: hash,
      status: receipt.status === 'success' ? 'confirmed' : 'failed',
      blockNumber: receipt.blockNumber,
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
): Promise<TokenHistory> => {
  // Récupérer les événements Transfer
  const transferFilter = await publicClient.createEventFilter({
    address: token.address as Address,
    event: erc20ABI.find(x => x.name === 'Transfer'),
    fromBlock: 'earliest',
  });

  const logs = await publicClient.getFilterLogs({ filter: transferFilter });

  // Convertir les logs en opérations
  const operations = logs.map((log: any) => ({
    type: 'transfer' as const,
    amount: formatUnits(log.args.value, token.decimals),
    from: log.args.from,
    to: log.args.to,
    timestamp: Number(log.blockTimestamp),
    transactionHash: log.transactionHash as Address,
    status: 'confirmed' as const,
    blockNumber: log.blockNumber,
  }));

  // Calculer les statistiques
  const statistics = await calculateTokenStatistics(token, operations, publicClient);

  // Récupérer les allowances
  const allowances = await getTokenAllowances(token, publicClient);

  return {
    operations,
    statistics,
    allowances,
  };
};

const calculateTokenStatistics = async (
  token: TokenInfo,
  operations: TokenOperation[],
  publicClient: any
): Promise<TokenStatistics> => {
  const holders = new Map<Address, bigint>();
  let totalMinted = BigInt(0);
  let totalBurned = BigInt(0);

  // Calculer les soldes
  for (const op of operations) {
    const amount = parseUnits(op.amount, token.decimals);
    
    if (op.type === 'mint') {
      totalMinted += amount;
      const balance = holders.get(op.to!) || BigInt(0);
      holders.set(op.to!, balance + amount);
    } else if (op.type === 'burn') {
      totalBurned += amount;
      const balance = holders.get(op.from) || BigInt(0);
      holders.set(op.from, balance - amount);
    } else if (op.type === 'transfer') {
      const fromBalance = holders.get(op.from) || BigInt(0);
      const toBalance = holders.get(op.to!) || BigInt(0);
      holders.set(op.from, fromBalance - amount);
      holders.set(op.to!, toBalance + amount);
    }
  }

  // Trouver le plus grand détenteur
  let largestHolder = {
    address: '0x0' as Address,
    balance: '0',
    percentage: 0,
  };

  const totalSupply = BigInt(token.totalSupply);
  
  // Utiliser Array.from pour itérer sur les entrées de la Map
  Array.from(holders.entries()).forEach(([address, balance]) => {
    if (balance > parseUnits(largestHolder.balance, token.decimals)) {
      largestHolder = {
        address,
        balance: formatUnits(balance, token.decimals),
        percentage: Number((balance * BigInt(100)) / totalSupply),
      };
    }
  });

  return {
    totalTransfers: operations.filter(op => op.type === 'transfer').length,
    totalMinted: formatUnits(totalMinted, token.decimals),
    totalBurned: formatUnits(totalBurned, token.decimals),
    uniqueHolders: holders.size,
    largestHolder,
  };
};

const getTokenAllowances = async (
  token: TokenInfo,
  publicClient: any
): Promise<TokenAllowance[]> => {
  const approvalFilter = await publicClient.createEventFilter({
    address: token.address as Address,
    event: erc20ABI.find(x => x.name === 'Approval'),
    fromBlock: 'earliest',
  });

  const logs = await publicClient.getFilterLogs({ filter: approvalFilter });

  return logs.map((log: any) => ({
    owner: log.args.owner,
    spender: log.args.spender,
    amount: formatUnits(log.args.value, token.decimals),
    lastUpdated: Number(log.blockTimestamp),
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

  return formatUnits(balance, token.decimals);
};

export const getTokenRoles = async (
  token: TokenInfo,
  publicClient: any
): Promise<TokenRole[]> => {
  const roles: TokenRole[] = [];

  try {
    // Récupérer le propriétaire si le contrat est Ownable
    const owner = await publicClient.readContract({
      address: token.address as Address,
      abi: erc20ABI,
      functionName: 'owner',
    });

    if (owner) {
      roles.push({
        role: 'owner',
        address: owner,
        grantedAt: 0, // Le timestamp exact n'est pas disponible
        grantedBy: '0x0' as Address, // L'adresse exacte n'est pas disponible
      });
    }
  } catch (error) {
    // Le contrat n'est peut-être pas Ownable
    console.log('Contract might not be Ownable');
  }

  return roles;
};
