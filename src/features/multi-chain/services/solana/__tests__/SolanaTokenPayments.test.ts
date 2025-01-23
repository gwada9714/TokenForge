// Test constants and mocks must be hoisted before imports
const TEST_VALUES = vi.hoisted(() => ({
  PROGRAM_ID: '11111111111111111111111111111111',
  RECEIVER: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC mint address
}));

import { describe, it, vi, beforeEach, expect } from 'vitest';
import { Connection } from '@solana/web3.js';
import { PaymentNetwork, PaymentStatus, PaymentToken, PaymentSession } from '../../payment/types/PaymentSession';
import { PaymentOptions } from '../../payment/types/PaymentService';
import { SolanaPaymentService, SolanaPaymentConfig } from '../SolanaPaymentService';
import { PaymentSessionService } from '../../payment/PaymentSessionService';
import bs58 from 'bs58';

// Mock Solana web3.js
vi.mock('@solana/web3.js', async () => {
  class MockPublicKey {
    constructor(public key: string | Buffer | Uint8Array) {}
    toBase58() { return typeof this.key === 'string' ? this.key : bs58.encode(this.key); }
    equals(other: MockPublicKey) { return this.toBase58() === other.toBase58(); }
    toBytes() { return typeof this.key === 'string' ? bs58.decode(this.key) : this.key; }
  }
  
  return {
    PublicKey: MockPublicKey,
    Connection: class MockConnection {
      constructor(public endpoint: string) {}
      
      sendTransaction = vi.fn().mockResolvedValue('mock-signature');
      confirmTransaction = vi.fn().mockResolvedValue({
        context: { slot: 1 },
        value: { err: null }
      });
      getParsedAccountInfo = vi.fn().mockResolvedValue({
        context: { slot: 1 },
        value: {
          executable: false,
          owner: TEST_VALUES.PROGRAM_ID,
          lamports: 1000000,
          data: Buffer.from('mock-data'),
          rentEpoch: 0
        }
      });
    },
    Keypair: {
      generate: () => ({
        publicKey: new MockPublicKey(TEST_VALUES.PROGRAM_ID),
        secretKey: new Uint8Array(32).fill(1)
      })
    }
  };
});

describe('SolanaPaymentService', () => {
  let config: SolanaPaymentConfig;
  const { PublicKey, Keypair } = require('@solana/web3.js');
  
  // Create properly typed mock functions with Promise support
  type CreateSessionFn = (userId: string, amount: bigint, token: PaymentToken, serviceType: string) => Promise<PaymentSession>;
  type GetSessionFn = (sessionId: string) => Promise<PaymentSession | undefined>;
  type UpdateSessionStatusFn = (sessionId: string, status: PaymentStatus, txHash?: string, error?: string) => Promise<PaymentSession>;
  type GetSessionsFn = () => Promise<Map<string, PaymentSession>>;
  type RetryPaymentFn = (sessionId: string) => Promise<boolean>;
  type CleanupFn = () => Promise<void>;

  const createSessionMock = vi.fn() as vi.MockedFunction<CreateSessionFn>;
  const getSessionMock = vi.fn() as vi.MockedFunction<GetSessionFn>;
  const updateSessionStatusMock = vi.fn() as vi.MockedFunction<UpdateSessionStatusFn>;
  const getSessionsMock = vi.fn() as vi.MockedFunction<GetSessionsFn>;
  const retryPaymentMock = vi.fn() as vi.MockedFunction<RetryPaymentFn>;
  const cleanupMock = vi.fn() as vi.MockedFunction<CleanupFn>;
  const cleanupOldSessionsMock = vi.fn() as vi.MockedFunction<CleanupFn>;

  // Setup mock session service
  const mockSessionService = {
    createSession: createSessionMock.mockImplementation(async (_userId, _amount, token, _serviceType) => ({
      id: 'test-session-id',
      userId: _userId,
      amount: _amount,
      token: token || {
        address: TEST_VALUES.RECEIVER,
        network: PaymentNetwork.SOLANA,
        symbol: 'USDC',
        decimals: 6
      },
      status: PaymentStatus.PENDING,
      network: PaymentNetwork.SOLANA,
      serviceType: _serviceType,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(),
      retryCount: 0
    })),
    getSession: getSessionMock,
    getSessions: getSessionsMock.mockResolvedValue(new Map()),
    updateSessionStatus: updateSessionStatusMock,
    retryPayment: retryPaymentMock,
    cleanup: cleanupMock,
    cleanupOldSessions: cleanupOldSessionsMock
  } as unknown as PaymentSessionService;

  beforeEach(() => {
    config = {
      programId: new PublicKey(TEST_VALUES.PROGRAM_ID),
      connection: new Connection('http://localhost:8899'),
      wallet: Keypair.generate(),
      receiverAddress: new PublicKey(TEST_VALUES.RECEIVER)
    };

    // Clear mocks
    vi.clearAllMocks();
    
    // Reset mock session service state
    createSessionMock.mockClear();
    getSessionMock.mockClear();
    updateSessionStatusMock.mockClear();
    getSessionsMock.mockClear();
    retryPaymentMock.mockClear();
    cleanupMock.mockClear();
    cleanupOldSessionsMock.mockClear();

    // Mock getInstance to return our mock
    vi.spyOn(PaymentSessionService, 'getInstance').mockReturnValue(mockSessionService);
  });

  describe('payWithToken', () => {
    it('should create proper transaction with transfer instruction', async () => {
      const service = SolanaPaymentService.getInstance(config);
      const { Connection } = require('@solana/web3.js');
      
      const options: PaymentOptions = {
        skipPreflight: false,
        maxRetries: 3
      };

      const amount = BigInt(1_000_000); // 1 USDC (6 decimals)
      
      // Start payment flow
      const session = await service.startPayment('user123', amount, {
        address: TEST_VALUES.RECEIVER,
        network: PaymentNetwork.SOLANA,
        symbol: 'USDC',
        decimals: 6
      }, options);

      // Verify transaction structure
      expect(Connection.prototype.sendTransaction).toHaveBeenCalled();
      const [transaction] = Connection.prototype.sendTransaction.mock.calls[0];
      
      // Verify transaction has recent blockhash
      expect(transaction.recentBlockhash).toBeDefined();
      
      // Verify transaction has exactly one instruction
      expect(transaction.instructions).toHaveLength(1);
      
      // Verify instruction structure
      const instruction = transaction.instructions[0];
      expect(instruction.programId.toBase58()).toBe(TEST_VALUES.PROGRAM_ID);
      
      // Verify instruction accounts
      expect(instruction.keys).toHaveLength(2);
      expect(instruction.keys[0].pubkey.toBase58()).toBe(config.wallet.publicKey.toBase58());
      expect(instruction.keys[0].isSigner).toBe(true);
      expect(instruction.keys[0].isWritable).toBe(true);
      
      expect(instruction.keys[1].pubkey.toBase58()).toBe(TEST_VALUES.RECEIVER);
      expect(instruction.keys[1].isSigner).toBe(false);
      expect(instruction.keys[1].isWritable).toBe(true);
      
      // Verify instruction data
      const dataView = new DataView(instruction.data.buffer);
      expect(dataView.getUint32(0, true)).toBe(2); // Transfer instruction index
      expect(dataView.getBigUint64(4, true)).toBe(amount);
      
      expect(session.status).toBe(PaymentStatus.PENDING);
    });

    it('should handle transaction atomicity', async () => {
      const service = SolanaPaymentService.getInstance(config);
      const { Connection } = require('@solana/web3.js');
      
      // Mock partial transaction failure
      Connection.prototype.confirmTransaction.mockResolvedValueOnce({
        context: { slot: 1 },
        value: { 
          err: { 
            InstructionError: [0, 'InsufficientFunds']
          }
        }
      });

      const amount = BigInt(1_000_000);
      
      const session = await service.startPayment('user123', amount, {
        address: TEST_VALUES.RECEIVER,
        network: PaymentNetwork.SOLANA,
        symbol: 'USDC',
        decimals: 6
      });

      // Verify session is marked as failed
      expect(session.status).toBe(PaymentStatus.FAILED);
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        session.id,
        PaymentStatus.FAILED,
        undefined,
        expect.stringContaining('InsufficientFunds')
      );
    });

    it('should handle expired blockhash', async () => {
      const service = SolanaPaymentService.getInstance(config);
      const { Connection } = require('@solana/web3.js');
      
      // Mock blockhash expiration
      Connection.prototype.confirmTransaction.mockResolvedValueOnce({
        context: { slot: 1 },
        value: { 
          err: 'BlockhashNotFound'
        }
      });

      const amount = BigInt(1_000_000);
      
      const session = await service.startPayment('user123', amount, {
        address: TEST_VALUES.RECEIVER,
        network: PaymentNetwork.SOLANA,
        symbol: 'USDC',
        decimals: 6
      });

      // Verify session is marked for retry
      expect(session.status).toBe(PaymentStatus.PENDING);
      expect(session.retryCount).toBe(1);
      expect(mockSessionService.retryPayment).toHaveBeenCalledWith(session.id);
    });

    it('should complete payment flow successfully', async () => {
      const service = SolanaPaymentService.getInstance(config);
      const { Connection } = require('@solana/web3.js');
      
      const options: PaymentOptions = {
        skipPreflight: false,
        commitment: 'confirmed'
      };
      
      const sessionId = await service.payWithToken(
        config.receiverAddress,
        BigInt(1000000),
        'payment',
        'user-123',
        options
      );

      expect(sessionId).toBe('test-session-id');
      expect(mockSessionService.createSession).toHaveBeenCalledWith(
        'user-123',
        BigInt(1000000),
        expect.objectContaining({
          address: config.receiverAddress,
          network: PaymentNetwork.SOLANA
        }),
        'payment'
      );
      expect(Connection.prototype.sendTransaction).toHaveBeenCalled();
      expect(Connection.prototype.confirmTransaction).toHaveBeenCalled();
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.CONFIRMED,
        undefined,
        'mock-signature'
      );
    });

    it('should handle invalid payment parameters', async () => {
      const service = SolanaPaymentService.getInstance(config);
      const options: PaymentOptions = {
        skipPreflight: false,
        commitment: 'confirmed'
      };

      await expect(async () => {
        await service.payWithToken(
          config.receiverAddress,
          BigInt(0),
          'payment',
          'user-123',
          options
        );
      }).rejects.toThrow('Invalid payment amount');
    });

    it('should handle transaction failures', async () => {
      const service = SolanaPaymentService.getInstance(config);
      
      // Mock transaction failure
      Connection.prototype.confirmTransaction.mockResolvedValueOnce({
        context: { slot: 1 },
        value: { err: new Error('Transaction failed') }
      });

      const options: PaymentOptions = {
        skipPreflight: false,
        commitment: 'confirmed'
      };

      await expect(async () => {
        await service.payWithToken(
          config.receiverAddress,
          BigInt(1000000),
          'payment',
          'user-123',
          options
        );
      }).rejects.toThrow('Transaction failed');

      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.FAILED,
        expect.stringContaining('Transaction failed')
      );
    });

    it('should handle session creation failure', async () => {
      const service = SolanaPaymentService.getInstance(config);
      
      // Mock session creation failure by returning null
      mockSessionService.createSession.mockResolvedValue(null as any);

      const options: PaymentOptions = {
        skipPreflight: false,
        commitment: 'confirmed'
      };

      await expect(async () => {
        await service.payWithToken(
          config.receiverAddress,
          BigInt(1000000),
          'payment',
          'user-123',
          options
        );
      }).rejects.toThrow('Failed to create payment session');
    });

    it('should handle network timeouts with retry', async () => {
      const service = SolanaPaymentService.getInstance(config);
      const { Connection } = require('@solana/web3.js');
      
      // Mock network timeout
      Connection.prototype.sendTransaction.mockRejectedValueOnce(new Error('Network timeout'));
      
      const amount = BigInt(1_000_000);
      
      const session = await service.startPayment('user123', amount, {
        address: TEST_VALUES.RECEIVER,
        network: PaymentNetwork.SOLANA,
        symbol: 'USDC',
        decimals: 6
      }, {
        maxRetries: 3,
        skipPreflight: false
      });

      // Should be pending for retry
      expect(session.status).toBe(PaymentStatus.PENDING);
      expect(session.retryCount).toBe(1);
      expect(mockSessionService.retryPayment).toHaveBeenCalledWith(session.id);
    });

    it('should fail after max retries', async () => {
      const service = SolanaPaymentService.getInstance(config);
      const { Connection } = require('@solana/web3.js');
      
      // Mock multiple network failures
      Connection.prototype.sendTransaction
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Network timeout'));
      
      const amount = BigInt(1_000_000);
      
      const session = await service.startPayment('user123', amount, {
        address: TEST_VALUES.RECEIVER,
        network: PaymentNetwork.SOLANA,
        symbol: 'USDC',
        decimals: 6
      }, {
        maxRetries: 2,
        skipPreflight: false
      });

      // Should be failed after max retries
      expect(session.status).toBe(PaymentStatus.FAILED);
      expect(session.retryCount).toBe(2);
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        session.id,
        PaymentStatus.FAILED,
        undefined,
        expect.stringContaining('Max retries exceeded')
      );
    });

    it('should validate transaction size', async () => {
      const service = SolanaPaymentService.getInstance(config);
      const { Connection } = require('@solana/web3.js');
      
      // Create a large memo to exceed transaction size limit (1232 bytes)
      const largeData = Buffer.alloc(1233, 'x');
      
      // Mock transaction size error
      Connection.prototype.sendTransaction.mockRejectedValueOnce(
        new Error('Transaction too large: 1233 bytes')
      );
      
      const amount = BigInt(1_000_000);
      
      const session = await service.startPayment('user123', amount, {
        address: TEST_VALUES.RECEIVER,
        network: PaymentNetwork.SOLANA,
        symbol: 'USDC',
        decimals: 6
      }, {
        memo: largeData.toString()
      });

      // Should fail due to size limit
      expect(session.status).toBe(PaymentStatus.FAILED);
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        session.id,
        PaymentStatus.FAILED,
        undefined,
        expect.stringContaining('Transaction too large')
      );
    });

    it('should handle multiple instruction failures atomically', async () => {
      const service = SolanaPaymentService.getInstance(config);
      const { Connection } = require('@solana/web3.js');
      
      // Mock failure in second instruction
      Connection.prototype.confirmTransaction.mockResolvedValueOnce({
        context: { slot: 1 },
        value: { 
          err: { 
            InstructionError: [1, 'Custom'] 
          }
        }
      });
      
      const amount = BigInt(1_000_000);
      
      // Start payment with memo (adds second instruction)
      const session = await service.startPayment('user123', amount, {
        address: TEST_VALUES.RECEIVER,
        network: PaymentNetwork.SOLANA,
        symbol: 'USDC',
        decimals: 6
      }, {
        memo: 'Test payment'
      });

      // Verify entire transaction failed
      expect(session.status).toBe(PaymentStatus.FAILED);
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        session.id,
        PaymentStatus.FAILED,
        undefined,
        expect.stringContaining('Custom')
      );

      // Verify transaction had multiple instructions
      const [transaction] = Connection.prototype.sendTransaction.mock.calls[0];
      expect(transaction.instructions.length).toBeGreaterThan(1);
    });
  });

  describe('isTokenSupported', () => {
    it('should return true for supported tokens', async () => {
      const service = SolanaPaymentService.getInstance(config);
      const { Connection } = require('@solana/web3.js');
      const tokenAddress = new PublicKey(TEST_VALUES.RECEIVER);

      const result = await service.isTokenSupported(tokenAddress);
      expect(result).toBe(true);
      expect(Connection.prototype.getParsedAccountInfo).toHaveBeenCalledWith(tokenAddress);
    });

    it('should return false for unsupported tokens', async () => {
      const service = SolanaPaymentService.getInstance(config);
      const { Connection } = require('@solana/web3.js');
      const tokenAddress = new PublicKey(TEST_VALUES.RECEIVER);

      // Mock token not found
      Connection.prototype.getParsedAccountInfo.mockResolvedValueOnce({
        context: { slot: 1 },
        value: null
      });

      const result = await service.isTokenSupported(tokenAddress);
      expect(result).toBe(false);
      expect(Connection.prototype.getParsedAccountInfo).toHaveBeenCalledWith(tokenAddress);
    });

    it('should handle errors gracefully', async () => {
      const service = SolanaPaymentService.getInstance(config);
      const { Connection } = require('@solana/web3.js');
      const tokenAddress = new PublicKey(TEST_VALUES.RECEIVER);

      // Mock error
      Connection.prototype.getParsedAccountInfo.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.isTokenSupported(tokenAddress);
      expect(result).toBe(false);
      expect(Connection.prototype.getParsedAccountInfo).toHaveBeenCalledWith(tokenAddress);
    });
  });
});