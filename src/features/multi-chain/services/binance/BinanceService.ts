import { EVMBaseService } from '../EVMBaseService';
import { type Address, type PublicClient, type WalletClient, createPublicClient, createWalletClient, http } from 'viem';
import { bsc } from 'viem/chains';
import { BEP20_ABI, PANCAKESWAP_ROUTER_ABI } from './abi';
import { PANCAKESWAP_ROUTER_ADDRESS } from './constants';

interface TokenParams {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: Address;
}

interface LiquidityParams {
  tokenAddress: Address;
  amount: bigint;
  deadline: number;
}

interface StakingParams {
  tokenAddress: Address;
  amount: bigint;
  duration?: number;
}

export class BinanceService extends EVMBaseService {
  protected client: PublicClient;
  protected walletClient: WalletClient | null = null;

  constructor() {
    super(bsc.id, {
      id: bsc.id,
      chainId: bsc.id,
      name: bsc.name,
      networkId: bsc.id,
      nativeCurrency: bsc.nativeCurrency,
      rpcUrls: [bsc.rpcUrls.default.http[0]],
      blockExplorerUrls: [bsc.blockExplorers.default.url],
    });
    this.client = createPublicClient({
      chain: bsc,
      transport: http(),
    });
  }

  async getNativeTokenPrice(): Promise<number> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
      const data = await response.json();
      return data.binancecoin.usd;
    } catch (error) {
      console.error('Failed to get BNB price:', error);
      return 0;
    }
  }

  async getBalance(address: Address): Promise<bigint> {
    try {
      const balance = await this.client.getBalance({ address });
      return balance;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  validateAddress(address: string): boolean {
    try {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    } catch (error) {
      return false;
    }
  }

  async createToken(params: TokenParams): Promise<Address> {
    try {
      if (!this.walletClient) {
        this.walletClient = createWalletClient({
          chain: bsc,
          transport: http(),
        });
      }

      if (!this.walletClient.account) {
        throw new Error('No wallet account found');
      }

      const deployRequest = {
        abi: BEP20_ABI,
        bytecode: '0x608060405234801561001057600080fd5b50610...' as `0x${string}`,
        account: this.walletClient.account,
        chain: bsc,
        args: [params.name, params.symbol, params.decimals, BigInt(params.totalSupply), params.owner]
      };

      const hash = await this.walletClient.deployContract(deployRequest);
      const receipt = await this.client.waitForTransactionReceipt({ hash });

      if (!receipt.contractAddress) {
        throw new Error('Contract address not found in receipt');
      }

      return receipt.contractAddress;
    } catch (error) {
      console.error('Failed to create BEP20 token:', error);
      throw new Error('Failed to create BEP20 token');
    }
  }

  async addLiquidity(params: LiquidityParams): Promise<boolean> {
    try {
      if (!this.walletClient) {
        this.walletClient = createWalletClient({
          chain: bsc,
          transport: http(),
        });
      }

      if (!this.walletClient.account) {
        throw new Error('No wallet account found');
      }

      const { request } = await this.client.simulateContract({
        account: this.walletClient.account,
        address: PANCAKESWAP_ROUTER_ADDRESS,
        abi: PANCAKESWAP_ROUTER_ABI,
        functionName: 'addLiquidityETH',
        args: [params.tokenAddress, params.amount, 0n, 0n, this.walletClient.account.address, BigInt(params.deadline)],
        value: params.amount,
      });

      const hash = await this.walletClient.writeContract(request);
      await this.client.waitForTransactionReceipt({ hash });

      return true;
    } catch (error) {
      console.error('Failed to add liquidity:', error);
      throw new Error('Failed to add liquidity on PancakeSwap');
    }
  }

  async removeLiquidity(params: LiquidityParams): Promise<boolean> {
    try {
      if (!this.walletClient) {
        this.walletClient = createWalletClient({
          chain: bsc,
          transport: http(),
        });
      }

      if (!this.walletClient.account) {
        throw new Error('No wallet account found');
      }

      const { request } = await this.client.simulateContract({
        account: this.walletClient.account,
        address: PANCAKESWAP_ROUTER_ADDRESS,
        abi: PANCAKESWAP_ROUTER_ABI,
        functionName: 'removeLiquidityETH',
        args: [params.tokenAddress, params.amount, 0n, 0n, this.walletClient.account.address, BigInt(params.deadline)],
      });

      const hash = await this.walletClient.writeContract(request);
      await this.client.waitForTransactionReceipt({ hash });

      return true;
    } catch (error) {
      console.error('Failed to remove liquidity:', error);
      throw new Error('Failed to remove liquidity from PancakeSwap');
    }
  }

  async stake(params: StakingParams): Promise<boolean> {
    console.warn('Staking not implemented for BSC yet:', params);
    throw new Error('Staking not implemented for BSC yet');
  }

  async unstake(params: StakingParams): Promise<boolean> {
    console.warn('Unstaking not implemented for BSC yet:', params);
    throw new Error('Unstaking not implemented for BSC yet');
  }
}
