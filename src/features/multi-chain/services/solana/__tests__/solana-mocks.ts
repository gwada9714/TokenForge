import { 
  Commitment, 
  Transaction,
  SendOptions,
  VersionedTransaction,
  TransactionSignature,
  SignatureResult,
  RpcResponseAndContext,
  TransactionConfirmationStrategy,
  Signer,
  PublicKey,
  TransactionInstruction,
  SystemProgram
} from '@solana/web3.js';
import { vi } from 'vitest';
import { TEST_VALUES } from './test-values';

// Mock BN.js
vi.mock('bn.js', () => {
  interface BNInstance {
    value: bigint;
    negative: number;
    words: number[];
    length: number;
    red: any;
    _init: (value: number | number[] | Uint8Array | string) => BNInstance;
    _initArray: (value: number[] | Uint8Array) => BNInstance;
    toNumber: () => number;
    toString: (base?: number) => string;
    toArray: (endian?: string, length?: number) => number[];
    toBuffer: (endian?: string, length?: number) => Buffer;
    fromTwos: (width: number) => BNInstance;
    toTwos: (width: number) => BNInstance;
    isNeg: () => boolean;
    clone: () => BNInstance;
  }

  const mockBN = vi.fn().mockImplementation((value: number | number[] | Uint8Array | string) => {
    const instance: BNInstance = {
      value: 0n,
      negative: 0,
      words: [],
      length: 0,
      red: null,
      _init: function(value) {
        if (typeof value === 'number') {
          this.value = BigInt(value);
        } else if (Array.isArray(value) || value instanceof Uint8Array) {
          return this._initArray(value);
        } else if (typeof value === 'string') {
          if (value.startsWith('0x')) {
            this.value = BigInt(value);
          } else {
            this.value = BigInt(parseInt(value, 10));
          }
        }
        this.negative = this.value < 0n ? 1 : 0;
        this.words = [Number(this.value)];
        this.length = 1;
        return this;
      },
      _initArray: function(value) {
        let arr: number[];
        if (Array.isArray(value)) {
          arr = value;
        } else if (value instanceof Uint8Array) {
          arr = Array.from(value);
        } else {
          throw new Error('Invalid array type');
        }
        
        // Convert byte array to bigint
        this.value = arr.reduce((acc, val, i) => {
          return acc + (BigInt(val) << BigInt(8 * i));
        }, 0n);
        
        this.negative = this.value < 0n ? 1 : 0;
        this.words = [Number(this.value)];
        this.length = 1;
        return this;
      },
      toNumber: function() { return Number(this.value); },
      toString: function(base = 10) { return this.value.toString(base); },
      toArray: function(endian = 'be', length = 0) { 
        const arr: number[] = [];
        let val = this.value < 0n ? -this.value : this.value;
        while (val > 0n) {
          arr[endian === 'be' ? 'unshift' : 'push'](Number(val & 255n));
          val = val >> 8n;
        }
        const result = arr.length ? arr : [0];
        
        // Pad array to requested length
        while (length && result.length < length) {
          if (endian === 'be') {
            result.unshift(0);
          } else {
            result.push(0);
          }
        }
        
        return result;
      },
      toBuffer: function(endian = 'be', length = 0) {
        return Buffer.from(this.toArray(endian, length));
      },
      fromTwos: function(width: number) {
        if (this.negative !== 0) {
          const val = -this.value - 1n;
          const mask = (1n << BigInt(width)) - 1n;
          return new mockBN((val & mask).toString());
        }
        return this.clone();
      },
      toTwos: function(width: number) {
        if (this.negative !== 0) {
          const val = -this.value - 1n;
          const mask = (1n << BigInt(width)) - 1n;
          return new mockBN((val & mask).toString());
        }
        return this.clone();
      },
      isNeg: function() {
        return this.negative !== 0;
      },
      clone: function() {
        return new mockBN(this.value.toString());
      }
    };
    
    instance._init(value);
    return instance;
  });

  // Add static methods as properties
  const mockBNConstructor = mockBN as any;
  mockBNConstructor.mont = vi.fn();
  mockBNConstructor.red = vi.fn();

  return { default: mockBNConstructor };
});

// Mock Anchor
vi.mock('@project-serum/anchor', async () => {
  const actual = await vi.importActual<typeof import('@project-serum/anchor')>('@project-serum/anchor');
  const { Connection } = await import('@solana/web3.js');
  const { BN } = await import('@project-serum/anchor');

  const mockProgram = {
    programId: new PublicKey(TEST_VALUES.PROGRAM_ID_STR),
    provider: {
      connection: new Connection('https://api.devnet.solana.com'),
      wallet: {
        publicKey: new PublicKey(TEST_VALUES.PROGRAM_ID_STR),
        signTransaction: vi.fn().mockImplementation(async (tx: Transaction) => tx),
        signAllTransactions: vi.fn().mockImplementation(async (txs: Transaction[]) => txs)
      }
    },
    rpc: {
      processPayment: vi.fn().mockImplementation(async (_args: any) => {
        return TEST_VALUES.MOCK_TX_SIG;
      })
    },
    account: {
      paymentAccount: {
        fetch: vi.fn().mockImplementation(async () => ({
          mint: new PublicKey(TEST_VALUES.RECEIVER_STR),
          authority: new PublicKey(TEST_VALUES.PROGRAM_ID_STR),
          amount: new BN(1000000),
          bump: 255
        }))
      }
    },
    instruction: {
      processPayment: vi.fn().mockImplementation((_args: any) => {
        return new TransactionInstruction({
          keys: [
            { pubkey: new PublicKey(TEST_VALUES.PROGRAM_ID_STR), isSigner: true, isWritable: true },
            { pubkey: new PublicKey(TEST_VALUES.RECEIVER_STR), isSigner: false, isWritable: true }
          ],
          programId: new PublicKey(TEST_VALUES.PROGRAM_ID_STR),
          data: Buffer.from([0])
        });
      })
    }
  };

  return {
    ...actual,
    Program: vi.fn().mockImplementation(() => mockProgram),
    BN: actual.BN,
    web3: actual.web3,
    utils: actual.utils,
    AnchorProvider: vi.fn().mockImplementation((connection, wallet, opts) => ({
      connection,
      wallet,
      opts,
      sendAndConfirm: vi.fn().mockResolvedValue(TEST_VALUES.MOCK_TX_SIG)
    }))
  };
});

// Mock @solana/web3.js
vi.mock('@solana/web3.js', async () => {
  const actual = await vi.importActual<typeof import('@solana/web3.js')>('@solana/web3.js');

  const LAMPORTS_PER_SOL = 1000000000;
  const BASE_FEE = 5000; // 5000 lamports base fee
  const COMPUTE_BUDGET_INSTRUCTION_LAYOUT = {
    index: 0,
    unitLimit: 0,
    additionalFee: 0,
    units: 0,
    microLamports: 0
  };

  const mockAccountInfo = () => ({
    executable: false,
    owner: new PublicKey(TEST_VALUES.PROGRAM_ID_STR),
    lamports: LAMPORTS_PER_SOL, // 1 SOL
    data: {
      parsed: {
        info: {
          mint: TEST_VALUES.RECEIVER_STR,
          owner: TEST_VALUES.PROGRAM_ID_STR,
          tokenAmount: {
            amount: '1000000',
            decimals: 6,
            uiAmount: 1,
            uiAmountString: '1'
          }
        },
        type: 'account'
      },
      program: 'spl-token',
      space: 165
    }
  });

  // Add mock methods to Connection.prototype
  actual.Connection.prototype.sendTransaction = vi.fn(async (
    transaction: Transaction | VersionedTransaction,
    _signersOrOptions?: Signer[] | SendOptions,
    _options?: SendOptions
  ): Promise<TransactionSignature> => {
    if (!transaction.signatures || transaction.signatures.length === 0) {
      throw new Error('Transaction has no signatures');
    }

    // Calculate fees
    const numSignatures = transaction.signatures.length;
    const baseFee = numSignatures * BASE_FEE;
    
    // Check if transaction has compute budget instructions
    let prioritizationFee = 0;
    if (transaction instanceof Transaction) {
      const computeBudgetInstructions = transaction.instructions.filter(
        ix => ix.programId.equals(actual.ComputeBudgetProgram.programId)
      );

      if (computeBudgetInstructions.length > 0) {
        // Parse compute budget instructions
        const unitLimitIx = computeBudgetInstructions.find(ix => 
          ix.data[0] === COMPUTE_BUDGET_INSTRUCTION_LAYOUT.unitLimit
        );
        const priceIx = computeBudgetInstructions.find(ix => 
          ix.data[0] === COMPUTE_BUDGET_INSTRUCTION_LAYOUT.microLamports
        );

        if (unitLimitIx && priceIx) {
          const units = unitLimitIx.data.readUInt32LE(1);
          const microLamports = priceIx.data.readUInt32LE(1);
          prioritizationFee = (units * microLamports) / 1000000;
        }
      }
    }

    const totalFee = baseFee + prioritizationFee;

    // Check if fee payer has enough balance
    let feePayer: PublicKey;
    if (transaction instanceof Transaction && transaction.feePayer) {
      feePayer = transaction.feePayer;
    } else if (transaction.signatures[0] && 'publicKey' in transaction.signatures[0]) {
      feePayer = transaction.signatures[0].publicKey;
    } else {
      throw new Error('No fee payer found');
    }

    const feePayerInfo = await actual.Connection.prototype.getParsedAccountInfo(feePayer);
    if (!feePayerInfo.value || feePayerInfo.value.lamports < totalFee) {
      throw new Error('Insufficient funds for fee');
    }

    return TEST_VALUES.MOCK_TX_SIG;
  }) as any;

  actual.Connection.prototype.confirmTransaction = vi.fn(async (
    _strategy: TransactionConfirmationStrategy | string,
    _commitment?: Commitment
  ): Promise<RpcResponseAndContext<SignatureResult>> => {
    return {
      context: { slot: 1 },
      value: { err: null }
    };
  }) as any;

  actual.Connection.prototype.getParsedAccountInfo = vi.fn().mockImplementation(async () => ({
    context: { slot: 1 },
    value: mockAccountInfo()
  }));

  actual.Connection.prototype.getLatestBlockhash = vi.fn().mockResolvedValue({
    blockhash: 'mock-blockhash',
    lastValidBlockHeight: 1000
  });

  actual.Connection.prototype.getMinimumBalanceForRentExemption = vi.fn(async (size: number) => {
    // Calculate minimum balance for rent exemption
    // Current rent rate is ~0.00000348 SOL per byte-year
    const LAMPORTS_PER_BYTE_YEAR = 3480;
    return Math.max(
      LAMPORTS_PER_BYTE_YEAR * size,
      LAMPORTS_PER_SOL / 100 // Minimum 0.01 SOL
    );
  });

  // Mock ComputeBudgetProgram
  const ComputeBudgetProgram = {
    ...actual.ComputeBudgetProgram,
    programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
    setComputeUnitLimit: ({ units }: { units: number }) => {
      const data = Buffer.alloc(5);
      data.writeUInt8(COMPUTE_BUDGET_INSTRUCTION_LAYOUT.unitLimit, 0);
      data.writeUInt32LE(units, 1);
      return {
        programId: ComputeBudgetProgram.programId,
        keys: [],
        data
      };
    },
    setComputeUnitPrice: ({ microLamports }: { microLamports: number }) => {
      const data = Buffer.alloc(5);
      data.writeUInt8(COMPUTE_BUDGET_INSTRUCTION_LAYOUT.microLamports, 0);
      data.writeUInt32LE(microLamports, 1);
      return {
        programId: ComputeBudgetProgram.programId,
        keys: [],
        data
      };
    }
  };

  return {
    ...actual,
    ComputeBudgetProgram,
    SystemProgram: {
      ...actual.SystemProgram,
      transfer: vi.fn().mockReturnValue(new TransactionInstruction({
        keys: [
          { pubkey: new PublicKey(TEST_VALUES.PROGRAM_ID_STR), isSigner: true, isWritable: true },
          { pubkey: new PublicKey(TEST_VALUES.RECEIVER_STR), isSigner: false, isWritable: true }
        ],
        programId: SystemProgram.programId,
        data: Buffer.from([2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) // Mock transfer instruction data
      }))
    }
  };
});
