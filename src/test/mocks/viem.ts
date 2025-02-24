import { vi } from 'vitest';
import { 
  Address, 
  Hash,
  PublicClient,
  WalletClient
} from 'viem';

const mockChain = {
  id: 1,
  name: 'Mock Chain',
  network: 'mock',
  nativeCurrency: {
    name: 'Mock Token',
    symbol: 'MOCK',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
    public: { http: ['http://localhost:8545'] },
  },
} as const;

export const mockPublicClient = {
  account: undefined,
  batch: undefined,
  cacheTime: 4_000,
  chain: mockChain,
  key: 'mock',
  name: 'Mock Client',
  pollingInterval: 4_000,
  type: 'publicClient',
  uid: 'mock',
  readContract: vi.fn(),
  simulateContract: vi.fn(),
  watchContractEvent: vi.fn(),
  getGasPrice: vi.fn(),
  estimateContractGas: vi.fn()
} as unknown as PublicClient & {
  readContract: ReturnType<typeof vi.fn>;
  simulateContract: ReturnType<typeof vi.fn>;
  watchContractEvent: ReturnType<typeof vi.fn>;
  getGasPrice: ReturnType<typeof vi.fn>;
  estimateContractGas: ReturnType<typeof vi.fn>;
};

const mockAccount = {
  address: '0x1234567890123456789012345678901234567890' as Address,
  type: 'json-rpc'
} as const;

export const mockWalletClient = {
  account: mockAccount,
  batch: undefined,
  cacheTime: 4_000,
  chain: mockChain,
  key: 'mock',
  name: 'Mock Wallet Client',
  pollingInterval: 4_000,
  type: 'walletClient',
  uid: 'mock',
  writeContract: vi.fn().mockResolvedValue('0xmocktxhash' as Hash),
  estimateContractGas: vi.fn()
} as unknown as WalletClient & {
  writeContract: ReturnType<typeof vi.fn>;
  estimateContractGas: ReturnType<typeof vi.fn>;
};

export const mockContractEvent = {
  args: [] as unknown[],
  data: '0x',
  topics: [] as string[],
  blockNumber: 1n,
  transactionHash: '0xmocktxhash' as Hash
};
