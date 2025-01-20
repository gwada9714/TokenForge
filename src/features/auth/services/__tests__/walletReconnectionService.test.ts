import { vi } from 'vitest';
import { WalletReconnectionService } from '../walletReconnectionService';
import { getWalletClient, getAccount, type GetAccountReturnType, type Connector, type ConnectorEventMap } from '@wagmi/core';
import type { Chain } from 'viem';
import { EventEmitter } from 'events';

interface EmitterInterface<T> {
  on<K extends keyof T & string>(eventName: K, listener: (event: T[K]) => void): this;
  once<K extends keyof T & string>(eventName: K, listener: (event: T[K]) => void): this;
  off<K extends keyof T & string>(eventName: K, listener: (event: T[K]) => void): this;
  emit<K extends keyof T & string>(eventName: K, event: T[K]): boolean;
  removeAllListeners<K extends keyof T & string>(event?: K): this;
  listeners<K extends keyof T & string>(event: K): Array<(event: T[K]) => void>;
}

class TypedEventEmitter<T extends { [K in keyof T]: any }> extends EventEmitter implements EmitterInterface<T> {
  private _listeners: { [K in keyof T]?: Array<(event: T[K]) => void> } = {};

  on<K extends keyof T & string>(eventName: K, listener: (event: T[K]) => void): this {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName]?.push(listener);
    return super.on(eventName, listener);
  }

  once<K extends keyof T & string>(eventName: K, listener: (event: T[K]) => void): this {
    return super.once(eventName, listener);
  }

  off<K extends keyof T & string>(eventName: K, listener: (event: T[K]) => void): this {
    const listeners = this._listeners[eventName];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    return super.off(eventName, listener);
  }

  emit<K extends keyof T & string>(eventName: K, event: T[K]): boolean {
    return super.emit(eventName, event);
  }

  removeAllListeners<K extends keyof T & string>(event?: K): this {
    if (event) {
      delete this._listeners[event];
    } else {
      this._listeners = {};
    }
    return super.removeAllListeners(event);
  }

  listeners<K extends keyof T & string>(event: K): Array<(event: T[K]) => void> {
    return (this._listeners[event] || []) as Array<(event: T[K]) => void>;
  }
}

// Constantes de test
const TEST_ADDRESS = '0x123' as `0x${string}`;
const TEST_CHAIN_ID = 1;
const POLYGON_CHAIN_ID = 137;
const NETWORK_TIMEOUT = 10000;

// Helper pour créer un mock wallet client
const createMockWalletClient = (address = TEST_ADDRESS, chainId = TEST_CHAIN_ID) => ({
  account: { address },
  chain: { id: chainId },
  transport: {
    type: 'eip1193',
    request: vi.fn().mockResolvedValue(`0x${chainId.toString(16)}`),
  },
});

// Mock du connector avec emitter
const createMockConnector = (): Connector => {
  const emitter = new TypedEventEmitter<ConnectorEventMap>();
  const mockAddress = '0x123' as const;
  const mockChainId = 1;

  return {
    id: 'mock',
    name: 'Mock Connector',
    type: 'mock',
    uid: 'mock-1',
    ready: true,
    icon: undefined,
    rdns: undefined,
    supportsSimulation: false,
    emitter,
    connect: async () => {
      return {
        accounts: [mockAddress as `0x${string}`],
        chainId: mockChainId
      };
    },
    disconnect: async () => {
      return Promise.resolve();
    },
    isConnected: () => true,
    getProvider: () => Promise.resolve({}),
    getChainId: () => Promise.resolve(mockChainId),
    getAccount: () => ({ 
      address: mockAddress as `0x${string}`, 
      addresses: [mockAddress as `0x${string}`], 
      chainId: mockChainId, 
      connector: null 
    }),
    getAccounts: async () => [mockAddress as `0x${string}`],
    isAuthorized: async () => true,
    onAccountsChanged: (accounts: string[]) => {
      emitter.emit('change', {
        accounts: accounts as readonly `0x${string}`[],
        chainId: mockChainId
      });
    },
    onChainChanged: (chainId: string) => {
      emitter.emit('change', {
        accounts: [mockAddress as `0x${string}`],
        chainId: parseInt(chainId)
      });
    },
    onDisconnect: (error?: Error) => {
      emitter.emit('disconnect', { reason: error?.message || 'Disconnected' });
    },
    onMessage: (message: { type: string; data?: unknown }) => {
      emitter.emit('message', { type: message.type, data: message.data });
    },
    switchChain: async ({ chainId }: { chainId: number }) => {
      const chain: Chain = {
        id: chainId,
        name: `Chain ${chainId}`,
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: { http: [`https://rpc-${chainId}.example.com`] },
          public: { http: [`https://rpc-${chainId}.example.com`] },
        },
        blockExplorers: {
          default: {
            name: 'Explorer',
            url: `https://explorer-${chainId}.example.com`,
          },
        },
      };
      return Promise.resolve(chain);
    },
    watchAsset: async () => true,
    signMessage: async () => '0x',
    signTypedData: async () => '0x'
  };
};

// Mock de l'état du compte connecté
const mockConnectedAccount: GetAccountReturnType = {
  address: TEST_ADDRESS,
  addresses: [TEST_ADDRESS],
  chain: {
    id: TEST_CHAIN_ID,
    name: 'Ethereum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ['https://eth-mainnet.g.alchemy.com/v2'] },
      public: { http: ['https://eth-mainnet.g.alchemy.com/v2'] },
    },
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://etherscan.io',
      },
    },
  } as Chain,
  chainId: TEST_CHAIN_ID,
  connector: createMockConnector(),
  isConnected: true,
  isConnecting: false,
  isDisconnected: false,
  isReconnecting: false,
  status: 'connected' as const,
};

// Mock de l'ethereum provider
let mockEthereumProvider: {
  on: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  request: ReturnType<typeof vi.fn>;
};

// Helpers pour les tests
const flushPromisesAndTimers = async (timeout = 1000) => {
  await vi.advanceTimersByTimeAsync(0); // Résoudre les promesses initiales
  await vi.advanceTimersByTimeAsync(timeout); // Avancer les timers pour les timeouts
  await vi.advanceTimersByTimeAsync(0); // Résoudre les promesses finales
};

const simulateNetworkChange = async (newChainId: number) => {
  const chainChangedHandler = mockEthereumProvider.on.mock.calls.find(
    ([event]) => event === 'chainChanged'
  )?.[1];

  if (chainChangedHandler) {
    mockEthereumProvider.request.mockResolvedValueOnce(`0x${newChainId.toString(16)}`);
    await chainChangedHandler(`0x${newChainId.toString(16)}`);
    await flushPromisesAndTimers(0);
  }
};

const setupEthereumProvider = (chainId = TEST_CHAIN_ID) => {
  mockEthereumProvider = {
    on: vi.fn(),
    removeListener: vi.fn(),
    request: vi.fn().mockImplementation(async ({ method }) => {
      switch (method) {
        case 'eth_chainId':
          return `0x${chainId.toString(16)}`;
        case 'eth_blockNumber':
          return '0x1';
        default:
          return null;
      }
    }),
  };

  delete (window as any).ethereum;
  Object.defineProperty(window, 'ethereum', {
    value: mockEthereumProvider,
    writable: true,
    configurable: true,
  });
};

const connectWallet = async () => {
  const connectPromise = service.connect();
  await flushPromisesAndTimers();
  const connected = await connectPromise;
  return connected;
};

const verifyWalletState = (isConnected: boolean, address: string | null = null, chainId: number | null = null) => {
  expect(service.getWalletState().isConnected).toBe(isConnected);
  if (isConnected) {
    expect(service.getWalletClient()).toEqual(mockWalletClientInstance);
    expect(service.getProvider()).toBeDefined();
  }
  expect(mockTabSyncService.syncWalletState).toHaveBeenCalledWith({
    isConnected,
    address,
    chainId,
  });
};

// Mock de BrowserProvider
class MockBrowserProvider {
  constructor(provider: any) {
    Object.assign(this, {
      provider,
      getNetwork: vi.fn().mockResolvedValue({ chainId: TEST_CHAIN_ID }),
      detectNetwork: vi.fn().mockResolvedValue({ chainId: TEST_CHAIN_ID }),
    });
  }
}

// Mocks des services et modules
vi.mock('ethers', () => ({
  BrowserProvider: vi.fn().mockImplementation((provider) => new MockBrowserProvider(provider))
}));

vi.mock('@wagmi/core', () => ({
  getWalletClient: vi.fn(),
  getAccount: vi.fn(),
}));

const mockStorageService = {
  getWalletState: vi.fn(),
  recordNetworkChange: vi.fn(),
};

const mockTabSyncService = {
  onWalletStateChange: vi.fn(() => vi.fn()),
  syncWalletState: vi.fn(),
};

const mockNotificationService = {
  info: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
};

const mockLogService = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

const mockNetworkRetryService = {
  retryWithTimeout: vi.fn(),
};

// Variables pour les tests
let service: WalletReconnectionService;
let mockWalletClientInstance: any;

describe('WalletReconnectionService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    
    // Réinitialiser le service
    service = WalletReconnectionService.getInstance();

    // Configuration par défaut des mocks
    mockStorageService.getWalletState.mockResolvedValue({
      isConnected: false,
      address: null,
      chainId: null,
    });

    // Créer une nouvelle instance du mock wallet client
    mockWalletClientInstance = createMockWalletClient();

    // Mock de base pour getWalletClient et getAccount
    vi.mocked(getWalletClient).mockResolvedValue(mockWalletClientInstance);
    vi.mocked(getAccount).mockResolvedValue(mockConnectedAccount);

    // Configuration du provider ethereum
    setupEthereumProvider();

    // Configuration du mock de retryWithTimeout
    mockNetworkRetryService.retryWithTimeout.mockImplementation(async (fn) => {
      try {
        const result = await fn();
        return { success: true, result, attempts: 1 };
      } catch (error) {
        return { success: false, error, attempts: 1 };
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    service.disconnect();
    delete (window as any).ethereum;
  });

  describe('État du wallet', () => {
    it('devrait se connecter et se déconnecter', async () => {
      // Simuler une connexion réussie
      const connected = await connectWallet();
      expect(connected).toBe(true);
      verifyWalletState(true, TEST_ADDRESS, TEST_CHAIN_ID);

      // Simuler une déconnexion
      await service.disconnect();
      await flushPromisesAndTimers(0);
      verifyWalletState(false, null, null);
    }, NETWORK_TIMEOUT);

    it('devrait gérer l\'échec de connexion', async () => {
      // Simuler un échec de connexion
      mockNetworkRetryService.retryWithTimeout.mockImplementation(async () => {
        return { success: false, error: new Error('Connection failed'), attempts: 3 };
      });

      const connected = await connectWallet();
      expect(connected).toBe(false);
      verifyWalletState(false);
      expect(mockNotificationService.error).toHaveBeenCalled();
    }, NETWORK_TIMEOUT);

    it('devrait gérer les erreurs de provider', async () => {
      // Simuler une erreur de provider
      mockEthereumProvider.request.mockRejectedValueOnce(new Error('Provider error'));
      
      const connected = await connectWallet();
      expect(connected).toBe(false);
      verifyWalletState(false);
      expect(mockNotificationService.error).toHaveBeenCalled();
      expect(mockLogService.error).toHaveBeenCalledWith(
        'WalletReconnectionService',
        expect.any(String),
        expect.objectContaining({
          message: expect.stringContaining('Provider error'),
        })
      );
    }, NETWORK_TIMEOUT);

    it('devrait gérer les tentatives multiples de reconnexion', async () => {
      let attempts = 0;
      mockNetworkRetryService.retryWithTimeout.mockImplementation(async (fn) => {
        attempts++;
        if (attempts <= 2) {
          return { success: false, error: new Error('Connection failed'), attempts };
        }
        const result = await fn();
        return { success: true, result, attempts };
      });

      const connected = await connectWallet();
      expect(connected).toBe(true);
      expect(attempts).toBe(3);
      expect(mockNotificationService.info).toHaveBeenCalledTimes(3);
      expect(mockNotificationService.success).toHaveBeenCalledTimes(1);
    }, NETWORK_TIMEOUT);
  });

  describe('Gestion du réseau', () => {
    it('devrait gérer les changements de réseau', async () => {
      await connectWallet();

      // Mettre à jour le mock pour le nouveau chainId
      setupEthereumProvider(POLYGON_CHAIN_ID);

      // Simuler un changement de réseau
      await simulateNetworkChange(POLYGON_CHAIN_ID);
      await flushPromisesAndTimers();

      // Vérifier que l'état a été mis à jour
      expect(service.getWalletState().chainId).toBe(POLYGON_CHAIN_ID);
      expect(mockStorageService.recordNetworkChange).toHaveBeenCalledWith(
        TEST_CHAIN_ID,
        POLYGON_CHAIN_ID
      );
    }, NETWORK_TIMEOUT);

    it('devrait gérer les erreurs de latence réseau', async () => {
      await connectWallet();

      // Simuler une erreur lors de la mesure de latence
      mockEthereumProvider.request.mockRejectedValueOnce(new Error('Network error'));
      await simulateNetworkChange(POLYGON_CHAIN_ID);
      await flushPromisesAndTimers();

      // Vérifier que l'erreur est gérée correctement
      expect(mockLogService.error).toHaveBeenCalledWith(
        'WalletReconnectionService',
        'Error handling network change',
        expect.objectContaining({
          message: expect.stringContaining('Network error'),
        })
      );
    }, NETWORK_TIMEOUT);

    it('devrait rejeter les réseaux non supportés', async () => {
      await connectWallet();

      // Simuler un changement vers un réseau non supporté
      const unsupportedChainId = 999;
      setupEthereumProvider(unsupportedChainId);
      await simulateNetworkChange(unsupportedChainId);
      await flushPromisesAndTimers();

      // Vérifier que le changement est rejeté
      expect(service.getWalletState().chainId).toBe(TEST_CHAIN_ID); // Garde le réseau initial
      expect(mockNotificationService.error).toHaveBeenCalledWith(
        expect.stringContaining('Unsupported network'),
        expect.any(Object)
      );
    }, NETWORK_TIMEOUT);
  });
});
