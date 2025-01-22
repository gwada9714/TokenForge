import { Address } from 'viem';
import { PublicKey } from '@solana/web3.js';
import { PaymentNetwork } from './PaymentSession';

export type TokenType = 'NATIVE' | 'ERC20' | 'BEP20' | 'SPL';

export interface BaseTokenConfig {
  symbol: string;
  decimals: number;
  type: TokenType;
  name: string;
  logoURI?: string;
}

export interface EVMTokenConfig extends BaseTokenConfig {
  address: Address;
  type: 'NATIVE' | 'ERC20' | 'BEP20';
}

export interface SolanaTokenConfig extends BaseTokenConfig {
  address: PublicKey;
  type: 'NATIVE' | 'SPL';
}

export type TokenConfig = EVMTokenConfig | SolanaTokenConfig;

export interface NetworkTokensConfig {
  network: PaymentNetwork;
  chainId: number;
  nativeCurrency: BaseTokenConfig;
  tokens: TokenConfig[];
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

// Constantes pour les adresses des tokens communs
export const COMMON_TOKEN_ADDRESSES = {
  // Ethereum Mainnet
  ETH_USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7' as Address,
  ETH_USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as Address,
  ETH_DAI: '0x6b175474e89094c44da98b954eedeac495271d0f' as Address,
  
  // BSC Mainnet
  BSC_USDT: '0x55d398326f99059ff775485246999027b3197955' as Address,
  BSC_USDC: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d' as Address,
  BSC_BUSD: '0xe9e7cea3dedca5984780bafc599bd69add087d56' as Address,
  
  // Polygon Mainnet
  POLYGON_USDT: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' as Address,
  POLYGON_USDC: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' as Address,
  POLYGON_DAI: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063' as Address,
} as const;
