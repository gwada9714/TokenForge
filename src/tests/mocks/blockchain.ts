import { vi } from 'vitest';
import { parseEther } from 'viem';

/**
 * Mock pour le public client
 * Simule les méthodes du client public viem
 */
export const mockPublicClient = {
  getChainId: vi.fn().mockResolvedValue(1),
  getBalance: vi.fn().mockResolvedValue(parseEther('10')),
  getGasPrice: vi.fn().mockResolvedValue(2000000000n), // 2 gwei
  getBlockNumber: vi.fn().mockResolvedValue(12345678n),
  getTransaction: vi.fn().mockImplementation((params) => {
    if (params.hash === '0xvalidtransactionhash') {
      return Promise.resolve({
        hash: '0xvalidtransactionhash',
        blockNumber: 1234567n,
        confirmations: 10,
      });
    }
    return Promise.resolve(null);
  }),
  verifyMessage: vi.fn().mockResolvedValue(true),
  estimateGas: vi.fn().mockResolvedValue(21000n),
};

/**
 * Mock pour le wallet client
 * Simule les méthodes du client wallet viem
 */
export const mockWalletClient = {
  account: {
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  },
  getAddresses: vi.fn().mockResolvedValue(['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266']),
  deployContract: vi.fn().mockResolvedValue('0xcontractdeploymenthash'),
  sendTransaction: vi.fn().mockResolvedValue('0xtransactionhash'),
  writeContract: vi.fn().mockResolvedValue('0xcontractcallhash'),
};

/**
 * Configuration d'ensemble pour les tests unitaires
 * Retourne les mocks pour les clients public et wallet
 */
export const setupViemMocks = () => {
  return {
    publicClient: mockPublicClient,
    walletClient: mockWalletClient,
  };
};
