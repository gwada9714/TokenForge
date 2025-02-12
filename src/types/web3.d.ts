import { Contract } from 'ethers';
import { PublicClient, WalletClient } from 'viem';

export interface Web3Contract extends Contract {
  address: `0x${string}`;
  abi: any[];
  getItemCount?: () => Promise<number>;
  getItem?: (id: string | number) => Promise<any>;
  listItem?: (tokenAddress: string, amount: string, price: string) => Promise<any>;
  allowance?: (owner: string, spender: string) => Promise<bigint>;
  getUserTokens?: (address: string) => Promise<string[]>;
}

export interface Web3Provider {
  publicClient: PublicClient;
  walletClient?: WalletClient;
}

declare module 'viem' {
  interface PublicClient {
    getContract: (address: string, abi: any[]) => Web3Contract;
  }
}

export type { PublicClient, WalletClient } from 'viem';
