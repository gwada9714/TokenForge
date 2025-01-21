import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest';
import { http } from 'viem'

// Polyfills pour TextEncoder/TextDecoder
class MockTextEncoder {
  encode(input: string): Uint8Array {
    return new Uint8Array(Buffer.from(input));
  }
}

class MockTextDecoder {
  decode(input?: BufferSource): string {
    if (!input) return '';
    return new TextDecoder().decode(input);
  }
}

global.TextEncoder = MockTextEncoder as any;
global.TextDecoder = MockTextDecoder as any;

// Mock de la configuration des chaînes
vi.mock('../config/chains', () => {
  return {
    default: {
      mainnet: {
        id: 1,
        name: 'Ethereum',
        network: 'mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://eth-mainnet.g.alchemy.com/v2/your-api-key'] },
        },
      },
    },
  }
})

// Mock des variables d'environnement
const mockEnv = {
  VITE_TOKEN_FACTORY_MAINNET: '0x1234567890123456789012345678901234567890',
  VITE_TOKEN_FACTORY_SEPOLIA: '0x1234567890123456789012345678901234567890',
  VITE_MAINNET_RPC_URL: 'https://eth-mainnet.mock.local',
  VITE_SEPOLIA_RPC_URL: 'https://eth-sepolia.mock.local',
  VITE_WALLET_CONNECT_PROJECT_ID: 'test-project-id'
};

// Configuration des variables d'environnement pour les tests
vi.mock('vite', () => ({
  defineConfig: vi.fn()
}));

Object.defineProperty(import.meta, 'env', {
  value: mockEnv
});

// Mock des services
vi.mock('../features/auth/services/notificationService', () => ({
  notificationService: {
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    notifyWalletConnected: vi.fn(),
    notifyWalletDisconnected: vi.fn(),
    notifyWrongNetwork: vi.fn(),
  },
}))

// Mock Web3Modal
vi.mock('@web3modal/wagmi', () => ({
  useWeb3Modal: () => ({
    open: vi.fn(),
    close: vi.fn(),
  }),
  createWeb3Modal: vi.fn(),
}));

// Mock Wagmi
vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi');
  return {
    ...actual,
    useAccount: () => ({
      address: '0x123',
      isConnecting: false,
      isDisconnected: false,
    }),
    getPublicClient: vi.fn().mockReturnValue({
      request: vi.fn(),
      getChainId: vi.fn().mockReturnValue(1),
      watchAsset: vi.fn(),
      watchContractEvent: vi.fn(),
      getBalance: vi.fn().mockResolvedValue(BigInt(0)),
      getBlockNumber: vi.fn().mockResolvedValue(BigInt(1)),
      getGasPrice: vi.fn().mockResolvedValue(BigInt(1000000000)),
    }),
    watchPublicClient: vi.fn().mockReturnValue(() => {}),
    getWalletClient: vi.fn().mockResolvedValue({
      account: {
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        type: 'json-rpc',
      },
      chain: { id: 1 },
      transport: http(),
    }),
  }
})

// Mock de window.ethereum
const mockEthereum = {
  isMetaMask: true,
  request: vi.fn().mockImplementation(async ({ method }) => {
    switch (method) {
      case 'eth_chainId':
        return '0x1' // mainnet par défaut
      case 'eth_requestAccounts':
        return ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']
      case 'eth_getBalance':
        return '0x0'
      default:
        return null
    }
  }),
  on: vi.fn(),
  removeListener: vi.fn(),
  autoRefreshOnNetworkChange: false,
  chainId: '0x1',
  networkVersion: '1',
  selectedAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
}

Object.defineProperty(window, 'ethereum', {
  value: mockEthereum,
  writable: true,
})

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0,
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
