import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { createPublicClient, createWalletClient, http, Address, Hash } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { EthereumPaymentService } from '../EthereumPaymentService';
import { PaymentStatus, PaymentSession, PaymentNetwork } from '../../payment/types/PaymentSession';
import { PaymentSessionService } from '../../payment/PaymentSessionService';

describe('EthereumPaymentService', () => {
  const mockPrivateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const mockAccount = privateKeyToAccount(mockPrivateKey);
  
  const mockPublicClient = createPublicClient({
    chain: mainnet,
    transport: http()
  });

  const mockWalletClient = createWalletClient({
    chain: mainnet,
    transport: http(),
    account: mockAccount
  });

  const mockConfig = {
    contractAddress: '0x1234567890123456789012345678901234567890' as Address,
    receiverAddress: '0x0987654321098765432109876543210987654321' as Address,
    publicClient: mockPublicClient,
    walletClient: mockWalletClient
  };

  let service: EthereumPaymentService;
  let sessionService: PaymentSessionService;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionService = PaymentSessionService.getInstance();
    service = EthereumPaymentService.getInstance(mockConfig);
  });

  afterEach(() => {
    EthereumPaymentService.resetInstance();
  });

  describe('getInstance', () => {
    it('should create a new instance with config', () => {
      const instance = EthereumPaymentService.getInstance(mockConfig);
      expect(instance).toBeInstanceOf(EthereumPaymentService);
    });

    it('should throw error when getting instance without initialization', () => {
      EthereumPaymentService.resetInstance();
      expect(() => EthereumPaymentService.getInstance()).toThrow('EthereumPaymentService not initialized');
    });

    it('should return the same instance on multiple calls', () => {
      const instance1 = EthereumPaymentService.getInstance(mockConfig);
      const instance2 = EthereumPaymentService.getInstance();
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
        baseFeePerGas: BigInt(1000000000) // 1 Gwei
      } as any);

      vi.spyOn(mockPublicClient, 'estimateMaxPriorityFeePerGas').mockResolvedValue(
        BigInt(1500000000) // 1.5 Gwei
      );

      vi.spyOn(mockPublicClient, 'simulateContract').mockResolvedValue({
        request: {
          address: mockConfig.contractAddress,
          functionName: 'payWithToken',
          args: [mockTokenAddress, mockAmount]
        },
        result: undefined
      } as any);

      vi.spyOn(mockWalletClient, 'writeContract').mockResolvedValue(
        '0xtxhash' as Hash
      );

      const mockSession: PaymentSession = {
        id: mockSessionId,
        userId: 'test-user',
        amount: mockAmount,
        token: {
          address: mockTokenAddress,
          symbol: 'TEST',
          decimals: 18,
          network: PaymentNetwork.ETHEREUM
        },
        network: PaymentNetwork.ETHEREUM,
        serviceType: mockServiceType,
        status: PaymentStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        retryCount: 0
      };

      vi.spyOn(sessionService, 'updateSessionStatus').mockImplementation(
        () => mockSession
      );
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
      expect(mockPublicClient.simulateContract).toHaveBeenCalled();
      expect(mockWalletClient.writeContract).toHaveBeenCalled();
    });

    it('should use provided gas options when available', async () => {
      const customOptions = {
        maxFeePerGas: BigInt(2000000000),
        maxPriorityFeePerGas: BigInt(1000000000)
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

      service = EthereumPaymentService.getInstance(mockConfig);

      expect(watchSpy).toHaveBeenCalled();
      expect(sessionService.updateSessionStatus).toHaveBeenCalledWith(
        mockSessionId,
        PaymentStatus.CONFIRMED,
        mockTxHash
      );
    });
  });
});
