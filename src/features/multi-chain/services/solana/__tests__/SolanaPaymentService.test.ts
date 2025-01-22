import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { SolanaPaymentService } from '../SolanaPaymentService';
import { PaymentStatus, PaymentSession, PaymentNetwork } from '../../payment/types/PaymentSession';
import { PaymentSessionService } from '../../payment/PaymentSessionService';

describe('SolanaPaymentService', () => {
  const mockEndpoint = 'https://api.mainnet-beta.solana.com';
  const mockConnection = new Connection(mockEndpoint);
  const mockWallet = Keypair.generate();
  
  const mockConfig = {
    programId: new PublicKey('TokenForgePay1111111111111111111111111111111111'),
    connection: mockConnection,
    wallet: mockWallet,
    receiverAddress: new PublicKey('22222222222222222222222222222222')
  };

  let service: SolanaPaymentService;
  let sessionService: PaymentSessionService;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionService = PaymentSessionService.getInstance();
    service = SolanaPaymentService.getInstance(mockConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (SolanaPaymentService as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('should create a new instance with config', () => {
      const instance = SolanaPaymentService.getInstance(mockConfig);
      expect(instance).toBeInstanceOf(SolanaPaymentService);
    });

    it('should throw error when getting instance without initialization', () => {
      (SolanaPaymentService as any).instance = undefined;
      expect(() => SolanaPaymentService.getInstance()).toThrow();
    });

    it('should return the same instance on multiple calls', () => {
      const instance1 = SolanaPaymentService.getInstance(mockConfig);
      const instance2 = SolanaPaymentService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('payWithToken', () => {
    const mockTokenAddress = new PublicKey('33333333333333333333333333333333');
    const mockAmount = new BN(100000000); // 100 USDC
    const mockServiceType = 'token_creation';
    const mockUserId = 'test-user';

    beforeEach(() => {
      vi.spyOn(mockConnection, 'getRecentBlockhash').mockResolvedValue({
        blockhash: 'mock-blockhash',
        feeCalculator: {
          lamportsPerSignature: 5000
        }
      });

      const mockSession: PaymentSession = {
        id: 'test-session-id',
        userId: mockUserId,
        amount: mockAmount,
        token: {
          address: mockTokenAddress.toBase58(),
          symbol: 'USDC',
          decimals: 6,
          network: PaymentNetwork.SOLANA
        },
        network: PaymentNetwork.SOLANA,
        serviceType: mockServiceType,
        status: PaymentStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        retryCount: 0
      };

      vi.spyOn(sessionService, 'createSession').mockReturnValue(mockSession);
      vi.spyOn(sessionService, 'updateSessionStatus').mockImplementation(
        () => mockSession
      );
    });

    it('should process payment with correct parameters', async () => {
      const sessionId = await service.payWithToken(
        mockTokenAddress,
        mockAmount,
        mockServiceType,
        mockUserId,
        {}
      );

      expect(sessionId).toBeDefined();
      expect(sessionService.createSession).toHaveBeenCalledWith(
        mockUserId,
        mockAmount,
        expect.objectContaining({
          address: mockTokenAddress.toBase58(),
          network: PaymentNetwork.SOLANA
        }),
        mockServiceType
      );
    });

    it('should handle payment errors correctly', async () => {
      vi.spyOn(sessionService, 'createSession').mockImplementation(() => {
        throw new Error('Session creation failed');
      });

      await expect(
        service.payWithToken(
          mockTokenAddress,
          mockAmount,
          mockServiceType,
          mockUserId,
          {}
        )
      ).rejects.toThrow('Session creation failed');
    });
  });
});
