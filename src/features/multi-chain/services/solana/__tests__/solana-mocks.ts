import { vi } from 'vitest';
import { Connection, PublicKey } from '@solana/web3.js';
import { PROGRAM_ID_STR } from './test-constants';
import { MockKeypair, MockedConnection } from './test-types';

// Création d'un mock de wallet qui implémente l'interface MockKeypair
export const mockWallet: MockKeypair = {
  publicKey: new PublicKey(PROGRAM_ID_STR),
  signTransaction: vi.fn(),
  signAllTransactions: vi.fn()
};

// Création d'un mock de connection typé
export function createMockConnection(): MockedConnection {
  const connection = {
    rpcEndpoint: 'mock-endpoint',
    commitment: 'confirmed',
    getBalanceAndContext: vi.fn(),
    getBlockTime: vi.fn(),
    getMinimumLedgerSlot: vi.fn(),
    getFirstAvailableBlock: vi.fn(),
    getSupply: vi.fn(),
    getParsedAccountInfo: vi.fn(),
    getAccountInfo: vi.fn(),
    getBalance: vi.fn(),
    getLatestBlockhash: vi.fn(),
    sendTransaction: vi.fn(),
    confirmTransaction: vi.fn(),
    // Ajout des autres méthodes de l'interface Connection
    ...Object.getOwnPropertyNames(Connection.prototype)
      .reduce((acc, method) => ({ ...acc, [method]: vi.fn() }), {})
  } as MockedConnection;

  return connection;
}

// Fonctions helpers pour les tests
export function mockSuccessfulTransaction(connection: MockedConnection) {
  connection.getLatestBlockhash.mockResolvedValue({
    blockhash: 'test-blockhash',
    lastValidBlockHeight: 1000
  });

  connection.sendTransaction.mockResolvedValue('test-signature');

  connection.confirmTransaction.mockResolvedValue({
    value: { err: null }
  });

  mockWallet.signTransaction.mockImplementation((tx) => Promise.resolve(tx));
  mockWallet.signAllTransactions.mockImplementation((txs) => Promise.resolve(txs));
}

export function mockTransactionError(connection: MockedConnection, errorMessage: string) {
  connection.getLatestBlockhash.mockResolvedValue({
    blockhash: 'test-blockhash',
    lastValidBlockHeight: 1000
  });

  connection.sendTransaction.mockRejectedValue(new Error(errorMessage));
}

export function mockNetworkError(connection: MockedConnection, errorMessage: string) {
  connection.getLatestBlockhash.mockRejectedValue(new Error(errorMessage));
}

export function mockTimeoutError(connection: MockedConnection) {
  connection.getLatestBlockhash.mockResolvedValue({
    blockhash: 'test-blockhash',
    lastValidBlockHeight: 1000
  });

  connection.sendTransaction.mockResolvedValue('test-signature');

  connection.confirmTransaction.mockResolvedValue({
    value: { err: 'Transaction timed out' }
  });
}
