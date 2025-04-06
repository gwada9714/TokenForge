import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { tabSyncService } from "../tabSyncService";
import { AUTH_ACTIONS } from "../../actions/authActions";

// Mock BroadcastChannel
class MockBroadcastChannel {
  private listeners: { [key: string]: ((event: any) => void)[] } = {};

  constructor(public readonly name: string) {}

  addEventListener(type: string, callback: (event: any) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  postMessage(data: any) {
    if (this.listeners.message) {
      this.listeners.message.forEach((callback) => {
        callback({ data });
      });
    }
  }

  close() {
    this.listeners = {};
  }
}

// Mock window.crypto.randomUUID
const mockUUID = "12345-test-uuid";
vi.stubGlobal("crypto", {
  randomUUID: () => mockUUID,
});

describe("TabSyncService", () => {
  let originalBroadcastChannel: any;
  let mockChannel: MockBroadcastChannel;

  beforeEach(() => {
    originalBroadcastChannel = global.BroadcastChannel;
    mockChannel = new MockBroadcastChannel("tokenforge_auth_sync");
    // @ts-ignore
    global.BroadcastChannel = vi.fn().mockImplementation(() => mockChannel);
  });

  afterEach(() => {
    global.BroadcastChannel = originalBroadcastChannel;
    tabSyncService.close();
  });

  it("devrait initialiser correctement le service", () => {
    expect(tabSyncService).toBeDefined();
  });

  it("devrait synchroniser l'état d'authentification", () => {
    const callback = vi.fn();
    tabSyncService.subscribe(callback);

    const mockState = {
      uid: "123",
      email: "test@example.com",
      emailVerified: true,
      lastLoginTime: Date.now(),
    };

    tabSyncService.syncAuthState(mockState);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: mockState,
        tabId: mockUUID,
      })
    );
  });

  it("devrait synchroniser l'état du wallet", () => {
    const callback = vi.fn();
    tabSyncService.subscribe(callback);

    const mockWalletState = {
      isConnected: true,
      address: "0x123",
      chainId: 1,
    };

    tabSyncService.syncWalletState(mockWalletState);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: AUTH_ACTIONS.WALLET_CONNECT,
        payload: mockWalletState,
        tabId: mockUUID,
      })
    );
  });

  it("devrait gérer les conflits d'état correctement", () => {
    const callback = vi.fn();
    tabSyncService.subscribe(callback);

    const oldState = {
      uid: "123",
      lastLoginTime: 1000,
    };

    const newState = {
      uid: "123",
      lastLoginTime: 2000,
    };

    // Simuler un état existant
    tabSyncService.syncAuthState(oldState);

    // Simuler un message d'un autre onglet
    mockChannel.postMessage({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: newState,
      timestamp: Date.now(),
      tabId: "other-tab",
    });

    expect(callback).toHaveBeenLastCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          lastLoginTime: 2000,
        }),
      })
    );
  });

  it("devrait ignorer les messages plus anciens", () => {
    const callback = vi.fn();
    tabSyncService.subscribe(callback);

    const oldTimestamp = Date.now() - 1000;

    mockChannel.postMessage({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: { uid: "123" },
      timestamp: oldTimestamp,
      tabId: "other-tab",
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
