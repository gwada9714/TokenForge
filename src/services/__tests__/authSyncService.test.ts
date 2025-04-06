import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthSyncService } from "../authSyncService";
import { BroadcastChannel } from "broadcast-channel";
import { AuthState } from "@/types/authTypes";

vi.mock("broadcast-channel", () => ({
  BroadcastChannel: vi.fn(),
}));

describe("AuthSyncService", () => {
  let authSyncService: AuthSyncService;
  let mockBroadcastChannel: any;
  let mockCallback: vi.Mock;

  const mockAuthState: AuthState = {
    isAuthenticated: true,
    user: {
      uid: "test-uid",
      email: "test@example.com",
      emailVerified: true,
    },
    loading: false,
    error: null,
  };

  beforeEach(() => {
    mockCallback = vi.fn();
    mockBroadcastChannel = {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
    };

    vi.mocked(BroadcastChannel).mockImplementation(() => mockBroadcastChannel);

    authSyncService = new AuthSyncService();
  });

  describe("initialization", () => {
    it("creates a broadcast channel with correct name", () => {
      expect(BroadcastChannel).toHaveBeenCalledWith("auth-sync-channel");
    });
  });

  describe("subscribeToAuthChanges", () => {
    it("adds event listener for auth state changes", () => {
      authSyncService.subscribeToAuthChanges(mockCallback);

      expect(mockBroadcastChannel.addEventListener).toHaveBeenCalledWith(
        "message",
        expect.any(Function)
      );
    });

    it("calls callback when receiving auth state message", () => {
      authSyncService.subscribeToAuthChanges(mockCallback);

      // Get the event listener callback
      const [, listener] = mockBroadcastChannel.addEventListener.mock.calls[0];

      // Simulate receiving a message
      listener({ type: "auth-state-change", data: mockAuthState });

      expect(mockCallback).toHaveBeenCalledWith(mockAuthState);
    });

    it("ignores messages with wrong type", () => {
      authSyncService.subscribeToAuthChanges(mockCallback);

      const [, listener] = mockBroadcastChannel.addEventListener.mock.calls[0];
      listener({ type: "wrong-type", data: mockAuthState });

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe("broadcastAuthState", () => {
    it("broadcasts auth state to other tabs", () => {
      authSyncService.broadcastAuthState(mockAuthState);

      expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
        type: "auth-state-change",
        data: mockAuthState,
      });
    });

    it("handles broadcast errors", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Broadcast failed");

      mockBroadcastChannel.postMessage.mockRejectedValue(error);

      authSyncService.broadcastAuthState(mockAuthState);

      expect(consoleError).toHaveBeenCalledWith(
        "Error broadcasting auth state:",
        error
      );
    });
  });

  describe("unsubscribeFromAuthChanges", () => {
    it("removes event listener", () => {
      const callback = vi.fn();
      authSyncService.subscribeToAuthChanges(callback);
      authSyncService.unsubscribeFromAuthChanges(callback);

      expect(mockBroadcastChannel.removeEventListener).toHaveBeenCalledWith(
        "message",
        expect.any(Function)
      );
    });
  });

  describe("cleanup", () => {
    it("closes broadcast channel", () => {
      authSyncService.cleanup();

      expect(mockBroadcastChannel.close).toHaveBeenCalled();
    });

    it("handles cleanup errors", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Cleanup failed");

      mockBroadcastChannel.close.mockRejectedValue(error);

      authSyncService.cleanup();

      expect(consoleError).toHaveBeenCalledWith(
        "Error cleaning up AuthSyncService:",
        error
      );
    });
  });
});
