import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PublicKey, Connection, Keypair, Transaction, Commitment } from '@solana/web3.js';
import { SolanaPaymentService, SolanaPaymentConfig } from '../SolanaPaymentService';
import { PaymentSessionService } from '../../payment/PaymentSessionService';
import { PaymentStatus, PaymentNetwork } from '../../payment/types/PaymentSession';

// Mock des classes Solana
vi.mock('@solana/web3.js', async () => {
  const actual = await vi.importActual('@solana/web3.js');
  const mockPublicKey = vi.fn().mockImplementation((key: string) => ({
    _bn: Buffer.from(key),
    toBase58: () => key,
    toString: () => key,
    equals: (other: any) => key === other?.toString(),
    toBuffer: () => Buffer.from(key),
    toBytes: () => new Uint8Array(32),
  }));

  return {
    ...actual,
    PublicKey: mockPublicKey,
    Connection: vi.fn().mockImplementation(() => ({
      getRecentBlockhash: vi.fn().mockResolvedValue({
        blockhash: 'mock-blockhash',
        feeCalculator: {
          lamportsPerSignature: 5000
        }
      }),
      sendTransaction: vi.fn().mockResolvedValue('transaction-signature-1234'),
      confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
    })),
  };
});

// Mock solana_payment.json
vi.mock('../programs/solana_payment.json', () => ({
  default: {
    version: '0.1.0',
    name: 'solana_payment',
    instructions: [
      {
        name: 'processPayment',
        accounts: [
          { name: 'payer', isMut: true, isSigner: true },
          { name: 'receiver', isMut: true, isSigner: false },
          { name: 'systemProgram', isMut: false, isSigner: false },
          { name: 'tokenProgram', isMut: false, isSigner: false },
          { name: 'rent', isMut: false, isSigner: false }
        ],
        args: [
          { name: 'tokenMint', type: 'publicKey' },
          { name: 'amount', type: 'u64' },
          { name: 'sessionId', type: 'string' }
        ]
      }
    ]
  }
}));

// Mock @project-serum/anchor
vi.mock('@project-serum/anchor', () => {
  const mockWallet = {
    publicKey: new PublicKey('11111111111111111111111111111111'),
    signTransaction: async (tx: Transaction) => {
      tx.signatures = [{
        publicKey: new PublicKey('11111111111111111111111111111111'),
        signature: Buffer.from('signature')
      }];
      return tx;
    },
    signAllTransactions: async (txs: Transaction[]) => {
      return txs.map(tx => {
        tx.signatures = [{
          publicKey: new PublicKey('11111111111111111111111111111111'),
          signature: Buffer.from('signature')
        }];
        return tx;
      });
    }
  };

  const mockProvider = {
    connection: {
      getLatestBlockhash: vi.fn().mockResolvedValue({
        blockhash: 'mock-blockhash',
        feeCalculator: {
          lamportsPerSignature: 5000
        }
      }),
      sendTransaction: vi.fn().mockResolvedValue('transaction-signature-1234'),
      confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
    },
    wallet: mockWallet,
    publicKey: mockWallet.publicKey,
    opts: { commitment: 'confirmed' as Commitment },
    sendAndConfirm: vi.fn().mockImplementation(async (_tx: Transaction, _signers?: any[], _opts?: any) => {
      return 'transaction-signature-1234';
    })
  };

  const mockProgram = {
    provider: mockProvider,
    account: {},
    rpc: {
      processPayment: vi.fn().mockResolvedValue('tx-signature-1234'),
    },
    methods: {
      processPayment: vi.fn().mockReturnValue({
        accounts: vi.fn().mockReturnValue({
          instruction: vi.fn().mockResolvedValue({})
        })
      })
    }
  };

  return {
    Program: vi.fn().mockImplementation(() => mockProgram),
    AnchorProvider: vi.fn().mockImplementation((_connection, _wallet, _opts) => mockProvider),
    Wallet: vi.fn(),
    BN: vi.fn(n => n),
  };
});

// Mock PaymentSessionService
vi.mock('../../payment/PaymentSessionService', () => ({
  PaymentSessionService: {
    getInstance: vi.fn()
  }
}));

describe('SolanaPaymentService - Token Payments', () => {
  let paymentService: SolanaPaymentService;
  let mockConnection: Connection;
  let mockWallet: Keypair;
  let mockSessionService: any;

  // Token Mints (simulating USDC, USDT on Solana)
  const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  const USDT_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
  const PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockConnection = new Connection('https://api.mainnet-beta.solana.com');
    mockWallet = {
      publicKey: new PublicKey('11111111111111111111111111111111'),
      secretKey: new Uint8Array(32),
      sign: vi.fn().mockImplementation((tx: Transaction) => {
        tx.signatures = [{
          publicKey: mockWallet.publicKey,
          signature: Buffer.from('signature')
        }];
        return tx;
      })
    } as unknown as Keypair;

    mockSessionService = {
      createSession: vi.fn().mockImplementation((
        userId: string,
        amount: bigint,
        token: any,
        serviceType: string
      ) => ({
        id: 'test-session-1',
        userId,
        amount,
        token,
        serviceType,
        network: PaymentNetwork.SOLANA,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        retryCount: 0,
      })),
      updateSessionStatus: vi.fn().mockImplementation((
        sessionId: string,
        status: PaymentStatus,
        error?: Error,
        txHash?: string
      ) => ({
        id: sessionId,
        userId: 'test-user',
        amount: BigInt(1000000),
        token: {
          address: USDC_MINT,
          network: PaymentNetwork.SOLANA,
          symbol: 'USDC',
          decimals: 6
        },
        status,
        error,
        txHash,
        network: PaymentNetwork.SOLANA,
        serviceType: 'subscription',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        retryCount: 0,
      }))
    };

    vi.mocked(PaymentSessionService.getInstance).mockReturnValue(mockSessionService);

    const config: SolanaPaymentConfig = {
      programId: PROGRAM_ID,
      connection: mockConnection,
      wallet: mockWallet,
      receiverAddress: new PublicKey('11111111111111111111111111111111')
    };

    paymentService = SolanaPaymentService.getInstance(config);
  });

  afterEach(() => {
    vi.clearAllMocks();
    (SolanaPaymentService as any).instance = undefined;
  });

  describe('USDC (SPL) Payments', () => {
    it('should handle USDC payment creation', async () => {
      const userId = 'test-user-1';
      const amount = BigInt(1000000); // 1 USDC
      const serviceType = 'subscription';

      const result = await paymentService.payWithToken(
        USDC_MINT,
        amount,
        serviceType,
        userId,
        {}
      );

      expect(result).toBeDefined();
      expect(mockSessionService.createSession).toHaveBeenCalledWith(
        userId,
        amount,
        expect.objectContaining({
          address: USDC_MINT,
          network: PaymentNetwork.SOLANA
        }),
        serviceType
      );
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        'test-session-1',
        PaymentStatus.CONFIRMED,
        undefined,
        'transaction-signature-1234'
      );
    });

    it('should handle failed USDC payment', async () => {
      const userId = 'test-user-2';
      const amount = BigInt(1000000); // 1 USDC

      vi.mocked(mockConnection.sendTransaction).mockRejectedValueOnce(new Error('Insufficient funds'));
      vi.mocked(mockSessionService.updateSessionStatus);

      await expect(paymentService.payWithToken(
        USDC_MINT,
        amount,
        'TEST_SERVICE',
        userId,
        { skipPreflight: false }
      )).rejects.toThrow('Insufficient funds');

      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        expect.any(String),
        PaymentStatus.FAILED,
        expect.any(Error),
        undefined
      );
    });

    it('should handle USDT payment creation', async () => {
      const userId = 'test-user-3';
      const amount = BigInt(1000000); // 1 USDT (6 decimals)

      vi.mocked(mockSessionService.updateSessionStatus);

      const result = await paymentService.payWithToken(
        USDT_MINT,
        amount,
        'TEST_SERVICE',
        userId,
        { skipPreflight: false }
      );

      expect(result).toBeDefined();
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        expect.any(String),
        PaymentStatus.PROCESSING,
        undefined,
        expect.any(String)
      );
    });

    it('should handle failed USDT payment', async () => {
      const userId = 'test-user-4';
      const amount = BigInt(1000000); // 1 USDT

      vi.mocked(mockConnection.sendTransaction).mockRejectedValueOnce(new Error('Token account not found'));
      vi.mocked(mockSessionService.updateSessionStatus);

      await expect(paymentService.payWithToken(
        USDT_MINT,
        amount,
        'TEST_SERVICE',
        userId,
        { skipPreflight: false }
      )).rejects.toThrow('Token account not found');

      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        expect.any(String),
        PaymentStatus.FAILED,
        expect.any(Error),
        undefined
      );
    });
  });

  describe('USDT (SPL) Payments', () => {
    it('should handle USDT payment creation', async () => {
      const userId = 'test-user-3';
      const amount = BigInt(1000000); // 1 USDT (6 decimals)

      vi.mocked(mockSessionService.updateSessionStatus);

      const result = await paymentService.payWithToken(
        USDT_MINT,
        amount,
        'TEST_SERVICE',
        userId,
        { skipPreflight: false }
      );

      expect(result).toBeDefined();
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        expect.any(String),
        PaymentStatus.PROCESSING,
        undefined,
        expect.any(String)
      );
    });

    it('should handle failed USDT payment', async () => {
      const userId = 'test-user-4';
      const amount = BigInt(1000000); // 1 USDT

      vi.mocked(mockConnection.sendTransaction).mockRejectedValueOnce(new Error('Token account not found'));
      vi.mocked(mockSessionService.updateSessionStatus);

      await expect(paymentService.payWithToken(
        USDT_MINT,
        amount,
        'TEST_SERVICE',
        userId,
        { skipPreflight: false }
      )).rejects.toThrow('Token account not found');

      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        expect.any(String),
        PaymentStatus.FAILED,
        expect.any(Error),
        undefined
      );
    });
  });
});
