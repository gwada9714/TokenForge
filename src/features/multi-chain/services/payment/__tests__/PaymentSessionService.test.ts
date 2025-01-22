import { BigNumber } from 'ethers';
import { PaymentSessionService } from '../PaymentSessionService';
import { PaymentNetwork, PaymentStatus, PaymentToken } from '../types/PaymentSession';

describe('PaymentSessionService', () => {
  let service: PaymentSessionService;
  const mockToken: PaymentToken = {
    symbol: 'USDT',
    address: '0x1234567890123456789012345678901234567890',
    decimals: 18,
    network: PaymentNetwork.ETHEREUM,
  };

  beforeEach(() => {
    service = PaymentSessionService.getInstance();
    jest.useFakeTimers();
  });

  afterEach(() => {
    service.cleanup();
    jest.useRealTimers();
  });

  describe('createSession', () => {
    it('should create a new payment session', () => {
      const userId = 'user123';
      const amount = BigNumber.from('1000000000000000000'); // 1 USDT
      const serviceType = 'token_creation';

      const session = service.createSession(userId, amount, mockToken, serviceType);

      expect(session).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.amount).toEqual(amount);
      expect(session.token).toEqual(mockToken);
      expect(session.status).toBe(PaymentStatus.PENDING);
      expect(session.retryCount).toBe(0);
      expect(session.serviceType).toBe(serviceType);
    });
  });

  describe('updateSessionStatus', () => {
    it('should update session status correctly', () => {
      const userId = 'user123';
      const amount = BigNumber.from('1000000000000000000');
      const session = service.createSession(userId, amount, mockToken, 'token_creation');

      const txHash = '0xabcdef1234567890';
      const updatedSession = service.updateSessionStatus(
        session.id,
        PaymentStatus.CONFIRMED,
        txHash
      );

      expect(updatedSession.status).toBe(PaymentStatus.CONFIRMED);
      expect(updatedSession.txHash).toBe(txHash);
      expect(updatedSession.updatedAt).toBeGreaterThan(session.createdAt);
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
        BigNumber.from('1000000000000000000'),
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
        BigNumber.from('1000000000000000000'),
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
        BigNumber.from('1000000000000000000'),
        mockToken,
        'token_creation'
      );

      // Fast-forward time by 10 seconds
      jest.advanceTimersByTime(10000);

      const timedOutSession = service.getSession(session.id);
      expect(timedOutSession?.status).toBe(PaymentStatus.TIMEOUT);
      expect(timedOutSession?.error).toBe('Payment timeout exceeded');
    });

    it('should not timeout confirmed payments', () => {
      const session = service.createSession(
        'user123',
        BigNumber.from('1000000000000000000'),
        mockToken,
        'token_creation'
      );

      // Confirm the payment
      service.updateSessionStatus(session.id, PaymentStatus.CONFIRMED, '0xtxhash');

      // Fast-forward time
      jest.advanceTimersByTime(10000);

      const confirmedSession = service.getSession(session.id);
      expect(confirmedSession?.status).toBe(PaymentStatus.CONFIRMED);
    });

    it('should reset timeout on retry', async () => {
      const session = service.createSession(
        'user123',
        BigNumber.from('1000000000000000000'),
        mockToken,
        'token_creation'
      );

      // Advance time by 5 seconds
      jest.advanceTimersByTime(5000);

      // Retry payment
      await service.retryPayment(session.id);

      // Advance time by 5 more seconds (should not timeout yet)
      jest.advanceTimersByTime(5000);

      const activeSession = service.getSession(session.id);
      expect(activeSession?.status).toBe(PaymentStatus.PENDING);

      // Advance time to trigger timeout
      jest.advanceTimersByTime(5000);

      const timedOutSession = service.getSession(session.id);
      expect(timedOutSession?.status).toBe(PaymentStatus.TIMEOUT);
    });
  });
});
