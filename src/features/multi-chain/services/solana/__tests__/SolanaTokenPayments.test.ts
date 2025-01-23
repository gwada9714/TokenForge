import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { PaymentStatus } from '../../payment/types/PaymentSession';
import { mockTransactionError, mockNetworkError } from './solana-mocks';
import { PROGRAM_ID_STR, RECEIVER_STR } from './test-constants';
import { TestContext, setupTestContext, mockSessionService } from './test-helpers';

describe('SolanaTokenPayments', () => {
  let context: TestContext;

  beforeEach(() => {
    vi.clearAllMocks();
    context = setupTestContext();
    mockSessionService(context.sessionService);
  });

  describe('token validation', () => {
    it('should validate token mint address', async () => {
      const result = await context.service.isTokenSupported(new PublicKey(RECEIVER_STR));
      expect(result).toBe(true);
    });

    it('should reject invalid token addresses', async () => {
      const result = await context.service.isTokenSupported(new PublicKey(PROGRAM_ID_STR));
      expect(result).toBe(false);
    });

    it('should handle token lookup errors', async () => {
      vi.spyOn(context.connection, 'getParsedAccountInfo').mockRejectedValue(new Error('Token lookup failed'));
      const result = await context.service.isTokenSupported(new PublicKey(RECEIVER_STR));
      expect(result).toBe(false);
    });
  });

  describe('payment processing', () => {
    const paymentAmount = BigInt(1000000);
    const serviceType = 'TOKEN_PAYMENT';
    const userId = 'test-user';

    it('should process token payment successfully', async () => {
      const result = await context.service.payWithToken(
        new PublicKey(RECEIVER_STR),
        paymentAmount,
        serviceType,
        userId,
        {}
      );

      expect(result).toBe('test-session-id');
      expect(context.sessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.PENDING
      );
    });

    it('should handle network errors gracefully', async () => {
      mockNetworkError();
      
      await expect(
        context.service.payWithToken(
          new PublicKey(RECEIVER_STR),
          paymentAmount,
          serviceType,
          userId,
          {}
        )
      ).rejects.toThrow('Network error');

      expect(context.sessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.FAILED
      );
    });

    it('should handle insufficient balance', async () => {
      vi.spyOn(context.connection, 'getBalance').mockResolvedValue(0);
      
      await expect(
        context.service.payWithToken(
          new PublicKey(RECEIVER_STR),
          paymentAmount,
          serviceType,
          userId,
          {}
        )
      ).rejects.toThrow('Insufficient balance');
    });

    it('should respect custom commitment levels', async () => {
      const customCommitment = 'finalized';
      await context.service.payWithToken(
        new PublicKey(RECEIVER_STR),
        paymentAmount,
        serviceType,
        userId,
        { commitment: customCommitment }
      );

      expect(context.connection.confirmTransaction).toHaveBeenCalledWith(
        expect.anything(),
        { commitment: customCommitment }
      );
    });

    it('should handle payment failures', async () => {
      mockTransactionError();

      await expect(
        context.service.payWithToken(
          new PublicKey(RECEIVER_STR),
          paymentAmount,
          serviceType,
          userId,
          {}
        )
      ).rejects.toThrow();

      expect(context.sessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.FAILED,
        expect.any(String)
      );
    });

    it('should handle network errors during payment', async () => {
      mockNetworkError();

      await expect(
        context.service.payWithToken(
          new PublicKey(RECEIVER_STR),
          paymentAmount,
          serviceType,
          userId,
          {}
        )
      ).rejects.toThrow();

      expect(context.sessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.FAILED,
        expect.any(String)
      );
    });
  });

  describe('payment validation', () => {
    const paymentAmount = BigInt(1000000);
    const serviceType = 'TOKEN_PAYMENT';
    const userId = 'test-user';

    it('should reject zero amount payments', async () => {
      await expect(
        context.service.payWithToken(
          new PublicKey(PROGRAM_ID_STR),
          BigInt(0),
          serviceType,
          userId,
          {}
        )
      ).rejects.toThrow('Payment amount must be greater than 0');
    });

    it('should reject payments with invalid token', async () => {
      vi.spyOn(context.service, 'isTokenSupported').mockResolvedValue(false);
      await expect(
        context.service.payWithToken(
          new PublicKey(PROGRAM_ID_STR),
          paymentAmount,
          serviceType,
          userId,
          {}
        )
      ).rejects.toThrow('Payment failed: Invalid token');
    });
  });
});