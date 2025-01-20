import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWalletClient, getAccount } from '@wagmi/core';
import { mainnet } from '@wagmi/core/chains';
import { BrowserProvider } from 'ethers';
import { WalletReconnectionService } from '../walletReconnectionService';
import { storageService } from '../storageService';
import { logService } from '../logService';
import { type WalletClient } from 'viem';
import { EventEmitter } from 'events';
import type { Connector } from '@wagmi/core';

// Mock des services
vi.mock('../storageService');
vi.mock('@wagmi/core', () => ({
  getWalletClient: vi.fn(),
  getAccount: vi.fn(),
}));
vi.mock('../logService', () => ({
  logService: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('WalletReconnectionService', () => {
  const mockAddress = '0x123' as `0x${string}`;
  const mockChainId = mainnet.id;
  const mockWalletClient = {
    account: { address: mockAddress },
    chain: { id: mockChainId },
  } as WalletClient;

  const createMockConnector = () => {
    const emitter = new EventEmitter();
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
      removeAllListeners: (event?: string) => {
        emitter.removeAllListeners(event);
        return mockEmitter;
      },
      listenerCount: (event: string) => emitter.listenerCount(event)
    };

    return {
      id: 'mock',
      name: 'Mock Wallet',
      type: 'injected',
      uid: 'mock-connector',
      emitter: mockEmitter as unknown as Connector['emitter'],
      connect: async () => ({ accounts: [mockAddress], chainId: mockChainId }),
      disconnect: async () => {},
      getAccounts: async () => [mockAddress],
      getChainId: async () => mockChainId,
      getProvider: async () => ({}),
      isAuthorized: async () => true,
      switchChain: async ({ chainId }) => ({
        ...mainnet,
        id: chainId,
        name: 'Ethereum',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: { http: ['https://ethereum.publicnode.com'] },
          public: { http: ['https://ethereum.publicnode.com'] },
        },
        blockExplorers: {
          default: {
            name: 'Etherscan',
            url: 'https://etherscan.io',
          },
        },
      }),
      watchAsset: async () => true,
      onAccountsChanged: () => {},
      onChainChanged: () => {},
      onDisconnect: () => {},
    } as unknown as Connector;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(getWalletClient).mockResolvedValue(mockWalletClient);
    vi.mocked(getAccount).mockResolvedValue({
      address: mockAddress,
      addresses: [mockAddress],
      chain: mainnet,
      chainId: mockChainId,
      connector: createMockConnector(),
      isConnected: true,
      isConnecting: false,
      isDisconnected: false,
      isReconnecting: false,
      status: 'connected' as const
    });
    vi.mocked(storageService.getWalletState).mockResolvedValue({
      address: mockAddress,
      chainId: mockChainId,
      isConnected: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Reconnexion', () => {
    it('devrait tenter la reconnexion avec succès', async () => {
      const service = WalletReconnectionService.getInstance();
      const onConnect = vi.fn();
      const onDisconnect = vi.fn();

      await service.attemptReconnection(onConnect, onDisconnect);

      expect(onConnect).toHaveBeenCalledWith(
        mockAddress,
        mockChainId,
        mockWalletClient,
        expect.any(BrowserProvider)
      );
      expect(onDisconnect).not.toHaveBeenCalled();
    });

    it('devrait gérer l\'échec de reconnexion', async () => {
      const service = WalletReconnectionService.getInstance();
      const onConnect = vi.fn();
      const onDisconnect = vi.fn();
      const mockError = new Error('Connection failed');

      vi.mocked(getWalletClient).mockRejectedValueOnce(mockError);

      await service.attemptReconnection(onConnect, onDisconnect);

      expect(onConnect).not.toHaveBeenCalled();
      expect(onDisconnect).toHaveBeenCalled();
      expect(logService.error).toHaveBeenCalledWith(
        'WalletReconnectionService',
        'Reconnection failed',
        expect.objectContaining({
          name: 'ReconnectionError',
          message: mockError.message,
        })
      );
    });
  });
});
