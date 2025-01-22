import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Address } from 'viem';
import { PolygonPaymentService, PolygonPaymentConfig } from '../PolygonPaymentService';
import { PaymentSessionService } from '../../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus } from '../../payment/types/PaymentSession';
import { mockPublicClient, mockWalletClient, mockContractEvent } from '../../../../../test/mocks/viem';

describe('PolygonPaymentService', () => {
  let service: PolygonPaymentService;
  let sessionService: PaymentSessionService;

  const mockConfig: PolygonPaymentConfig = {
    contractAddress: '0x1234567890123456789012345678901234567890' as Address,
    receiverAddress: '0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A' as Address,
    publicClient: mockPublicClient,
    walletClient: mockWalletClient,
    maxFeePerGas: 500000000000n // 500 gwei max
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock responses
    mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
      switch (functionName) {
        case 'supportedTokens':
          return true;
        case 'getGasPrice':
          return 100000000000n; // 100 gwei
        default:
          return undefined;
      }
    });

    mockPublicClient.simulateContract.mockResolvedValue({
      request: {
        abi: [],
        address: mockConfig.contractAddress,
        args: [],
        functionName: 'mockFunction'
      }
    });

    // Initialize services
    sessionService = PaymentSessionService.getInstance();
    service = PolygonPaymentService.getInstance(mockConfig);
  });

  afterEach(() => {
    service.cleanup();
    sessionService.cleanup();
  });

  describe('payWithToken', () => {
    const tokenAddress = '0x2222222222222222222222222222222222222222' as Address;

    it('should process token payment successfully', async () => {
      const amount = 1000000000000000000n; // 1 token
      const serviceType = 'token_creation';
      const userId = 'user123';

      const sessionId = await service.payWithToken(
        tokenAddress,
        amount,
        serviceType,
        userId,
        {}
      );
      
      const session = sessionService.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.status).toBe(PaymentStatus.PROCESSING);
      expect(session?.token.network).toBe(PaymentNetwork.POLYGON);
      expect(session?.token.address).toBe(tokenAddress);
    });

    it('should handle payment failure', async () => {
      mockWalletClient.writeContract.mockRejectedValueOnce(new Error('Transaction failed'));

      await expect(
        service.payWithToken(
          tokenAddress,
          1000000000000000000n,
          'token_creation',
          'user123',
          {}
        )
      ).rejects.toThrow('Payment failed: Transaction failed');
    });
  });

  describe('payWithMatic', () => {
    it('should process MATIC payment successfully', async () => {
      const amount = 1000000000000000000n; // 1 MATIC
      const serviceType = 'token_creation';
      const userId = 'user123';

      const sessionId = await service.payWithMatic(
        amount,
        serviceType,
        userId,
        {}
      );
      
      const session = sessionService.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.status).toBe(PaymentStatus.PROCESSING);
      expect(session?.token.network).toBe(PaymentNetwork.POLYGON);
      expect(session?.token.symbol).toBe('MATIC');
    });

    it('should handle payment failure', async () => {
      mockWalletClient.writeContract.mockRejectedValueOnce(new Error('Transaction failed'));

      await expect(
        service.payWithMatic(
          1000000000000000000n,
          'token_creation',
          'user123',
          {}
        )
      ).rejects.toThrow('Payment failed: Transaction failed');
    });
  });

  describe('event handling', () => {
    it('should update session status on payment received', async () => {
      // Create a test session
      const session = sessionService.createSession(
        'user123',
        1000000000000000000n,
        {
          address: '0x0000000000000000000000000000000000000000' as Address,
          network: PaymentNetwork.POLYGON,
          symbol: 'MATIC',
          decimals: 18
        },
        'token_creation'
      );

      // Mock event watching
      mockPublicClient.watchContractEvent.mockImplementationOnce(({ onLogs }) => {
        onLogs([{
          ...mockContractEvent,
          args: [
            mockWalletClient.account,
            '0x0000000000000000000000000000000000000000',
            1000000000000000000n,
            'token_creation',
            session.id
          ]
        }]);
        return () => {};
      });

      // Setup event listeners
      await service['setupEventListeners']();

      // Verify session status was updated
      const updatedSession = sessionService.getSession(session.id);
      expect(updatedSession?.status).toBe(PaymentStatus.CONFIRMED);
    });
  });

  describe('isTokenSupported', () => {
    it('should return true for supported token', async () => {
      const result = await service.isTokenSupported('0x1234' as Address);
      expect(result).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      mockPublicClient.readContract.mockRejectedValueOnce(new Error('Contract error'));
      const result = await service.isTokenSupported('0x1234' as Address);
      expect(result).toBe(false);
    });
  });
});
