import {
  TokenBaseConfig,
  TokenAdvancedConfig,
  TokenDeploymentStatus,
} from "../types/tokens";
import { TokenType } from "../components/CreateTokenForm/TokenTypeSelector";
import {
  WalletClient,
  PublicClient,
  Log,
  decodeEventLog,
  Address,
  parseEther,
  encodeFunctionData,
  Abi,
} from "viem";
import { TokenFactoryABI } from "../contracts/abi/TokenFactory";
import {
  TEST_WALLET_ADDRESS,
  ZERO_ADDRESS,
} from "../config/constants";
import { getNetwork } from "../config/networks";

interface TokenDeploymentArgs {
  tokenType: `0x${string}`;
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
  accessControl: `0x${string}`;
  baseURI: `0x${string}`;
  asset: `0x${string}`;
  maxSupply: bigint;
  depositLimit: bigint;
}

const initializeAbi = [
  {
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "decimals", type: "uint8" },
      { name: "initialSupply", type: "uint256" },
      { name: "initialOwner", type: "address" },
    ],
    name: "initialize",
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
  },
] as const;

const stringToHex = (str: string): `0x${string}` => {
  if (!str) return "0x" as const as `0x${string}`;
  const bytes = new TextEncoder().encode(str);
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex as `0x${string}`;
};

const prepareDeploymentArgs = (
  tokenType: TokenType,
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig,
): TokenDeploymentArgs => {
  return {
    tokenType: stringToHex(tokenType),
    name: baseConfig.name,
    symbol: baseConfig.symbol,
    decimals: baseConfig.decimals,
    initialSupply: parseEther(baseConfig.initialSupply.toString()),
    burnable: advancedConfig.burnable,
    mintable: advancedConfig.mintable,
    pausable: advancedConfig.pausable,
    upgradeable: advancedConfig.upgradeable,
    transparent: advancedConfig.transparent,
    uups: advancedConfig.uups,
    permit: advancedConfig.permit,
    votes: advancedConfig.votes,
    accessControl: advancedConfig.accessControl
      ? ("0x01" as `0x${string}`)
      : ("0x00" as `0x${string}`),
    baseURI: stringToHex(advancedConfig.baseURI),
    asset: (advancedConfig.asset || ZERO_ADDRESS) as `0x${string}`,
    maxSupply: advancedConfig.maxSupply
      ? parseEther(advancedConfig.maxSupply)
      : BigInt(0),
    depositLimit: advancedConfig.depositLimit
      ? parseEther(advancedConfig.depositLimit)
      : BigInt(0),
  };
};

export const deployToken = async (
  tokenType: TokenType,
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig,
  walletClient: WalletClient,
  chainId: number,
  publicClient: PublicClient,
): Promise<Address> => {
  try {
    const network = getNetwork(chainId);
    if (!network?.factoryAddress) {
      throw new Error("Token Factory not deployed on this network");
    }

    const owner =
      walletClient.account?.address || (TEST_WALLET_ADDRESS as Address);
    const args = prepareDeploymentArgs(
      tokenType,
      baseConfig,
      advancedConfig,
    );

    // Encode constructor arguments for proxy if needed
    let initData: Address = "0x" as Address;
    if (advancedConfig.upgradeable) {
      const initializeData = encodeFunctionData({
        abi: initializeAbi,
        functionName: "initialize",
        args: [
          args.name,
          args.symbol,
          args.decimals,
          args.initialSupply,
          owner,
        ],
      });

      initData = initializeData as Address;
    }

    // Estimate gas using public client
    const gasEstimate = await publicClient.estimateContractGas({
      address: network.factoryAddress,
      abi: TokenFactoryABI as Abi,
      functionName: "deployToken",
      args: [args, initData],
      account: owner,
    });

    const hash = await walletClient.writeContract({
      chain: walletClient.chain,
      address: network.factoryAddress,
      abi: TokenFactoryABI as Abi,
      functionName: "deployToken",
      args: [args, initData],
      account: owner,
      gas: gasEstimate,
    });

    return hash;
  } catch (error) {
    console.error("Token deployment error:", error);
    throw error;
  }
};

interface DecodedLog {
  args: {
    tokenAddress: Address;
    proxyAddress?: Address;
  };
}

const decodeLog = (log: Log): DecodedLog | null => {
  try {
    const eventFragment = TokenFactoryABI.find(
      (x) => x.type === "event" && x.name === "TokenCreated",
    );
    if (!eventFragment) return null;

    const decoded = decodeEventLog({
      abi: [eventFragment],
      data: log.data,
      topics: log.topics,
    });

    return {
      args: {
        tokenAddress: decoded.args.tokenAddress as Address,
        proxyAddress: decoded.args.proxyAddress as Address | undefined,
      },
    };
  } catch {
    return null;
  }
};

export const getDeploymentStatus = async (
  txHash: Address,
  publicClient: PublicClient,
): Promise<TokenDeploymentStatus> => {
  try {
    const tx = await publicClient.getTransaction({ hash: txHash });
    if (!tx) {
      return {
        status: "error",
        error: "Transaction not found",
        txHash,
      };
    }

    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    if (!receipt) {
      return {
        status: "pending",
        txHash,
      };
    }

    if (receipt.status === "reverted") {
      return {
        status: "failed",
        txHash,
        error: "Transaction reverted",
      };
    }

    const logs = receipt.logs;
    const decodedLog = decodeLog(logs[logs.length - 1]);
    if (!decodedLog) {
      return {
        status: "failed",
        txHash,
        error: "Failed to decode deployment logs",
      };
    }

    const latestBlock = await publicClient.getBlockNumber();
    const confirmations = Number(latestBlock - receipt.blockNumber);

    return {
      status: "success",
      txHash,
      tokenAddress: decodedLog.args.tokenAddress,
      proxyAddress: decodedLog.args.proxyAddress,
      blockNumber: receipt.blockNumber,
      confirmations,
    };
  } catch (error) {
    return {
      status: "error",
      txHash,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
