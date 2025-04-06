import {
  PublicClient,
  WalletClient,
  createWalletClient,
  custom,
  getContract,
  Address,
  isAddress,
  type GetContractReturnType,
} from "viem";
import { ChainId, EVMChainConfig } from "../types/Chain";
import { BaseProviderService } from "./BaseProviderService";
import { IBlockchainService, TokenInfo } from "./interfaces/IBlockchainService";

// ABI minimal pour ERC20
const ERC20_ABI = [
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

type ERC20AbiType = typeof ERC20_ABI;
type ERC20Contract = GetContractReturnType<ERC20AbiType>;

export abstract class EVMBaseService implements IBlockchainService {
  protected client!: PublicClient;
  protected walletClient: WalletClient | null = null;
  protected chainId: ChainId;
  protected chainConfig: EVMChainConfig;

  constructor(chainId: ChainId, config: EVMChainConfig) {
    this.chainId = chainId;
    this.chainConfig = config;
  }

  protected async initProvider() {
    this.client = (await BaseProviderService.getProvider(
      this.chainId
    )) as PublicClient;
  }

  protected async getWalletClient(): Promise<WalletClient> {
    if (!this.walletClient) {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("No ethereum provider found");
      }
      this.walletClient = createWalletClient({
        transport: custom(window.ethereum),
      });
    }
    return this.walletClient;
  }

  async getBalance(address: Address): Promise<bigint> {
    if (!this.client) await this.initProvider();
    return this.client.getBalance({ address });
  }

  abstract getNativeTokenPrice(): Promise<number>;

  abstract createToken(params: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    owner: Address;
  }): Promise<Address>;

  async getTokenInfo(tokenAddress: Address): Promise<TokenInfo> {
    if (!this.client) await this.initProvider();

    const [name, symbol, decimals, totalSupply] = (await Promise.all([
      this.client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "name",
      }),
      this.client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "symbol",
      }),
      this.client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "decimals",
      }),
      this.client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "totalSupply",
      }),
    ])) as [string, string, number, bigint];

    return {
      name,
      symbol,
      decimals,
      totalSupply,
      address: tokenAddress,
    };
  }

  abstract addLiquidity(params: {
    tokenAddress: Address;
    amount: bigint;
    deadline?: number;
  }): Promise<boolean>;

  abstract removeLiquidity(params: {
    tokenAddress: Address;
    amount: bigint;
    deadline?: number;
  }): Promise<boolean>;

  abstract stake(params: {
    tokenAddress: Address;
    amount: bigint;
    duration?: number;
  }): Promise<boolean>;

  abstract unstake(params: {
    tokenAddress: Address;
    amount: bigint;
  }): Promise<boolean>;

  validateAddress(address: string): boolean {
    return isAddress(address);
  }

  async estimateFees(params: {
    to: Address;
    value?: bigint;
    data?: `0x${string}`;
  }): Promise<bigint> {
    if (!this.client) await this.initProvider();
    return this.client.estimateGas({
      to: params.to,
      value: params.value,
      data: params.data,
    });
  }

  protected async getContract(address: Address): Promise<ERC20Contract> {
    if (!this.client) await this.initProvider();

    return getContract({
      address,
      abi: ERC20_ABI,
      client: this.client,
    });
  }
}
