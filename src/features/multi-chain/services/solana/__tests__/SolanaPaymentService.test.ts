import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SolanaPaymentService, SolanaPaymentConfig } from '../SolanaPaymentService';
import { PaymentStatus, PaymentSession, PaymentNetwork, PaymentToken } from '../../payment/types/PaymentSession';

// Mock de @solana/web3.js avant toute utilisation de variables
vi.mock('@solana/web3.js', () => {
  class MockInstruction {
    programId: any;
    keys: any[];
    data: Uint8Array;

    constructor(programId: any, keys: any[], data: Uint8Array) {
      this.programId = programId;
      this.keys = keys;
      this.data = data;
    }

    toJSON() {
      return {
        programId: this.programId,
        keys: this.keys,
        data: this.data
      };
    }
  }

  class MockTransaction {
    feePayer: any;
    recentBlockhash: string;
    lastValidBlockHeight: number;
    instructions: any[];

    constructor(config: any = {}) {
      this.feePayer = config.feePayer;
      this.recentBlockhash = config.blockhash;
      this.lastValidBlockHeight = config.lastValidBlockHeight;
      this.instructions = [];
    }

    add(instruction: any) {
      // Accepte toutes les instructions pour les tests d'erreur
      this.instructions.push(instruction);
      return this;
    }

    sign(_signer: any) {
      return this;
    }

    serialize() {
      return new Uint8Array([1, 2, 3]);
    }
  }

  class MockPublicKey {
    private key: string;

    constructor(key: string) {
      this.key = key;
    }

    toBase58() {
      return this.key;
    }

    toString() {
      return this.key;
    }

    equals(other: any) {
      return other?.toString() === this.key;
    }
  }

  const SystemProgramId = new MockPublicKey('11111111111111111111111111111111');

  return {
    Connection: vi.fn(),
    Keypair: {
      generate: () => ({
        publicKey: new MockPublicKey('11111111111111111111111111111111')
      })
    },
    PublicKey: vi.fn().mockImplementation((key) => new MockPublicKey(key)),
    Transaction: MockTransaction as any,
    SystemProgram: {
      transfer: vi.fn().mockImplementation(({ fromPubkey, toPubkey, lamports }) => {
        const keys = [
          { pubkey: fromPubkey, isSigner: true, isWritable: true },
          { pubkey: toPubkey, isSigner: false, isWritable: true }
        ];
        const data = new Uint8Array([2, 0, 0, 0, ...new Uint8Array(new BigInt64Array([BigInt(lamports)]).buffer)]);
        const instruction = new MockInstruction(SystemProgramId, keys, data);
        return instruction.toJSON();
      })
    }
  };
});

// Configuration du timeout pour les tests longs
vi.setConfig({ testTimeout: 60000 });

// Mock des données blockchain
const MOCK_BLOCKHASH = {
  blockhash: '123456789abcdef',
  lastValidBlockHeight: 1000
};

// Mock des fonctions de la blockchain
const mockSendTransaction = vi.fn().mockResolvedValue('mock-signature');
const mockConfirmTransaction = vi.fn().mockResolvedValue({ value: { err: null } });
const mockGetLatestBlockhash = vi.fn().mockResolvedValue(MOCK_BLOCKHASH);

// Mock complet de la connexion Solana
const mockConnection = {
  commitment: 'confirmed',
  rpcEndpoint: 'mock-endpoint',
  getAccountInfo: vi.fn(),
  getBalance: vi.fn(),
  getBalanceAndContext: vi.fn(),
  sendTransaction: mockSendTransaction,
  confirmTransaction: mockConfirmTransaction,
  getLatestBlockhash: mockGetLatestBlockhash,
  getParsedAccountInfo: vi.fn().mockResolvedValue({ value: {} })
} as unknown as Connection;

// Création de comptes de test valides
const MOCK_TOKEN_ADDRESS = new PublicKey('11111111111111111111111111111111');
const mockWallet = Keypair.generate();
const mockReceiver = new PublicKey('11111111111111111111111111111111');

// Configuration valide pour les tests
const validConfig: SolanaPaymentConfig = {
  programId: new PublicKey('11111111111111111111111111111111'),
  connection: mockConnection,
  wallet: mockWallet,
  receiverAddress: mockReceiver
};

// Mock du service de session de paiement
const { mockCreateSession, mockUpdateSessionStatus } = vi.hoisted(() => ({
  mockCreateSession: vi.fn((userId: string, amount: bigint, token: PaymentToken, serviceType: string): PaymentSession => ({
    id: 'test-session-id',
    userId,
    amount,
    token,
    network: PaymentNetwork.SOLANA,
    serviceType,
    status: PaymentStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 10000),
    retryCount: 0
  })),
  mockUpdateSessionStatus: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../../payment/PaymentSessionService', () => ({
  PaymentSessionService: {
    getInstance: vi.fn().mockReturnValue({
      createSession: mockCreateSession,
      updateSessionStatus: mockUpdateSessionStatus
    })
  }
}));

describe('SolanaPaymentService', () => {
  let service: SolanaPaymentService;

  beforeEach(async () => {
    // Reset tous les mocks avant chaque test
    vi.clearAllMocks();
    
    // Configuration par défaut des mocks
    vi.spyOn(SolanaPaymentService.prototype, 'isTokenSupported').mockResolvedValue(true);
    mockGetLatestBlockhash.mockResolvedValue(MOCK_BLOCKHASH);
    mockSendTransaction.mockResolvedValue('mock-signature');
    mockConfirmTransaction.mockResolvedValue({ value: { err: null }, context: { slot: 0 } });
    
    // Initialisation du service
    service = await SolanaPaymentService.getInstance(validConfig);

    // Désactiver les timeouts réels
    vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      fn();
      return { unref: () => {} } as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize provider successfully', async () => {
      const instance = await SolanaPaymentService.getInstance(validConfig);
      expect(instance).toBeInstanceOf(SolanaPaymentService);
    });

    it('should throw error with invalid provider config', async () => {
      await expect(() => 
        SolanaPaymentService.getInstance(undefined)
      ).rejects.toThrow('Invalid configuration: config is required');

      await expect(() => 
        SolanaPaymentService.getInstance({} as SolanaPaymentConfig)
      ).rejects.toThrow('Invalid configuration: missing required fields');
    });
  });

  describe('payWithToken', () => {
    it('should process payment successfully', async () => {
      const txHash = 'mock-signature';
      mockSendTransaction.mockResolvedValue(txHash);

      const result = await service.payWithToken(
        MOCK_TOKEN_ADDRESS,
        BigInt('1000000000'),
        'test-service',
        'user123'
      );

      expect(result).toBe(txHash);
      expect(mockSendTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        [mockWallet],
        expect.objectContaining({
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        })
      );
      expect(mockConfirmTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          signature: txHash,
          blockhash: MOCK_BLOCKHASH.blockhash,
          lastValidBlockHeight: MOCK_BLOCKHASH.lastValidBlockHeight
        }),
        'confirmed'
      );
    });

    it('should handle transaction errors', async () => {
      const error = new Error('Transaction failed');
      mockSendTransaction.mockRejectedValue(error);

      await expect(service.payWithToken(
        MOCK_TOKEN_ADDRESS,
        BigInt('1000000000'),
        'test-service',
        'user123'
      )).rejects.toThrow('Payment failed: Transaction failed');

      expect(mockUpdateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.FAILED,
        undefined,
        'Transaction failed'
      );
    });

    it('should handle network errors', async () => {
      vi.spyOn(SolanaPaymentService.prototype, 'isTokenSupported')
        .mockRejectedValue(new Error('Network error'));

      await expect(service.payWithToken(
        MOCK_TOKEN_ADDRESS,
        BigInt('1000000000'),
        'test-service',
        'user123'
      )).rejects.toThrow('Payment failed: Network error');
    });

    it('should validate payment amount', async () => {
      await expect(service.payWithToken(
        MOCK_TOKEN_ADDRESS,
        BigInt(0),
        'test-service',
        'user123'
      )).rejects.toThrow('Payment amount must be greater than 0');
    });

    it('should handle negative amounts', async () => {
      await expect(service.payWithToken(
        MOCK_TOKEN_ADDRESS,
        BigInt(-1),
        'test-service',
        'user123'
      )).rejects.toThrow('Payment amount must be greater than 0');
    });

    it('should handle transaction timeout', async () => {
      const txHash = 'mock-signature';
      mockSendTransaction.mockResolvedValue(txHash);
      mockConfirmTransaction.mockResolvedValue({ value: { err: 'timeout' } });

      await expect(service.payWithToken(
        MOCK_TOKEN_ADDRESS,
        BigInt('1000000000'),
        'test-service',
        'user123'
      )).rejects.toThrow('Payment failed: timeout');

      expect(mockUpdateSessionStatus).toHaveBeenCalledWith(
        'test-session-id',
        PaymentStatus.FAILED,
        txHash,
        'timeout'
      );
    });
  });

  describe('transaction options', () => {
    it('should use custom commitment level', async () => {
      const customCommitment = 'finalized';

      await service.payWithToken(
        MOCK_TOKEN_ADDRESS,
        BigInt('1000000000'),
        'test-service',
        'user123',
        { commitment: customCommitment }
      );

      expect(mockGetLatestBlockhash).toHaveBeenCalledWith(customCommitment);
      expect(mockSendTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        [mockWallet],
        expect.objectContaining({ 
          preflightCommitment: customCommitment
        })
      );
    });

    it('should handle skipPreflight option', async () => {
      await service.payWithToken(
        MOCK_TOKEN_ADDRESS,
        BigInt('1000000000'),
        'test-service',
        'user123',
        { skipPreflight: true }
      );

      expect(mockSendTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        [mockWallet],
        expect.objectContaining({ skipPreflight: true })
      );
    });
  });
});
