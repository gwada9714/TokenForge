import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PublicKey, Connection } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { PaymentStatus } from '../../payment/types/PaymentSession';
import { mockTransactionError, mockNetworkError, mockWallet, mockConnection, mockSuccessfulTransaction } from './solana-mocks';
import { PROGRAM_ID_STR, RECEIVER_STR } from './test-constants';
import { SolanaPaymentService, SolanaPaymentConfig } from '../SolanaPaymentService';

describe('SolanaPaymentService', () => {
  const context = {
    service: null as any,
    connection: mockConnection as unknown as Connection,
    config: {
      programId: new PublicKey(PROGRAM_ID_STR),
      connection: mockConnection as unknown as Connection,
      wallet: mockWallet as any,
      receiverAddress: new PublicKey(RECEIVER_STR)
    } as SolanaPaymentConfig,
    sessionService: {
      createSession: vi.fn().mockResolvedValue({
        id: 'test-session-id',
        status: PaymentStatus.PENDING
      }),
      updateSessionStatus: vi.fn().mockResolvedValue(true)
    }
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    context.sessionService.createSession.mockClear();
    context.sessionService.updateSessionStatus.mockClear();
    
    context.service = await SolanaPaymentService.getInstance(context.config);
  });

  describe('initialization', () => {
    it('should initialize provider successfully', async () => {
      expect(context.service).toBeDefined();
    });

    it('should throw error with invalid provider config', async () => {
      const invalidConfig = {
        ...context.config,
        connection: null
      };
      
      await expect(
        SolanaPaymentService.getInstance(invalidConfig as any)
      ).rejects.toThrow('Failed to initialize AnchorProvider');
    });
  });

  describe('payWithToken', () => {
    it('should process payment successfully', async () => {
      mockSuccessfulTransaction();
      
      const result = await context.service.payWithToken(
        new PublicKey(PROGRAM_ID_STR),
        new BN(1000000),
        'TEST_SERVICE',
        'test-user-id',
        {}
      );

      expect(result).toBeDefined();
      expect(context.sessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.CONFIRMED,
        expect.any(Object)
      );
    });

    it('should handle transaction errors', async () => {
      mockTransactionError();
      
      await expect(
        context.service.payWithToken(
          new PublicKey(PROGRAM_ID_STR),
          new BN(1000000),
          'TEST_SERVICE',
          'test-user-id',
          {}
        )
      ).rejects.toThrow('Payment failed: Transaction error');

      expect(context.sessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.FAILED,
        expect.any(Object)
      );
    });

    it('should handle network errors', async () => {
      mockNetworkError();
      
      await expect(
        context.service.payWithToken(
          new PublicKey(PROGRAM_ID_STR),
          new BN(1000000),
          'TEST_SERVICE',
          'test-user-id',
          {}
        )
      ).rejects.toThrow('Payment failed: Network error');

      expect(context.sessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.FAILED,
        expect.any(Object)
      );
    });

    it('should validate payment amount', async () => {
      await expect(
        context.service.payWithToken(
          new PublicKey(PROGRAM_ID_STR),
          new BN(0),
          'TEST_SERVICE',
          'test-user-id',
          {}
        )
      ).rejects.toThrow('Payment failed: Payment amount must be greater than 0');
    });

    it('should handle negative amounts', async () => {
      await expect(
        context.service.payWithToken(
          new PublicKey(PROGRAM_ID_STR),
          new BN(-1000000),
          'TEST_SERVICE',
          'test-user-id',
          {}
        )
      ).rejects.toThrow('Payment failed: Payment amount must be greater than 0');
    });

    it('should handle transaction timeout', async () => {
      // Mock a transaction that never confirms
      mockConnection.confirmTransaction.mockImplementation(() => new Promise(() => {}));
      
      await expect(
        context.service.payWithToken(
          new PublicKey(PROGRAM_ID_STR),
          new BN(1000000),
          'TEST_SERVICE',
          'test-user-id',
          { timeout: 1000 } // 1 second timeout
        )
      ).rejects.toThrow('Payment failed: Transaction timeout');

      expect(context.sessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.FAILED,
        expect.any(Object)
      );
    });
  });

  describe('transaction options', () => {
    it('should use custom commitment level', async () => {
      mockSuccessfulTransaction();
      
      await context.service.payWithToken(
        new PublicKey(PROGRAM_ID_STR),
        new BN(1000000),
        'TEST_SERVICE',
        'test-user-id',
        { commitment: 'finalized' }
      );

      expect(mockConnection.confirmTransaction).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ commitment: 'finalized' })
      );
    });

    it('should handle skipPreflight option', async () => {
      mockSuccessfulTransaction();
      
      await context.service.payWithToken(
        new PublicKey(PROGRAM_ID_STR),
        new BN(1000000),
        'TEST_SERVICE',
        'test-user-id',
        { skipPreflight: true }
      );

      expect(mockConnection.sendTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Array),
        expect.objectContaining({ skipPreflight: true })
      );
    });
  });
});
