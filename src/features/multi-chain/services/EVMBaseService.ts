import { providers, Contract, utils, BigNumber, Signer } from 'ethers';
import { ChainId, EVMChainConfig } from '../types/Chain';
import { BaseProviderService } from './BaseProviderService';
import { IBlockchainService, TokenInfo } from './interfaces/IBlockchainService';
import { TransactionService } from './TransactionService';

// ABI minimal pour ERC20
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint amount) returns (bool)',
];

export abstract class EVMBaseService implements IBlockchainService {
  protected provider!: providers.JsonRpcProvider;
  protected chainId: ChainId;
  protected chainConfig: EVMChainConfig;
  protected signer: Signer | null = null;

  constructor(chainId: ChainId, config: EVMChainConfig) {
    this.chainId = chainId;
    this.chainConfig = config;
  }

  protected async initProvider() {
    const baseProvider = await BaseProviderService.getProvider(this.chainId);
    if (!('getBalance' in baseProvider) || !('getGasPrice' in baseProvider)) {
      throw new Error('Invalid provider type for EVM chain');
    }
    this.provider = baseProvider as providers.JsonRpcProvider;
  }

  protected async getSigner(): Promise<Signer> {
    if (!this.provider) await this.initProvider();
    if (!this.signer) {
      // Vérifier si window.ethereum est disponible
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new providers.Web3Provider((window as any).ethereum);
        this.signer = provider.getSigner();
      } else {
        throw new Error('No web3 provider available');
      }
    }
    return this.signer;
  }

  async getBalance(address: string): Promise<BigNumber> {
    if (!this.provider) await this.initProvider();
    return this.provider.getBalance(address);
  }

  abstract getNativeTokenPrice(): Promise<number>;

  abstract createToken(params: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    owner: string;
  }): Promise<string>;

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    if (!this.provider) await this.initProvider();
    
    const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);

    return {
      name,
      symbol,
      decimals,
      totalSupply,
      address: tokenAddress,
    };
  }

  abstract addLiquidity(params: {
    tokenAddress: string;
    amount: string;
    deadline?: number;
  }): Promise<boolean>;

  abstract removeLiquidity(params: {
    tokenAddress: string;
    amount: string;
    deadline?: number;
  }): Promise<boolean>;

  abstract stake(params: {
    tokenAddress: string;
    amount: string;
    duration?: number;
  }): Promise<boolean>;

  abstract unstake(params: {
    tokenAddress: string;
    amount: string;
  }): Promise<boolean>;

  validateAddress(address: string): boolean {
    return utils.isAddress(address);
  }

  async estimateFees(params: {
    to: string;
    value?: string;
    data?: string;
  }): Promise<BigNumber> {
    if (!this.provider) await this.initProvider();

    const gasEstimate = await TransactionService.estimateGas({
      chainId: this.chainId,
      to: params.to,
      value: params.value,
      data: params.data,
    });

    return BigNumber.from(gasEstimate);
  }

  protected getContract(address: string, abi: any): Contract {
    if (!this.provider) throw new Error('Provider not initialized');
    return new Contract(address, abi, this.provider);
  }

  protected async getSignedContract(address: string, abi: any): Promise<Contract> {
    const signer = await this.getSigner();
    return new Contract(address, abi, signer);
  }
}
