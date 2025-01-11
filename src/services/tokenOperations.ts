import {
  type PublicClient,
  type WalletClient,
  Address,
  parseUnits,
  ContractFunctionExecutionError,
  formatUnits,
} from "viem";
import {
  TokenInfo,
  TokenOperation,
  TokenHistory,
  TokenStatistics,
  TokenAllowance,
  TokenRole,
} from "../types/tokens";
import { getTokenContract } from "./contracts";

type TokenOperationFunction = "mint" | "burn" | "transfer";

export async function executeTokenOperation(
  token: TokenInfo,
  operation: TokenOperationFunction,
  amount: string,
  toAddress: Address | undefined,
  publicClient: PublicClient,
  walletClient: WalletClient,
): Promise<string> {
  if (!publicClient || !walletClient) {
    throw new Error("Wallet not connected");
  }

  const parsedAmount = parseUnits(amount, token.decimals);

  if (!token.address.startsWith("0x")) {
    throw new Error("Invalid token address");
  }

  const contract = getTokenContract(token.address as `0x${string}`);

  try {
    const { request } = await publicClient.simulateContract({
      ...contract,
      functionName: operation,
      args:
        operation === "transfer"
          ? [toAddress, parsedAmount]
          : operation === "mint"
            ? [toAddress, parsedAmount]
            : [parsedAmount],
      account: await walletClient
        .getAddresses()
        .then((addresses) => addresses[0]),
    });

    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
      return hash;
    } else {
      throw new Error(`${operation} operation failed`);
    }
  } catch (error) {
    if (error instanceof ContractFunctionExecutionError) {
      throw new Error(error.shortMessage || `${operation} operation failed`);
    }
    throw error;
  }
}

interface Transfer {
  from: Address;
  to: Address;
  value: string;
  timestamp: number;
  transactionHash: `0x${string}`;
}

export async function getTokenHistory(
  token: TokenInfo,
  publicClient: PublicClient,
): Promise<TokenHistory> {
  const filter = await publicClient.createEventFilter({
    address: token.address as Address,
    event: {
      type: "event",
      name: "Transfer",
      inputs: [
        { type: "address", name: "from", indexed: true },
        { type: "address", name: "to", indexed: true },
        { type: "uint256", name: "value" },
      ],
    },
  });

  const events = await publicClient.getFilterLogs({ filter });

  const transfers = events.map((event) => ({
    from: event.args.from as Address,
    to: event.args.to as Address,
    value: formatUnits(event.args.value as bigint, token.decimals),
    timestamp: Number(event.blockNumber),
    transactionHash: event.transactionHash as `0x${string}`,
  }));

  const operations = transfers.map((transfer) => ({
    type: "transfer" as const,
    amount: transfer.value,
    from: transfer.from,
    to: transfer.to,
    timestamp: transfer.timestamp,
    transactionHash: transfer.transactionHash,
    status: "confirmed" as const,
  }));

  // Calculer les statistiques
  const statistics: TokenStatistics = {
    totalTransfers: operations.length,
    totalMinted: "0",
    totalBurned: "0",
    uniqueHolders: new Set(operations.map((op) => op.to)).size,
    largestHolder: {
      address:
        operations[0]?.to ||
        ("0x0000000000000000000000000000000000000000" as Address),
      balance: "0",
      percentage: 0,
    },
  };

  // Récupérer les allowances
  const allowances: TokenAllowance[] = [];

  return {
    operations,
    statistics,
    allowances,
  };
}

export async function getTokenBalance(
  token: TokenInfo,
  address: Address,
  publicClient: PublicClient,
): Promise<string> {
  const result = await publicClient.readContract({
    ...getTokenContract(token.address as `0x${string}`),
    functionName: "balanceOf",
    args: [address],
  });

  return formatUnits(result as bigint, token.decimals);
}

export async function getTokenRoles(
  token: TokenInfo,
  publicClient: PublicClient,
): Promise<TokenRole[]> {
  const roles: TokenRole[] = [];

  // Vérifier les rôles spécifiques (admin, minter, etc.)
  const contract = getTokenContract(token.address as `0x${string}`);

  try {
    const isAdmin = await publicClient.readContract({
      ...contract,
      functionName: "hasRole",
      args: [
        "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        token.address as Address,
      ],
    });

    if (isAdmin) {
      roles.push({
        role: "owner",
        address: token.address as Address,
        grantedAt: Math.floor(Date.now() / 1000),
        grantedBy: token.address as Address,
      });
    }

    // Ajouter d'autres vérifications de rôles si nécessaire
  } catch (error) {
    console.error("Error checking roles:", error);
  }

  return roles;
}
