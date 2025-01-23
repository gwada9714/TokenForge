import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { SolanaPaymentService, SolanaPaymentConfig } from '../SolanaPaymentService';
import { PaymentStatus, PaymentSession, PaymentNetwork } from '../../payment/types/PaymentSession';

// Augmenter le timeout pour tous les tests
vi.setConfig({ testTimeout: 15000 });

// Créer les mocks hoisted pour qu'ils soient accessibles partout
const { mockCreateSession, mockUpdateSessionStatus } = vi.hoisted(() => ({
  mockCreateSession: vi.fn(),
  mockUpdateSessionStatus: vi.fn()
}));

// Mock PaymentSessionService avant les tests
vi.mock('../../payment/PaymentSessionService', () => {
  return {
    PaymentSessionService: {
      getInstance: vi.fn().mockReturnValue({
        createSession: mockCreateSession.mockImplementation((userId, amount, token, serviceType): PaymentSession => ({
          id: 'test-session-id',
          userId,
          amount,
          token,
          network: token.network,
          serviceType,
          status: PaymentStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 10000),
          retryCount: 0
        })),
        updateSessionStatus: mockUpdateSessionStatus.mockImplementation(() => Promise.resolve())
      })
    }
  };
});

describe('SolanaPaymentService', () => {
  // Créer les mocks avant de les assigner
  const mockSendTransaction = vi.fn();
  const mockConfirmTransaction = vi.fn();
  const mockGetParsedAccountInfo = vi.fn();
  const mockGetLatestBlockhash = vi.fn();

  const mockConnection = {
    commitment: 'confirmed',
    rpcEndpoint: 'mock-endpoint',
    getAccountInfo: vi.fn(),
    getBalance: vi.fn(),
    getBalanceAndContext: vi.fn(),
    getBlockTime: vi.fn(),
    getFirstAvailableBlock: vi.fn(),
    getLatestBlockhash: mockGetLatestBlockhash,
    getMinimumLedgerSlot: vi.fn(),
    getParsedAccountInfo: mockGetParsedAccountInfo,
    getSupply: vi.fn(),
    sendTransaction: mockSendTransaction,
    confirmTransaction: mockConfirmTransaction,
  } as unknown as Connection;

  const mockWallet = Keypair.generate();
  const mockProgramId = new PublicKey('11111111111111111111111111111111');
  const mockReceiverAddress = new PublicKey('22222222222222222222222222222222');

  let service: SolanaPaymentService;

  const MOCK_TOKEN_ADDRESS = new PublicKey('33333333333333333333333333333333');
  const MOCK_AMOUNT = BigInt(1_000_000_000); // 1 SOL en lamports
  const MOCK_USER_ID = 'test-user';
  const MOCK_SERVICE_TYPE = 'test-service';

  const MOCK_BLOCKHASH = {
    blockhash: 'mock-blockhash',
    lastValidBlockHeight: 1000
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset mock implementations avec des promesses résolues immédiatement
    mockGetLatestBlockhash.mockResolvedValue(MOCK_BLOCKHASH);
    mockSendTransaction.mockResolvedValue('mock-signature');
    mockConfirmTransaction.mockResolvedValue({ value: { err: null } });
    mockGetParsedAccountInfo.mockResolvedValue({ value: {} });

    service = await SolanaPaymentService.getInstance({
      connection: mockConnection,
      wallet: mockWallet,
      programId: mockProgramId,
      receiverAddress: mockReceiverAddress,
    });
  });

  describe('initialization', () => {
    it('should initialize provider successfully', async () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(SolanaPaymentService);
    });

    it('should throw error with invalid provider config', async () => {
      const invalidConfig = undefined;

      await expect(async () => {
        await SolanaPaymentService.getInstance(invalidConfig);
      }).rejects.toThrow('Invalid configuration: config is required');

      const emptyConfig = {} as SolanaPaymentConfig;
      await expect(async () => {
        await SolanaPaymentService.getInstance(emptyConfig);
      }).rejects.toThrow('Invalid configuration: missing required fields');
    });
  });

  describe('payWithToken', () => {
    it('should process payment successfully', async () => {
      const txHash = 'mock-signature';
      mockGetParsedAccountInfo.mockResolvedValue({ value: {} });
      mockGetLatestBlockhash.mockResolvedValue(MOCK_BLOCKHASH);
      mockSendTransaction.mockResolvedValue(txHash);
      mockConfirmTransaction.mockResolvedValue({ value: { err: null } });

      const result = await service.payWithToken(
        MOCK_TOKEN_ADDRESS,
        MOCK_AMOUNT,
        MOCK_SERVICE_TYPE,
        MOCK_USER_ID
      );

      expect(result).toBe(txHash);
      expect(mockSendTransaction).toHaveBeenCalledWith(
        expect.any(Transaction),
        [mockWallet],
        expect.any(Object)
      );
      expect(mockCreateSession).toHaveBeenCalledWith(
        MOCK_USER_ID,
        MOCK_AMOUNT,
        expect.objectContaining({
          address: MOCK_TOKEN_ADDRESS,
          network: PaymentNetwork.SOLANA,
          symbol: 'SOL',
          decimals: 9
        }),
        MOCK_SERVICE_TYPE
      );
      expect(mockUpdateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.CONFIRMED,
        txHash
      );
    });

    it('should handle transaction errors', async () => {
      mockGetLatestBlockhash.mockResolvedValue(MOCK_BLOCKHASH);
      mockSendTransaction.mockRejectedValue(new Error('Transaction error'));
      mockGetParsedAccountInfo.mockResolvedValue({ value: {} });

      await expect(
        service.payWithToken(MOCK_TOKEN_ADDRESS, MOCK_AMOUNT, MOCK_SERVICE_TYPE, MOCK_USER_ID)
      ).rejects.toThrow('Payment failed: Transaction error');

      expect(mockUpdateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.FAILED,
        undefined,
        'Transaction error'
      );
    });

    it('should handle network errors', async () => {
      mockGetLatestBlockhash.mockRejectedValue(new Error('Network error'));
      mockGetParsedAccountInfo.mockResolvedValue({ value: {} });

      await expect(
        service.payWithToken(MOCK_TOKEN_ADDRESS, MOCK_AMOUNT, MOCK_SERVICE_TYPE, MOCK_USER_ID)
      ).rejects.toThrow('Payment failed: Network error');

      expect(mockUpdateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.FAILED,
        undefined,
        'Network error'
      );
    });

    it('should validate payment amount', async () => {
      await expect(
        service.payWithToken(MOCK_TOKEN_ADDRESS, 0n, MOCK_SERVICE_TYPE, MOCK_USER_ID)
      ).rejects.toThrow('Payment amount must be greater than 0');
    });

    it('should handle negative amounts', async () => {
      await expect(
        service.payWithToken(MOCK_TOKEN_ADDRESS, -1n, MOCK_SERVICE_TYPE, MOCK_USER_ID)
      ).rejects.toThrow('Payment amount must be greater than 0');
    });

    it('should handle transaction timeout', async () => {
      mockGetLatestBlockhash.mockResolvedValue(MOCK_BLOCKHASH);
      mockSendTransaction.mockResolvedValue('tx-hash');
      mockConfirmTransaction.mockRejectedValue(new Error('Timeout'));
      mockGetParsedAccountInfo.mockResolvedValue({ value: {} });

      await expect(
        service.payWithToken(MOCK_TOKEN_ADDRESS, MOCK_AMOUNT, MOCK_SERVICE_TYPE, MOCK_USER_ID)
      ).rejects.toThrow('Payment failed: Timeout');

      expect(mockUpdateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.FAILED,
        undefined,
        'Timeout'
      );
    });
  });

  describe('transaction options', () => {
    it('should use custom commitment level', async () => {
      const customCommitment = 'finalized';
      mockGetLatestBlockhash.mockResolvedValue(MOCK_BLOCKHASH);
      mockGetParsedAccountInfo.mockResolvedValue({ value: {} });
      mockSendTransaction.mockResolvedValue('mock-signature');
      mockConfirmTransaction.mockResolvedValue({ value: { err: null } });

      await service.payWithToken(
        MOCK_TOKEN_ADDRESS,
        MOCK_AMOUNT,
        MOCK_SERVICE_TYPE,
        MOCK_USER_ID,
        { commitment: customCommitment }
      );

      expect(mockGetLatestBlockhash).toHaveBeenCalledWith(customCommitment);
      expect(mockSendTransaction).toHaveBeenCalledWith(
        expect.any(Transaction),
        [mockWallet],
        expect.objectContaining({ 
          preflightCommitment: customCommitment,
          skipPreflight: false
        })
      );
    });

    it('should handle skipPreflight option', async () => {
      mockGetLatestBlockhash.mockResolvedValue(MOCK_BLOCKHASH);
      mockGetParsedAccountInfo.mockResolvedValue({ value: {} });
      mockSendTransaction.mockResolvedValue('mock-signature');
      mockConfirmTransaction.mockResolvedValue({ value: { err: null } });

      await service.payWithToken(
        MOCK_TOKEN_ADDRESS,
        MOCK_AMOUNT,
        MOCK_SERVICE_TYPE,
        MOCK_USER_ID,
        { skipPreflight: true }
      );

      expect(mockSendTransaction).toHaveBeenCalledWith(
        expect.any(Transaction),
        [mockWallet],
        expect.objectContaining({ 
          skipPreflight: true,
          preflightCommitment: 'confirmed'
        })
      );
    });
  });
});
