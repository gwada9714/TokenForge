import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transactionValidationService } from '../transactionValidation';
import { createPublicClient } from 'viem';
import { TokenForgeError } from '@/utils/errors';
import type { Transaction } from '@/types/transactions';

// Mock Viem
vi.mock('viem', () => ({
  createPublicClient: vi.fn(),
  http: vi.fn(),
  parseEther: vi.fn((value: string) => BigInt(value)),
  formatEther: vi.fn((value: bigint) => value.toString())
}));

describe('Transaction Validation Service', () => {
  let mockTransaction: Transaction;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock transaction
    mockTransaction = {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      value: '1.0',
      data: '0x',
      chainId: 1,
      nonce: 1,
      maxFeePerGas: '50',
      maxPriorityFeePerGas: '2'
    };

    // Setup Viem mock
    vi.mocked(createPublicClient).mockReturnValue({
      getBalance: vi.fn().mockResolvedValue(BigInt('2000000000000000000')), // 2 ETH
      getGasPrice: vi.fn().mockResolvedValue(BigInt('50000000000')), // 50 Gwei
      estimateGas: vi.fn().mockResolvedValue(BigInt('21000')),
      getBlock: vi.fn().mockResolvedValue({
        baseFeePerGas: BigInt('30000000000') // 30 Gwei
      })
    } as any);
  });

  describe('validateTransaction', () => {
    it('validates a valid transaction', async () => {
      const result = await transactionValidationService.validateTransaction(mockTransaction);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects insufficient balance', async () => {
      // Mock low balance
      vi.mocked(createPublicClient().getBalance).mockResolvedValueOnce(BigInt('100000000000000000')); // 0.1 ETH

      const result = await transactionValidationService.validateTransaction(mockTransaction);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Insufficient balance');
    });

    it('detects gas price too high', async () => {
      mockTransaction.maxFeePerGas = '1000'; // Extremely high gas price
      
      const result = await transactionValidationService.validateTransaction(mockTransaction);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Gas price exceeds maximum allowed');
    });

    it('validates gas estimation', async () => {
      // Mock high gas estimation
      vi.mocked(createPublicClient().estimateGas).mockResolvedValueOnce(BigInt('500000'));

      const result = await transactionValidationService.validateTransaction(mockTransaction);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Gas estimation exceeds limit');
    });

    it('validates chain ID', async () => {
      mockTransaction.chainId = 999; // Invalid chain

      const result = await transactionValidationService.validateTransaction(mockTransaction);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid chain ID');
    });
  });

  describe('validateGasPrice', () => {
    it('validates normal gas price', async () => {
      const result = await transactionValidationService.validateGasPrice(
        mockTransaction.maxFeePerGas,
        mockTransaction.maxPriorityFeePerGas
      );
      expect(result.isValid).toBe(true);
    });

    it('detects base fee too high', async () => {
      // Mock high base fee
      vi.mocked(createPublicClient().getBlock).mockResolvedValueOnce({
        baseFeePerGas: BigInt('1000000000000') // 1000 Gwei
      } as any);

      const result = await transactionValidationService.validateGasPrice(
        mockTransaction.maxFeePerGas,
        mockTransaction.maxPriorityFeePerGas
      );
      expect(result.isValid).toBe(false);
    });

    it('validates priority fee', async () => {
      mockTransaction.maxPriorityFeePerGas = '100'; // Very high priority fee

      const result = await transactionValidationService.validateGasPrice(
        mockTransaction.maxFeePerGas,
        mockTransaction.maxPriorityFeePerGas
      );
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateBalance', () => {
    it('validates sufficient balance', async () => {
      const result = await transactionValidationService.validateBalance(
        mockTransaction.from,
        mockTransaction.value
      );
      expect(result.isValid).toBe(true);
    });

    it('detects insufficient balance', async () => {
      mockTransaction.value = '10.0'; // More than available balance

      const result = await transactionValidationService.validateBalance(
        mockTransaction.from,
        mockTransaction.value
      );
      expect(result.isValid).toBe(false);
    });

    it('includes gas cost in balance check', async () => {
      mockTransaction.value = '1.9'; // Almost all available balance

      const result = await transactionValidationService.validateBalance(
        mockTransaction.from,
        mockTransaction.value
      );
      expect(result.isValid).toBe(false); // Should fail due to gas costs
    });
  });

  describe('validateContractInteraction', () => {
    it('validates simple transfer', async () => {
      const result = await transactionValidationService.validateContractInteraction(
        mockTransaction.to,
        mockTransaction.data
      );
      expect(result.isValid).toBe(true);
    });

    it('validates contract call', async () => {
      mockTransaction.data = '0x095ea7b3000000000000000000000000'; // Example contract interaction

      const result = await transactionValidationService.validateContractInteraction(
        mockTransaction.to,
        mockTransaction.data
      );
      expect(result.isValid).toBe(true);
    });

    it('detects blacklisted contracts', async () => {
      mockTransaction.to = '0x1234...'; // Blacklisted contract
      
      const result = await transactionValidationService.validateContractInteraction(
        mockTransaction.to,
        mockTransaction.data
      );
      expect(result.isValid).toBe(false);
    });

    it('validates contract code presence', async () => {
      // Mock contract code check
      vi.mocked(createPublicClient()).getCode = vi.fn().mockResolvedValueOnce('0x');

      const result = await transactionValidationService.validateContractInteraction(
        mockTransaction.to,
        mockTransaction.data
      );
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateNonce', () => {
    it('validates correct nonce', async () => {
      // Mock current nonce
      vi.mocked(createPublicClient()).getTransactionCount = vi.fn().mockResolvedValueOnce(1);

      const result = await transactionValidationService.validateNonce(
        mockTransaction.from,
        mockTransaction.nonce
      );
      expect(result.isValid).toBe(true);
    });

    it('detects incorrect nonce', async () => {
      // Mock current nonce
      vi.mocked(createPublicClient()).getTransactionCount = vi.fn().mockResolvedValueOnce(5);

      const result = await transactionValidationService.validateNonce(
        mockTransaction.from,
        mockTransaction.nonce
      );
      expect(result.isValid).toBe(false);
    });

    it('handles pending transactions', async () => {
      // Mock pending transactions
      vi.mocked(createPublicClient()).getTransactionCount = vi.fn()
        .mockResolvedValueOnce(1) // Latest
        .mockResolvedValueOnce(2); // Pending

      const result = await transactionValidationService.validateNonce(
        mockTransaction.from,
        2
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateTransactionLimit', () => {
    it('validates within transaction limit', () => {
      const result = transactionValidationService.validateTransactionLimit(
        mockTransaction.from
      );
      expect(result.isValid).toBe(true);
    });

    it('detects exceeded transaction limit', async () => {
      // Simulate multiple transactions
      for (let i = 0; i < 10; i++) {
        await transactionValidationService.validateTransaction(mockTransaction);
      }

      const result = transactionValidationService.validateTransactionLimit(
        mockTransaction.from
      );
      expect(result.isValid).toBe(false);
    });

    it('resets transaction count after window', async () => {
      // Simulate multiple transactions
      for (let i = 0; i < 5; i++) {
        await transactionValidationService.validateTransaction(mockTransaction);
      }

      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = transactionValidationService.validateTransactionLimit(
        mockTransaction.from
      );
      expect(result.isValid).toBe(true);
    });
  });
});
