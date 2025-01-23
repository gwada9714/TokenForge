import { vi } from 'vitest';
import { PublicKey, Transaction, Connection, Commitment } from '@solana/web3.js';
import { PROGRAM_ID_STR } from './test-constants';

// Create a base Connection mock with required properties
const createConnectionMock = () => {
  const mock = {
    commitment: 'confirmed' as Commitment,
    rpcEndpoint: 'http://localhost:8899',
    getParsedAccountInfo: vi.fn(),
    confirmTransaction: vi.fn(),
    sendTransaction: vi.fn(),
    getLatestBlockhash: vi.fn().mockResolvedValue({
      blockhash: 'mock-blockhash',
      lastValidBlockHeight: 1000
    }),
    getBalance: vi.fn().mockResolvedValue(1000000),
    getBalanceAndContext: vi.fn().mockResolvedValue({
      context: { slot: 1 },
      value: 1000000
    }),
    // Add methods required by @project-serum/anchor
    getMinimumBalanceForRentExemption: vi.fn().mockResolvedValue(0),
    getAccountInfo: vi.fn().mockResolvedValue(null),
    getSlot: vi.fn().mockResolvedValue(1),
    getVersion: vi.fn().mockResolvedValue({ 'solana-core': '1.7.0' })
  };

  return mock;
};

// Create a mock wallet that implements the necessary interface
const createWalletMock = () => {
  const keypair = {
    publicKey: new PublicKey(PROGRAM_ID_STR),
    secretKey: new Uint8Array(64).fill(1)
  };

  return {
    publicKey: keypair.publicKey,
    secretKey: keypair.secretKey,
    signTransaction: vi.fn().mockImplementation(async (tx: Transaction) => tx),
    signAllTransactions: vi.fn().mockImplementation(async (txs: Transaction[]) => txs)
  };
};

export const mockWallet = createWalletMock();
export const mockConnection = createConnectionMock();

// Mock Successful Transaction
export const mockSuccessfulTransaction = () => {
  mockConnection.confirmTransaction.mockResolvedValue({
    value: { err: null }
  });
  mockConnection.sendTransaction.mockResolvedValue('mock-signature');
};

// Mock Transaction Error
export const mockTransactionError = () => {
  mockConnection.confirmTransaction.mockResolvedValue({
    value: { err: new Error('Transaction failed') }
  });
};

// Mock Network Error
export const mockNetworkError = () => {
  mockConnection.confirmTransaction.mockRejectedValue(new Error('Network error'));
  mockConnection.sendTransaction.mockRejectedValue(new Error('Network error'));
};

// Create a real Connection instance for testing
export const createSolanaConnectionMock = (endpoint: string = 'http://localhost:8899'): Connection => {
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 10000
  });
};

// Mock AnchorProvider
vi.mock('@project-serum/anchor', () => ({
  Program: vi.fn().mockImplementation(() => ({
    provider: {
      connection: mockConnection,
      wallet: mockWallet,
      sendAndConfirm: vi.fn().mockResolvedValue('mock-signature')
    },
    rpc: {
      processPayment: vi.fn().mockResolvedValue('mock-signature')
    }
  })),
  AnchorProvider: vi.fn().mockImplementation((connection, wallet, opts) => ({
    connection,
    wallet,
    opts,
    sendAndConfirm: vi.fn().mockResolvedValue('mock-signature')
  })),
  web3: {
    Connection,
    PublicKey,
    Transaction
  }
}));
