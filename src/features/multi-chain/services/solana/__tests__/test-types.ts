import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Mock } from 'vitest';

export type MockFunction<T extends (...args: any) => any> = T & Mock;

export type MockedConnection = {
  [K in keyof Connection]: Connection[K] extends (...args: any) => any
    ? MockFunction<Connection[K]>
    : Connection[K];
};

export interface MockKeypair extends Omit<Keypair, '_keypair' | 'secretKey'> {
  publicKey: PublicKey;
  signTransaction: MockFunction<(transaction: any) => Promise<any>>;
  signAllTransactions: MockFunction<(transactions: any[]) => Promise<any[]>>;
}
