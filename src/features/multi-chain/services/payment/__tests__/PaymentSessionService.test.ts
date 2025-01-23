import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { PaymentSessionService } from '../PaymentSessionService';
import { PaymentNetwork, PaymentStatus, PaymentToken } from '../types/PaymentSession';
import { PaymentSyncService } from '../PaymentSyncService';

describe('PaymentSessionService', () => {
  let service: PaymentSessionService;
  let syncService: PaymentSyncService;
  
  const mockToken: PaymentToken = {
    symbol: 'USDT',
    address: '0x1234567890123456789012345678901234567890',
    decimals: 18,
    network: PaymentNetwork.ETHEREUM,
  };

  const ONE_ETH = BigInt('1000000000000000000'); // 1 ETH en wei

  beforeEach(() => {
    service = PaymentSessionService.getInstance();
    syncService = PaymentSyncService.getInstance(service);
    syncService.reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    service.cleanup();
    vi.useRealTimers();
  });

  describe('createSession', () => {
    it('should create a new payment session', () => {
      const userId = 'user123';
      const serviceType = 'token_creation';

      const session = service.createSession(userId, ONE_ETH, mockToken, serviceType);

      expect(session).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.amount).toBe(ONE_ETH);
      expect(session.token).toBe(mockToken);
      expect(session.status).toBe(PaymentStatus.PENDING);
      expect(session.retryCount).toBe(0);
      expect(session.serviceType).toBe(serviceType);
    });
  });

  describe('updateSessionStatus', () => {
    it('should update session status correctly', () => {
      const userId = 'user123';
      const amount = ONE_ETH;
      const session = service.createSession(userId, amount, mockToken, 'token_creation');

      // Avancer le temps d'une milliseconde pour s'assurer que updatedAt est plus récent
      vi.advanceTimersByTime(1);

      const txHash = '0xabcdef1234567890';
      const updatedSession = service.updateSessionStatus(
        session.id,
        PaymentStatus.CONFIRMED,
        txHash
      );

      expect(updatedSession.status).toBe(PaymentStatus.CONFIRMED);
      expect(updatedSession.txHash).toBe(txHash);
      expect(updatedSession.updatedAt.getTime()).toBeGreaterThan(session.createdAt.getTime());
    });

    it('should throw error for non-existent session', () => {
      expect(() => {
        service.updateSessionStatus('non-existent', PaymentStatus.CONFIRMED);
      }).toThrow('Session non-existent not found');
    });
  });

  describe('retryPayment', () => {
    it('should allow retry within limit', async () => {
      const session = service.createSession(
        'user123',
        ONE_ETH,
        mockToken,
        'token_creation'
      );

      const canRetry = await service.retryPayment(session.id);
      const updatedSession = service.getSession(session.id);

      expect(canRetry).toBe(true);
      expect(updatedSession?.retryCount).toBe(1);
      expect(updatedSession?.status).toBe(PaymentStatus.PENDING);
    });

    it('should fail after retry limit', async () => {
      const session = service.createSession(
        'user123',
        ONE_ETH,
        mockToken,
        'token_creation'
      );

      // Perform 3 retries
      await service.retryPayment(session.id);
      await service.retryPayment(session.id);
      await service.retryPayment(session.id);
      const canRetry = await service.retryPayment(session.id);
      const updatedSession = service.getSession(session.id);

      expect(canRetry).toBe(false);
      expect(updatedSession?.status).toBe(PaymentStatus.FAILED);
      expect(updatedSession?.error).toBe('Retry limit exceeded');
    });
  });

  describe('payment timeout', () => {
    it('should timeout pending payments after TIMEOUT_MS', () => {
      const session = service.createSession(
        'user123',
        ONE_ETH,
        mockToken,
        'token_creation'
      );

      // Fast-forward time by 10 seconds
      vi.advanceTimersByTime(10000);

      const timedOutSession = service.getSession(session.id);
      expect(timedOutSession?.status).toBe(PaymentStatus.TIMEOUT);
      expect(timedOutSession?.error).toBe('Payment timeout exceeded');
    });

    it('should not timeout confirmed payments', () => {
      const session = service.createSession(
        'user123',
        ONE_ETH,
        mockToken,
        'token_creation'
      );

      // Confirm the payment
      service.updateSessionStatus(session.id, PaymentStatus.CONFIRMED, '0xtxhash');

      // Fast-forward time
      vi.advanceTimersByTime(10000);

      const confirmedSession = service.getSession(session.id);
      expect(confirmedSession?.status).toBe(PaymentStatus.CONFIRMED);
    });

    it('should reset timeout on retry', async () => {
      const session = service.createSession(
        'user123',
        ONE_ETH,
        mockToken,
        'token_creation'
      );

      // Advance time by 5 seconds
      vi.advanceTimersByTime(5000);

      // Retry payment
      await service.retryPayment(session.id);

      // Advance time by 5 more seconds (should not timeout yet)
      vi.advanceTimersByTime(5000);

      const activeSession = service.getSession(session.id);
      expect(activeSession?.status).toBe(PaymentStatus.PENDING);

      // Advance time to trigger timeout
      vi.advanceTimersByTime(5000);

      const timedOutSession = service.getSession(session.id);
      expect(timedOutSession?.status).toBe(PaymentStatus.TIMEOUT);
    });
  });
});
