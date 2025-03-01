import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Mock } from 'vitest';
import { PaymentStatus } from '../../../payment/types/PaymentSession';

export type MockFunction<T> = T & Mock;

export type MockedConnection = {
  [K in keyof Connection]?: Mock;
} & {
  rpcEndpoint: string;
  commitment: string;
  getLatestBlockhash: Mock;
  sendTransaction: Mock;
  confirmTransaction: Mock;
  getParsedAccountInfo?: Mock;
};

export interface MockKeypair extends Omit<Keypair, '_keypair' | 'secretKey'> {
  publicKey: PublicKey;
  signTransaction: Mock<[unknown], Promise<unknown>>;
  signAllTransactions: Mock<[unknown[]], Promise<unknown[]>>;
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
