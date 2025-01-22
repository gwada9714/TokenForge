import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { providers } from 'ethers';
import { ChainId, EVMChainConfig } from '../../../types/Chain';

export const mockChainConfig: EVMChainConfig = {
  id: ChainId.POLYGON,
  chainId: 137,
  networkId: 137,
  name: 'Polygon',
  rpcUrls: ['https://polygon-rpc.com'],
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  blockExplorerUrls: ['https://polygonscan.com'],
  testnet: false,
};

export const mockSigner = {
  _isSigner: true,
  provider: null,
  sendTransaction: vi.fn().mockResolvedValue({ hash: '0x123' }),
  getAddress: vi.fn().mockResolvedValue('0x742d35Cc6634C0532925a3b844Bc454e4438f44e'),
  connect: vi.fn().mockReturnThis(),
  getChainId: vi.fn().mockResolvedValue(137),
};

// Create a proper mock of the JsonRpcProvider
export const mockProvider = mock<providers.JsonRpcProvider>({
  _isProvider: true,
  getBalance: vi.fn().mockResolvedValue('1000000000000000000'),
  getGasPrice: vi.fn().mockResolvedValue('50000000000'),
  estimateGas: vi.fn().mockResolvedValue('21000'),
  getSigner: vi.fn().mockReturnValue(mockSigner),
  getNetwork: vi.fn().mockResolvedValue({ chainId: 137, name: 'matic' }),
  getFeeData: vi.fn().mockResolvedValue({
    gasPrice: '50000000000',
    maxFeePerGas: null,
    maxPriorityFeePerGas: null,
  }),
  sendTransaction: vi.fn().mockResolvedValue({ hash: '0x123' }),
  getBlockWithTransactions: vi.fn().mockResolvedValue({
    hash: '0x123',
    number: 1,
    transactions: [],
  }),
  connection: {
    url: 'https://polygon-rpc.com'
  }
});
