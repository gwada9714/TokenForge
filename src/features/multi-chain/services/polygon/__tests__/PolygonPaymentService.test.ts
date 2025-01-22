import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { createPublicClient, createWalletClient, http, Address } from 'viem';
import { polygon } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { PolygonPaymentService } from '../PolygonPaymentService';
import { PaymentStatus } from '../../payment/types/PaymentSession';
import { PaymentSessionService } from '../../payment/PaymentSessionService';

describe('PolygonPaymentService', () => {
  const mockPrivateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const mockAccount = privateKeyToAccount(mockPrivateKey);
  
  const mockPublicClient = createPublicClient({
    chain: polygon,
    transport: http()
  });

  const mockWalletClient = createWalletClient({
    chain: polygon,
    transport: http(),
    account: mockAccount
  });

  const mockConfig = {
    contractAddress: '0x1234567890123456789012345678901234567890' as Address,
    receiverAddress: '0x0987654321098765432109876543210987654321' as Address,
    publicClient: mockPublicClient,
    walletClient: mockWalletClient
  };

  let service: PolygonPaymentService;
  let sessionService: PaymentSessionService;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionService = PaymentSessionService.getInstance();
    service = PolygonPaymentService.getInstance(mockConfig);
  });

  afterEach(() => {
    PolygonPaymentService.resetInstance();
  });

  describe('getInstance', () => {
    it('should create a new instance with config', () => {
      const instance = PolygonPaymentService.getInstance(mockConfig);
      expect(instance).toBeInstanceOf(PolygonPaymentService);
    });

    it('should throw error when getting instance without initialization', () => {
      PolygonPaymentService.resetInstance();
      expect(() => PolygonPaymentService.getInstance()).toThrow('PolygonPaymentService not initialized');
    });

    it('should return the same instance on multiple calls', () => {
      const instance1 = PolygonPaymentService.getInstance(mockConfig);
      const instance2 = PolygonPaymentService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('payWithToken', () => {
    const mockTokenAddress = '0xabcdef1234567890abcdef1234567890abcdef12' as Address;
    const mockAmount = BigInt(1000000);
    const mockServiceType = 'TEST_SERVICE';
    const mockSessionId = 'test-session-id';

    beforeEach(() => {
      vi.spyOn(mockPublicClient, 'getBlock').mockResolvedValue({
        baseFeePerGas: BigInt(30000000000) // 30 Gwei
      } as any);

      vi.spyOn(mockPublicClient, 'estimateMaxPriorityFeePerGas').mockResolvedValue(
        BigInt(40000000000) // 40 Gwei
      );

      vi.spyOn(mockPublicClient, 'estimateContractGas').mockResolvedValue(
        BigInt(200000) // 200k gas
      );

      vi.spyOn(mockPublicClient, 'simulateContract').mockResolvedValue({
        request: {} as any,
        result: '0x' // Simulated result
      });

      vi.spyOn(mockWalletClient, 'writeContract').mockResolvedValue(
        '0xtxhash'
      );

      vi.spyOn(sessionService, 'updateSessionStatus').mockImplementation(() => {});
    });

    it('should process payment with correct gas estimates', async () => {
      await service.payWithToken(
        mockTokenAddress,
        mockAmount,
        mockServiceType,
        mockSessionId
      );

      expect(mockPublicClient.getBlock).toHaveBeenCalled();
      expect(mockPublicClient.estimateMaxPriorityFeePerGas).toHaveBeenCalled();
      expect(mockPublicClient.estimateContractGas).toHaveBeenCalled();
      expect(mockPublicClient.simulateContract).toHaveBeenCalled();
      expect(mockWalletClient.writeContract).toHaveBeenCalled();
    });

    it('should use provided gas options when available', async () => {
      const customOptions = {
        maxFeePerGas: BigInt(50000000000), // 50 Gwei
        maxPriorityFeePerGas: BigInt(30000000000), // 30 Gwei
        gasLimit: BigInt(300000) // 300k gas
      };

      await service.payWithToken(
        mockTokenAddress,
        mockAmount,
        mockServiceType,
        mockSessionId,
        customOptions
      );

      expect(mockPublicClient.getBlock).not.toHaveBeenCalled();
      expect(mockPublicClient.estimateMaxPriorityFeePerGas).not.toHaveBeenCalled();
      expect(mockPublicClient.estimateContractGas).not.toHaveBeenCalled();
    });

    it('should handle payment errors correctly', async () => {
      const error = new Error('Transaction failed');
      vi.spyOn(mockWalletClient, 'writeContract').mockRejectedValue(error);

      await expect(
        service.payWithToken(
          mockTokenAddress,
          mockAmount,
          mockServiceType,
          mockSessionId
        )
      ).rejects.toThrow('Payment failed: Transaction failed');
    });

    it('should use fallback values when gas estimation fails', async () => {
      vi.spyOn(mockPublicClient, 'getBlock').mockRejectedValue(new Error('Failed to get block'));
      vi.spyOn(mockPublicClient, 'estimateMaxPriorityFeePerGas').mockRejectedValue(new Error('Failed to estimate priority fee'));
      vi.spyOn(mockPublicClient, 'estimateContractGas').mockRejectedValue(new Error('Failed to estimate gas'));

      await service.payWithToken(
        mockTokenAddress,
        mockAmount,
        mockServiceType,
        mockSessionId
      );

      expect(mockPublicClient.simulateContract).toHaveBeenCalled();
      expect(mockWalletClient.writeContract).toHaveBeenCalled();
    });
  });

  describe('event listeners', () => {
    it('should update session status on payment received', async () => {
      const mockSessionId = 'test-session-id';
      const mockTxHash = '0xtxhash';

      const mockLogs = [{
        args: { sessionId: mockSessionId },
        transactionHash: mockTxHash
      }];

      const watchSpy = vi.spyOn(mockPublicClient, 'watchContractEvent')
        .mockImplementation(({ onLogs }: any) => {
          onLogs(mockLogs);
          return () => {};
        });

      service = PolygonPaymentService.getInstance(mockConfig);

      expect(watchSpy).toHaveBeenCalled();
      expect(sessionService.updateSessionStatus).toHaveBeenCalledWith(
        mockSessionId,
        PaymentStatus.CONFIRMED,
        mockTxHash
      );
    });
  });
});
