import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PublicKey, AccountInfo, ParsedAccountData } from '@solana/web3.js';
import { SolanaPaymentService } from '../SolanaPaymentService';
import { mockWallet, createMockConnection } from './solana-mocks';
import { PROGRAM_ID_STR, RECEIVER_STR } from './test-constants';
import { PaymentSessionService } from '../../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus } from '../../payment/types/PaymentSession';
import { MockedConnection } from './test-types';

describe('SolanaTokenPayments', () => {
  let connection: MockedConnection;
  let service: SolanaPaymentService;
  let sessionService: PaymentSessionService;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Créer un mock de Connection avec les méthodes nécessaires
    connection = createMockConnection();

    const config = {
      programId: new PublicKey(PROGRAM_ID_STR),
      connection: connection as any, // Cast nécessaire car SolanaPaymentConfig attend un Keypair complet
      wallet: mockWallet as any, // Cast nécessaire car SolanaPaymentConfig attend un Keypair complet
      receiverAddress: new PublicKey(RECEIVER_STR)
    };
    
    sessionService = PaymentSessionService.getInstance();
    service = await SolanaPaymentService.getInstance(config);
    
    // Utiliser vi.spyOn pour accéder aux méthodes privées de manière sûre
    vi.spyOn(service as any, 'sessionService', 'get').mockReturnValue(sessionService);
  });

  describe('token validation', () => {
    it('should validate token mint address', async () => {
      connection.getParsedAccountInfo.mockResolvedValue({
        context: { slot: 1 },
        value: {
          executable: false,
          owner: new PublicKey(PROGRAM_ID_STR),
          lamports: 1000000,
          data: Buffer.from([])
        } as AccountInfo<Buffer | ParsedAccountData>
      });

      const result = await service.isTokenSupported(new PublicKey(RECEIVER_STR));
      expect(result).toBe(true);
    });

    it('should reject invalid token addresses', async () => {
      connection.getParsedAccountInfo.mockResolvedValue({
        context: { slot: 1 },
        value: null
      });
      const result = await service.isTokenSupported(new PublicKey(RECEIVER_STR));
      expect(result).toBe(false);
    });

    it('should handle token lookup errors', async () => {
      connection.getParsedAccountInfo.mockRejectedValue(new Error('Token lookup failed'));
      const result = await service.isTokenSupported(new PublicKey(RECEIVER_STR));
      expect(result).toBe(false);
    });
  });

  describe('payment processing', () => {
    const paymentAmount = BigInt(1000000);
    const serviceType = 'TOKEN_PAYMENT';
    const userId = 'test-user';

    beforeEach(() => {
      vi.spyOn(sessionService, 'createSession').mockResolvedValue({
        id: 'test-session',
        amount: paymentAmount,
        userId,
        serviceType,
        status: PaymentStatus.PENDING,
        network: PaymentNetwork.SOLANA,
        token: {
          address: new PublicKey(RECEIVER_STR),
          network: PaymentNetwork.SOLANA,
          symbol: 'SOL',
          decimals: 9
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(),
        retryCount: 0
      });
    });

    it('should process token payment successfully', async () => {
      connection.sendTransaction.mockResolvedValue('tx-hash');
      const result = await service.payWithToken(
        new PublicKey(RECEIVER_STR),
        paymentAmount,
        serviceType,
        userId,
        {}
      );

      expect(result).toBe('test-session');
      expect(sessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session',
        PaymentStatus.PENDING
      );
    });

    it('should handle network errors gracefully', async () => {
      connection.sendTransaction.mockRejectedValue(new Error('Network error'));
      
      await expect(
        service.payWithToken(
          new PublicKey(RECEIVER_STR),
          paymentAmount,
          serviceType,
          userId,
          {}
        )
      ).rejects.toThrow('Network error');

      expect(sessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session',
        PaymentStatus.FAILED
      );
    });

    it('should handle insufficient balance', async () => {
      connection.getBalance.mockResolvedValue(0);
      
      await expect(
        service.payWithToken(
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
      await service.payWithToken(
        new PublicKey(RECEIVER_STR),
        paymentAmount,
        serviceType,
        userId,
        { commitment: customCommitment }
      );

      expect(connection.confirmTransaction).toHaveBeenCalledWith(
        expect.anything(),
        { commitment: customCommitment }
      );
    });

    it('should handle payment failures', async () => {
      connection.sendTransaction.mockRejectedValue(new Error('Transaction failed'));
      
      await expect(
        service.payWithToken(
          new PublicKey(RECEIVER_STR),
          paymentAmount,
          serviceType,
          userId,
          {}
        )
      ).rejects.toThrow();

      expect(sessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session',
        PaymentStatus.FAILED,
        expect.any(String)
      );
    });

    it('should handle network errors during payment', async () => {
      connection.sendTransaction.mockRejectedValue(new Error('Network error'));
      
      await expect(
        service.payWithToken(
          new PublicKey(RECEIVER_STR),
          paymentAmount,
          serviceType,
          userId,
          {}
        )
      ).rejects.toThrow();

      expect(sessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session',
        PaymentStatus.FAILED,
        expect.any(String)
      );
    });
  });

  describe('payment validation', () => {
    const paymentAmount = BigInt(1000000);
    const serviceType = 'TOKEN_PAYMENT';
    const userId = 'test-user';

    beforeEach(() => {
      vi.spyOn(service, 'isTokenSupported').mockResolvedValue(true);
    });

    it('should reject zero amount payments', async () => {
      await expect(
        service.payWithToken(
          new PublicKey(PROGRAM_ID_STR),
          BigInt(0),
          serviceType,
          userId,
          {}
        )
      ).rejects.toThrow('Payment amount must be greater than 0');
    });

    it('should reject payments with invalid token', async () => {
      vi.spyOn(service, 'isTokenSupported').mockResolvedValue(false);
      await expect(
        service.payWithToken(
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