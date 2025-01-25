import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Mock } from 'vitest';
import { PaymentStatus } from '../../../payment/types/PaymentSession';

export type MockFunction<T extends (...args: any) => any> = T & Mock;

export type MockedConnection = {
  [K in keyof Connection]: Mock;
} & {
  rpcEndpoint: string;
  commitment: string;
};

export interface MockKeypair extends Omit<Keypair, '_keypair' | 'secretKey'> {
  publicKey: PublicKey;
  signTransaction: MockFunction<(transaction: any) => Promise<any>>;
  signAllTransactions: MockFunction<(transactions: any[]) => Promise<any[]>>;
}

export interface MockedSessionService {
  createSession: Mock<[{
    userId: string;
    amount: bigint;
    network: string;
    serviceType: string;
  }], Promise<{ id: string; status: PaymentStatus }>>;
  
  updateSessionStatus: Mock<[
    string,
    PaymentStatus,
    string?,
    string?
  ], Promise<void>>;
}
