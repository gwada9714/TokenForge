import { vi } from 'vitest';
import { PublicKey, Keypair } from '@solana/web3.js';
import { MockedConnection } from './test-types';

// Mock de wallet avec les bonnes signatures
export const mockWallet = {
  publicKey: new PublicKey('mock-wallet-pubkey'),
  sign: vi.fn().mockImplementation((transaction: any) => {
    return Promise.resolve(transaction);
  }),
  signTransaction: vi.fn().mockImplementation((transaction: any) => {
    return Promise.resolve(transaction);
  }),
  signAllTransactions: vi.fn().mockImplementation((transactions: any[]) => {
    return Promise.resolve(transactions);
  })
} as unknown as Keypair;

// Création d'une connexion mockée avec les bonnes valeurs par défaut
export const createMockConnection = (): MockedConnection => {
  const mock = {
    rpcEndpoint: 'mock-endpoint',
    commitment: 'confirmed',
    getLatestBlockhash: vi.fn(),
    sendTransaction: vi.fn(),
    confirmTransaction: vi.fn(),
    getParsedAccountInfo: vi.fn()
  } as MockedConnection;

  // Configuration par défaut
  mockSuccessfulTransaction(mock);
  return mock;
};

// Fonctions helpers pour les tests
export function mockSuccessfulTransaction(connection: MockedConnection) {
  // Reset tous les mocks
  connection.getLatestBlockhash.mockReset();
  connection.sendTransaction.mockReset();
  connection.confirmTransaction.mockReset();

  // Configuration pour un succès
  connection.getLatestBlockhash.mockResolvedValueOnce({
    blockhash: 'mock-blockhash',
    lastValidBlockHeight: 1234
  });
  connection.sendTransaction.mockResolvedValueOnce('test-signature');
  connection.confirmTransaction.mockResolvedValueOnce({
    value: { err: null }
  });
}

export function mockTransactionError(connection: MockedConnection) {
  // Reset tous les mocks
  connection.getLatestBlockhash.mockReset();
  connection.sendTransaction.mockReset();
  connection.confirmTransaction.mockReset();

  // Configuration pour une erreur de transaction
  vi.spyOn(connection, 'sendTransaction').mockImplementation(() => {
    throw new Error('Payment failed: Transaction failed');
  });
}

export function mockTimeoutError(connection: MockedConnection) {
  // Reset tous les mocks
  connection.getLatestBlockhash.mockReset();
  connection.sendTransaction.mockReset();
  connection.confirmTransaction.mockReset();

  // Configuration pour un timeout
  vi.spyOn(connection, 'sendTransaction').mockImplementation(() => {
    throw new Error('Payment failed: timeout');
  });
}

export function mockNetworkError(connection: MockedConnection) {
  // Reset tous les mocks
  connection.getLatestBlockhash.mockReset();
  connection.sendTransaction.mockReset();
  connection.confirmTransaction.mockReset();

  // Configuration pour une erreur réseau
  vi.spyOn(connection, 'getLatestBlockhash').mockImplementation(() => {
    throw new Error('Payment failed: Network error');
  });
}

export function mockValidationError(connection: MockedConnection) {
  // Reset tous les mocks
  connection.getLatestBlockhash.mockReset();
  connection.sendTransaction.mockReset();
  connection.confirmTransaction.mockReset();

  // Configuration pour une erreur de validation
  connection.getLatestBlockhash.mockResolvedValueOnce({
    blockhash: 'mock-blockhash',
    lastValidBlockHeight: 1234
  });
  vi.spyOn(connection, 'sendTransaction').mockImplementation(() => {
    throw new Error('Payment failed: Invalid blockhash');
  });
}

export function mockValidBlockhashThenError(connection: MockedConnection) {
  // Reset tous les mocks
  connection.getLatestBlockhash.mockReset();
  connection.sendTransaction.mockReset();
  connection.confirmTransaction.mockReset();

  // Configuration pour une erreur de validation après un blockhash valide
  connection.getLatestBlockhash.mockResolvedValueOnce({
    blockhash: 'mock-blockhash',
    lastValidBlockHeight: 1234
  });
  connection.getLatestBlockhash.mockRejectedValueOnce(
    new Error('Invalid blockhash')
  );
}
