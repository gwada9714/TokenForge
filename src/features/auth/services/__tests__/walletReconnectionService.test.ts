import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWalletClient, watchAccount } from '@wagmi/core';
import { mainnet } from '@wagmi/core/chains';
import { BrowserProvider } from 'ethers';
import { WalletReconnectionService } from '../walletReconnectionService';
import { storageService } from '../storageService';
import { type WalletClient } from 'viem';
import type { Connector } from '@wagmi/core';
import { EventEmitter } from 'events';

// Mock des services
vi.mock('../storageService');
vi.mock('@wagmi/core');

describe('WalletReconnectionService', () => {
  const mockAddress = '0x123' as `0x${string}`;
  const mockChainId = mainnet.id;
  const mockWalletClient = {
    account: { address: mockAddress },
    chain: { id: mockChainId },
  } as WalletClient;
  const mockProvider = {} as BrowserProvider;

  // Mock du Connector de base
  const createMockConnector = (): Connector => {
    const emitter = new EventEmitter();
    
    // Créer un mock de l'emitter qui implémente seulement les méthodes nécessaires
    const mockEmitter = {
      uid: 'mock-emitter',
      _emitter: emitter,
      on: (event: string, listener: (...args: any[]) => void) => {
        emitter.on(event, listener);
        return mockEmitter;
      },
      once: (event: string, listener: (...args: any[]) => void) => {
        emitter.once(event, listener);
        return mockEmitter;
      },
      off: (event: string, listener: (...args: any[]) => void) => {
        emitter.off(event, listener);
        return mockEmitter;
      },
      emit: (event: string, ...args: any[]) => {
        return emitter.emit(event, ...args);
      },
      listenerCount: (event: string) => emitter.listenerCount(event)
    } as unknown as Connector['emitter'];
    
    return {
      uid: 'mock-connector',
      id: 'mock',
      name: 'Mock Wallet',
      type: 'injected',
      ready: true,
      icon: undefined,
      rdns: undefined,
      supportsSimulation: false,
      emitter: mockEmitter,

      async connect() {
        return { accounts: [mockAddress], chainId: mockChainId };
      },

      async disconnect() {},

      async getAccounts() {
        return [mockAddress];
      },

      async getChainId() {
        return mockChainId;
      },

      async getProvider() {
        return {};
      },

      async isAuthorized() {
        return true;
      },

      async switchChain({ chainId }) {
        return { ...mainnet, id: chainId };
      },

      // Ces méthodes sont des handlers, pas des listeners
      onAccountsChanged(accounts: string[]) {
        mockEmitter.emit('connect', {
          accounts: accounts.map(addr => addr as `0x${string}`) as readonly `0x${string}`[],
          chainId: mockChainId
        });
      },

      onChainChanged(chainId: string) {
        mockEmitter.emit('change', { chainId: parseInt(chainId) });
      },

      onDisconnect() {
        mockEmitter.emit('disconnect');
      },

      onMessage() {},

      // Méthodes supplémentaires requises par l'interface
      async addChain() {},
      async watchAsset() { return true; },
      async getWalletClient() { return mockWalletClient; },
      async getSigner() { return {}; }
    };
  };

  const watchAccountCleanup = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Mock de getWalletClient
    vi.mocked(getWalletClient).mockResolvedValue(mockWalletClient);

    // Mock de watchAccount avec des états simplifiés
    vi.mocked(watchAccount).mockImplementation((_config, { onChange }) => {
      setTimeout(() => {
        // Simuler une connexion réussie
        onChange({
          address: mockAddress,
          addresses: [mockAddress],
          chain: mainnet,
          chainId: mockChainId,
          connector: createMockConnector(),
          isConnected: true as const,
          isConnecting: false as const,
          isDisconnected: false as const,
          isReconnecting: false as const,
          status: 'connected' as const
        }, {
          address: undefined,
          addresses: undefined,
          chain: undefined,
          chainId: undefined,
          connector: undefined,
          isConnected: false as const,
          isConnecting: true as const,
          isDisconnected: false as const,
          isReconnecting: false as const,
          status: 'connecting' as const
        });
      }, 50);
      return watchAccountCleanup;
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it('devrait se connecter avec succès', async () => {
    const service = WalletReconnectionService.getInstance();
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();

    // Mock de connectWithTimeout
    vi.spyOn(service as any, 'connectWithTimeout').mockResolvedValue({
      walletClient: mockWalletClient,
      provider: mockProvider,
      chainId: mockChainId
    });

    await service.attemptReconnection(onConnect, onDisconnect);
    await vi.advanceTimersByTimeAsync(100);

    expect(onConnect).toHaveBeenCalledWith(
      mockAddress,
      mockChainId,
      expect.anything(),
      expect.anything()
    );
    expect(onDisconnect).not.toHaveBeenCalled();
    expect(storageService.saveWalletState).toHaveBeenCalledWith({
      address: mockAddress,
      chainId: mockChainId,
      isConnected: true,
      isCorrectNetwork: true
    });
  });

  it('devrait gérer le changement de réseau', async () => {
    const service = WalletReconnectionService.getInstance();
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    const unsupportedChainId = 999;

    // Mock initial pour une connexion réussie
    vi.spyOn(service as any, 'connectWithTimeout').mockResolvedValueOnce({
      walletClient: mockWalletClient,
      provider: mockProvider,
      chainId: unsupportedChainId
    });

    await service.attemptReconnection(onConnect, onDisconnect);
    await vi.advanceTimersByTimeAsync(100);

    expect(onDisconnect).toHaveBeenCalled();
    expect(storageService.saveWalletState).toHaveBeenCalledWith({
      isConnected: false,
      chainId: null,
      address: null,
      isCorrectNetwork: false
    });
  });

  it('devrait gérer la déconnexion du wallet', async () => {
    const service = WalletReconnectionService.getInstance();
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();

    // Mock de watchAccount pour simuler une déconnexion
    vi.mocked(watchAccount).mockImplementationOnce((_config, { onChange }) => {
      setTimeout(() => {
        // Simuler une connexion suivie d'une déconnexion
        onChange({
          address: mockAddress,
          addresses: [mockAddress],
          chain: mainnet,
          chainId: mockChainId,
          connector: createMockConnector(),
          isConnected: true as const,
          isConnecting: false as const,
          isDisconnected: false as const,
          isReconnecting: false as const,
          status: 'connected' as const
        }, {
          address: undefined,
          addresses: undefined,
          chain: undefined,
          chainId: undefined,
          connector: undefined,
          isConnected: false as const,
          isConnecting: false as const,
          isDisconnected: true as const,
          isReconnecting: false as const,
          status: 'disconnected' as const
        });
        setTimeout(() => {
          onChange({
            address: undefined,
            addresses: undefined,
            chain: undefined,
            chainId: undefined,
            connector: undefined,
            isConnected: false as const,
            isConnecting: false as const,
            isDisconnected: true as const,
            isReconnecting: false as const,
            status: 'disconnected' as const
          }, {
            address: mockAddress,
            addresses: [mockAddress],
            chain: mainnet,
            chainId: mockChainId,
            connector: createMockConnector(),
            isConnected: true as const,
            isConnecting: false as const,
            isDisconnected: false as const,
            isReconnecting: false as const,
            status: 'connected' as const
          });
        }, 50);
      }, 50);
      return watchAccountCleanup;
    });

    await service.attemptReconnection(onConnect, onDisconnect);
    await vi.advanceTimersByTimeAsync(150);

    expect(onDisconnect).toHaveBeenCalled();
    expect(storageService.saveWalletState).toHaveBeenLastCalledWith({
      address: null,
      chainId: null,
      isConnected: false,
      isCorrectNetwork: false
    });
  });
});
