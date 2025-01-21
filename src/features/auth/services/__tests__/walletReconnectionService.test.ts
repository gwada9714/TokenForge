import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WalletReconnectionService } from '../walletReconnectionService';
import { getWalletClient, getAccount, type GetAccountReturnType, type Connector } from '@wagmi/core';
import type { Chain } from 'viem';
import { EventEmitter } from 'events';
import { BrowserProvider } from 'ethers';

// Constantes de test
const TEST_ADDRESS = '0x123' as `0x${string}`;
const TEST_CHAIN_ID = 1;
const POLYGON_CHAIN_ID = 137;
const NETWORK_TIMEOUT = 10000;

// Helper pour créer une chaîne de test
const createTestChain = (chainId: number): Chain => ({
  id: chainId,
  name: chainId === TEST_CHAIN_ID ? 'Ethereum' : `Chain ${chainId}`,
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [chainId === TEST_CHAIN_ID ? 'https://eth-mainnet.g.alchemy.com/v2' : `https://rpc-${chainId}.example.com`] },
    public: { http: [chainId === TEST_CHAIN_ID ? 'https://eth-mainnet.g.alchemy.com/v2' : `https://rpc-${chainId}.example.com`] },
  },
  blockExplorers: {
    default: {
      name: chainId === TEST_CHAIN_ID ? 'Etherscan' : 'Explorer',
      url: chainId === TEST_CHAIN_ID ? 'https://etherscan.io' : `https://explorer-${chainId}.example.com`,
    },
  },
});

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
  const emitter = new EventEmitter();
  (emitter as any).uid = 'mock-emitter-' + Math.random().toString(36).substr(2, 9);
  (emitter as any)._emitter = emitter;

  return {
    id: 'mock',
    name: 'Mock Connector',
    type: 'mock',
    uid: 'mock-1',
    ready: true,
    icon: undefined,
    rdns: undefined,
    supportsSimulation: false,
    emitter: emitter as any,
    connect: async () => ({
      accounts: [TEST_ADDRESS],
      chainId: TEST_CHAIN_ID
    }),
    disconnect: async () => Promise.resolve(),
    isConnected: () => true,
    getProvider: () => Promise.resolve({}),
    getChainId: () => Promise.resolve(TEST_CHAIN_ID),
    getAccount: () => ({ 
      address: TEST_ADDRESS, 
      addresses: [TEST_ADDRESS], 
      chainId: TEST_CHAIN_ID, 
      connector: null 
    }),
    getAccounts: async () => [TEST_ADDRESS],
    isAuthorized: async () => true,
    onAccountsChanged: (accounts: string[]) => {
      emitter.emit('change', {
        accounts: accounts as readonly `0x${string}`[],
        chainId: TEST_CHAIN_ID
      });
    },
    onChainChanged: (chainId: string) => {
      emitter.emit('change', {
        accounts: [TEST_ADDRESS],
        chainId: parseInt(chainId)
      });
    },
    onDisconnect: () => {
      emitter.emit('disconnect');
    },
    onMessage: (message: { type: string; data?: unknown }) => {
      emitter.emit('message', { type: message.type, data: message.data });
    },
    switchChain: async ({ chainId }: { chainId: number }) => {
      return Promise.resolve(createTestChain(chainId));
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
  chain: createTestChain(TEST_CHAIN_ID),
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

async function connectWallet(): Promise<boolean> {
  const service = WalletReconnectionService.getInstance();
  await service.startReconnection();
  return service.getWalletState().isConnected;
}

function verifyWalletState(isConnected: boolean, address: string | null = null, chainId: number | null = null) {
  const service = WalletReconnectionService.getInstance();
  const state = service.getWalletState();
  expect(state.isConnected).toBe(isConnected);
  if (address !== null) {
    expect(state.address).toBe(address);
  }
  if (chainId !== null) {
    expect(state.chainId).toBe(chainId);
  }
}

// Mocks des services et modules
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
  emit: vi.fn(),
  off: vi.fn(),
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

  describe('Synchronisation entre onglets', () => {
    it('devrait synchroniser l\'état du wallet entre les onglets', async () => {
      const service = WalletReconnectionService.getInstance();
      await connectWallet();
      
      // Simuler un message de synchronisation d'un autre onglet
      const newState = {
        address: '0x456',
        chainId: POLYGON_CHAIN_ID,
        isConnected: true
      };
      
      // Émettre un événement de synchronisation
      mockTabSyncService.emit('walletSync', {
        type: 'walletStateSync',
        data: newState
      });
      
      await flushPromisesAndTimers();
      
      // Vérifier que l'état a été synchronisé
      const currentState = service.getWalletState();
      expect(currentState.address).toBe(newState.address);
      expect(currentState.chainId).toBe(newState.chainId);
      expect(currentState.isConnected).toBe(newState.isConnected);
    });

    it('devrait ignorer les messages de synchronisation du même onglet', async () => {
      await connectWallet();
      const initialState = service.getWalletState();
      
      // Simuler un message du même onglet
      mockTabSyncService.emit('walletSync', {
        type: 'walletStateSync',
        tabId: service.tabId, // Même tabId
        data: {
          address: '0x456',
          chainId: POLYGON_CHAIN_ID,
          isConnected: true
        }
      });
      
      await flushPromisesAndTimers();
      
      // Vérifier que l'état n'a pas changé
      const currentState = service.getWalletState();
      expect(currentState).toEqual(initialState);
    });
  });

  describe('Notifications en temps réel', () => {
    it('devrait notifier lors d\'un changement de réseau', async () => {
      await connectWallet();
      
      // Simuler un changement de réseau
      await simulateNetworkChange(POLYGON_CHAIN_ID);
      await flushPromisesAndTimers();
      
      // Vérifier les notifications
      expect(mockNotificationService.info).toHaveBeenCalledWith(
        expect.stringContaining('Switching network'),
        expect.any(Object)
      );
      expect(mockNotificationService.success).toHaveBeenCalledWith(
        expect.stringContaining('Successfully connected to Polygon'),
        expect.any(Object)
      );
    });

    it('devrait notifier lors d\'une tentative de reconnexion', async () => {
      // Simuler un échec de connexion suivi d'une réussite
      let attempts = 0;
      mockNetworkRetryService.retryWithTimeout.mockImplementation(async (fn) => {
        attempts++;
        if (attempts === 1) {
          return { success: false, error: new Error('Connection failed'), attempts };
        }
        const result = await fn();
        return { success: true, result, attempts };
      });

      await connectWallet();
      
      // Vérifier les notifications de tentative et de succès
      expect(mockNotificationService.info).toHaveBeenCalledWith(
        expect.stringContaining('Attempting to reconnect'),
        expect.any(Object)
      );
      expect(mockNotificationService.success).toHaveBeenCalledWith(
        expect.stringContaining('Successfully reconnected'),
        expect.any(Object)
      );
    });
  });

  describe('Performance et nettoyage', () => {
    it('devrait gérer la latence réseau', async () => {
      await connectWallet();
      
      // Mock de la mesure de latence
      mockEthereumProvider.request.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve('0x1'), 100);
        });
      });
      
      // Simuler un changement de réseau pour déclencher la mesure de latence
      await simulateNetworkChange(POLYGON_CHAIN_ID);
      await flushPromisesAndTimers();
      
      // Vérifier que le changement de réseau a été géré
      expect(mockLogService.info).toHaveBeenCalledWith(
        'WalletReconnectionService',
        expect.stringContaining('Network latency'),
        expect.any(Object)
      );
    });

    it('devrait nettoyer les ressources lors de la déconnexion', async () => {
      await connectWallet();
      
      // Ajouter quelques timeouts
      const service = WalletReconnectionService.getInstance();
      service.startReconnectionAttempts();
      
      // Déconnecter et vérifier le nettoyage
      service.disconnect();
      
      // Vérifier que les timeouts ont été nettoyés
      expect(service.hasActiveTimeouts()).toBe(false);
      expect(mockTabSyncService.off).toHaveBeenCalled();
    });
  });
});

import { walletReconnectionService } from '../walletReconnectionService';
import { errorService } from '../errorService';
import { AUTH_ERROR_CODES } from '../../errors/AuthError';

vi.mock('../errorService');

describe('WalletReconnectionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock de window.ethereum
    (global as any).ethereum = {
      request: vi.fn()
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
    delete (global as any).ethereum;
  });

  describe('validateNetworkBeforeConnect', () => {
    it('should validate correct network', async () => {
      // Arrange
      (global as any).ethereum.request
        .mockResolvedValueOnce('0x1'); // chainId pour Ethereum Mainnet

      // Act
      const result = await walletReconnectionService.validateNetworkBeforeConnect();

      // Assert
      expect(result).toBe(true);
      expect(global.ethereum.request).toHaveBeenCalledWith({
        method: 'eth_chainId'
      });
    });

    it('should attempt to switch network if incorrect', async () => {
      // Arrange
      (global as any).ethereum.request
        .mockResolvedValueOnce('0x2') // Mauvais réseau
        .mockResolvedValueOnce({}); // Succès du changement de réseau

      // Act
      const result = await walletReconnectionService.validateNetworkBeforeConnect();

      // Assert
      expect(result).toBe(true);
      expect(global.ethereum.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }]
      });
    });

    it('should handle missing provider', async () => {
      // Arrange
      delete (global as any).ethereum;

      // Act & Assert
      await expect(
        walletReconnectionService.validateNetworkBeforeConnect()
      ).rejects.toThrow();

      expect(errorService.createAuthError).toHaveBeenCalledWith(
        AUTH_ERROR_CODES.PROVIDER_ERROR,
        expect.any(String)
      );
    });

    it('should handle network switch failure', async () => {
      // Arrange
      const switchError = { code: 4902 }; // Code pour réseau non configuré
      (global as any).ethereum.request
        .mockResolvedValueOnce('0x2') // Mauvais réseau
        .mockRejectedValueOnce(switchError); // Échec du changement

      // Act & Assert
      await expect(
        walletReconnectionService.validateNetworkBeforeConnect()
      ).rejects.toThrow();

      expect(errorService.createAuthError).toHaveBeenCalledWith(
        AUTH_ERROR_CODES.NETWORK_MISMATCH,
        expect.any(String)
      );
    });
  });

  describe('reconnectWallet', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should reconnect successfully', async () => {
      // Arrange
      (global as any).ethereum.request
        .mockResolvedValueOnce('0x1') // chainId
        .mockResolvedValueOnce(['0x123']); // accounts

      // Act
      const result = await walletReconnectionService.reconnectWallet();

      // Assert
      expect(result).toBe(true);
    });

    it('should handle max reconnection attempts', async () => {
      // Arrange
      const error = new Error('Connection failed');
      (global as any).ethereum.request.mockRejectedValue(error);

      // Act & Assert
      for (let i = 0; i < 3; i++) {
        await expect(walletReconnectionService.reconnectWallet()).rejects.toThrow();
      }

      // Quatrième tentative devrait échouer avec max attempts
      await expect(walletReconnectionService.reconnectWallet()).rejects.toThrow();
      expect(errorService.createAuthError).toHaveBeenCalledWith(
        AUTH_ERROR_CODES.WALLET_DISCONNECTED,
        expect.any(String)
      );
    });

    it('should handle reconnection attempts with interval', () => {
      // Arrange
      const error = new Error('Connection failed');
      (global as any).ethereum.request.mockRejectedValue(error);

      // Act
      walletReconnectionService.startReconnectionAttempts();
      vi.advanceTimersByTime(5000); // 5 secondes

      // Assert
      expect(global.ethereum.request).toHaveBeenCalled();
    });

    it('should stop reconnection attempts', () => {
      // Arrange
      walletReconnectionService.startReconnectionAttempts();

      // Act
      walletReconnectionService.stopReconnectionAttempts();
      vi.advanceTimersByTime(5000); // 5 secondes

      // Assert
      expect(global.ethereum.request).not.toHaveBeenCalled();
    });
  });

  describe('isCorrectNetwork', () => {
    it('should validate Ethereum mainnet', () => {
      expect(walletReconnectionService.isCorrectNetwork(1)).toBe(true);
      expect(walletReconnectionService.isCorrectNetwork(2)).toBe(false);
    });
  });
});
