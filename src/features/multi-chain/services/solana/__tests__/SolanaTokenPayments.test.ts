import { Connection } from '@solana/web3.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SolanaPaymentService, SolanaPaymentConfig } from '../SolanaPaymentService';
import { TEST_VALUES } from './test-values';
import { PublicKey, Keypair } from '@solana/web3.js';
import { PaymentNetwork, PaymentStatus, PaymentToken, PaymentSession } from '../../payment/types/PaymentSession';
import { PaymentSessionService } from '../../payment/PaymentSessionService';

describe('SolanaPaymentService', () => {
  let service: SolanaPaymentService;
  let sessionService: PaymentSessionService;
  let config: SolanaPaymentConfig;
  let connection: Connection;

  const createTestToken = (): PaymentToken => ({
    address: TEST_VALUES.RECEIVER,
    network: PaymentNetwork.SOLANA,
    symbol: 'USDC',
    decimals: 6
  });

  const createTestSession = (overrides: Partial<PaymentSession> = {}): PaymentSession => ({
    id: 'test-session-id',
    userId: 'user-123',
    amount: BigInt(1000000),
    token: createTestToken(),
    serviceType: 'TEST_SERVICE',
    status: PaymentStatus.PENDING,
    network: PaymentNetwork.SOLANA,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
    retryCount: 0,
    txHash: undefined,
    error: undefined,
    ...overrides
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    const wallet = Keypair.generate();
    connection = new Connection('https://api.devnet.solana.com');
    
    config = {
      programId: TEST_VALUES.PROGRAM_ID,
      receiverAddress: TEST_VALUES.RECEIVER,
      connection,
      wallet
    };

    sessionService = PaymentSessionService.getInstance();
    service = SolanaPaymentService.getInstance(config);

    // Mock session service methods
    vi.spyOn(sessionService, 'createSession').mockImplementation(() => createTestSession());
    vi.spyOn(sessionService, 'updateSession').mockImplementation((sessionId: string, updates: Partial<PaymentSession>) => {
      const session = createTestSession({ id: sessionId, ...updates });
      return session;
    });
    vi.spyOn(sessionService, 'retryPayment').mockImplementation(() => Promise.resolve(true));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if ('instance' in SolanaPaymentService) {
      (SolanaPaymentService as any).instance = undefined;
    }
  });

  describe('payWithToken', () => {
    it('should create proper transaction with transfer instruction', async () => {
      const amount = BigInt(1000000);
      const sessionId = await service.payWithToken(
        TEST_VALUES.RECEIVER,
        amount,
        'TEST_SERVICE',
        'user-123',
        {
          skipPreflight: false,
          commitment: 'confirmed'
        }
      );

      expect(sessionId).toBeDefined();
      expect(sessionService.updateSession).toHaveBeenCalledWith(
        sessionId,
        {
          status: PaymentStatus.CONFIRMED,
          txHash: TEST_VALUES.MOCK_TX_SIG
        }
      );
    });

    it('should handle transaction atomicity', async () => {
      // Mock the confirmTransaction to return an error
      const mockConfirmTransaction = vi.spyOn(Connection.prototype, 'confirmTransaction');
      mockConfirmTransaction.mockResolvedValueOnce({
        context: { slot: 1 },
        value: { err: 'Transaction failed' }
      });

      const amount = BigInt(1000000);
      const sessionId = await service.payWithToken(
        TEST_VALUES.RECEIVER,
        amount,
        'TEST_SERVICE',
        'user-123',
        {
          skipPreflight: false,
          commitment: 'confirmed'
        }
      );

      expect(sessionId).toBeDefined();
      expect(mockConfirmTransaction).toHaveBeenCalledWith(TEST_VALUES.MOCK_TX_SIG, 'confirmed');
      expect(sessionService.updateSession).toHaveBeenCalledWith(
        sessionId,
        {
          status: PaymentStatus.FAILED,
          txHash: TEST_VALUES.MOCK_TX_SIG,
          error: 'Transaction failed'
        }
      );
    });

    it('should handle network errors', async () => {
      // Mock sendTransaction to throw an error
      const mockSendTransaction = vi.spyOn(Connection.prototype, 'sendTransaction');
      mockSendTransaction.mockRejectedValueOnce(new Error('Network error'));

      const amount = BigInt(1000000);
      const sessionId = await service.payWithToken(
        TEST_VALUES.RECEIVER,
        amount,
        'TEST_SERVICE',
        'user-123',
        {
          skipPreflight: false,
          commitment: 'confirmed'
        }
      );

      expect(sessionId).toBeDefined();
      expect(mockSendTransaction).toHaveBeenCalled();
      expect(sessionService.updateSession).toHaveBeenCalledWith(
        sessionId,
        {
          status: PaymentStatus.FAILED,
          error: 'Network error'
        }
      );
    });

    it('should validate payment amount', async () => {
      await expect(
        service.payWithToken(
          TEST_VALUES.RECEIVER,
          BigInt(0),
          'TEST_SERVICE',
          'user-123',
          {
            skipPreflight: false,
            commitment: 'confirmed'
          }
        )
      ).rejects.toThrow('Payment failed: Payment amount must be greater than 0');
    });

    it('should validate token address', async () => {
      await expect(
        service.payWithToken(
          new PublicKey('invalid'),
          BigInt(1000000),
          'TEST_SERVICE',
          'user-123',
          {
            skipPreflight: false,
            commitment: 'confirmed'
          }
        )
      ).rejects.toThrow('Payment failed: Invalid character');
    });
  });

  describe('isTokenSupported', () => {
    it('should return true for supported tokens', async () => {
      const result = await service.isTokenSupported(TEST_VALUES.RECEIVER);
      expect(result).toBe(true);
    });

    it('should return false for unsupported tokens', async () => {
      // Mock getParsedAccountInfo to return null
      const mockGetParsedAccountInfo = vi.spyOn(Connection.prototype, 'getParsedAccountInfo');
      mockGetParsedAccountInfo.mockResolvedValueOnce({
        context: { slot: 1 },
        value: null
      });

      const result = await service.isTokenSupported(TEST_VALUES.RECEIVER);
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      // Mock getParsedAccountInfo to throw an error
      const mockGetParsedAccountInfo = vi.spyOn(Connection.prototype, 'getParsedAccountInfo');
      mockGetParsedAccountInfo.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.isTokenSupported(TEST_VALUES.RECEIVER);
      expect(result).toBe(false);
    });
  });
});