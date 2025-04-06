import { describe, it, expect, vi, beforeEach } from "vitest";
import { sessionService } from "../sessionService";
import { getAuth } from "firebase-admin/auth";
import { SecureStorageService } from "@/services/secureStorageService";
import { TokenForgeError } from "@/utils/errors";

// Mock Firebase Admin
vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn(),
    createCustomToken: vi.fn(),
  })),
}));

// Mock SecureStorage
vi.mock("@/services/secureStorageService", () => ({
  SecureStorageService: vi.fn(() => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })),
}));

describe("Session Service", () => {
  let mockStorage: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Firebase Admin mock
    vi.mocked(getAuth).mockReturnValue({
      verifyIdToken: vi.fn().mockResolvedValue({
        uid: "test-uid",
        email: "test@example.com",
      }),
      createCustomToken: vi.fn().mockResolvedValue("custom-token"),
    } as any);

    // Setup SecureStorage mock
    mockStorage = new SecureStorageService("test-key");
  });

  describe("createSession", () => {
    it("creates a new session successfully", async () => {
      const userData = {
        uid: "test-uid",
        email: "test@example.com",
      };

      const session = await sessionService.createSession(userData);

      expect(session).toBeDefined();
      expect(session.token).toBeDefined();
      expect(session.expiresAt).toBeDefined();
      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it("includes custom claims in session", async () => {
      const userData = {
        uid: "test-uid",
        email: "test@example.com",
        customClaims: {
          isAdmin: true,
        },
      };

      const session = await sessionService.createSession(userData);

      expect(session.isAdmin).toBe(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ isAdmin: true })
      );
    });

    it("handles session creation errors", async () => {
      vi.mocked(getAuth().createCustomToken).mockRejectedValueOnce(
        new Error("Token creation failed")
      );

      const userData = {
        uid: "test-uid",
        email: "test@example.com",
      };

      await expect(sessionService.createSession(userData)).rejects.toThrow(
        TokenForgeError
      );
    });
  });

  describe("validateSession", () => {
    it("validates an active session", async () => {
      const mockSession = {
        token: "valid-token",
        expiresAt: Date.now() + 3600000, // 1 hour from now
        uid: "test-uid",
      };

      vi.mocked(mockStorage.getItem).mockReturnValueOnce(mockSession);

      const isValid = await sessionService.validateSession("valid-token");
      expect(isValid).toBe(true);
    });

    it("detects expired session", async () => {
      const mockSession = {
        token: "expired-token",
        expiresAt: Date.now() - 3600000, // 1 hour ago
        uid: "test-uid",
      };

      vi.mocked(mockStorage.getItem).mockReturnValueOnce(mockSession);

      const isValid = await sessionService.validateSession("expired-token");
      expect(isValid).toBe(false);
    });

    it("handles invalid session token", async () => {
      vi.mocked(mockStorage.getItem).mockReturnValueOnce(null);

      const isValid = await sessionService.validateSession("invalid-token");
      expect(isValid).toBe(false);
    });
  });

  describe("refreshSession", () => {
    it("refreshes an active session", async () => {
      const mockSession = {
        token: "valid-token",
        expiresAt: Date.now() + 3600000,
        uid: "test-uid",
      };

      vi.mocked(mockStorage.getItem).mockReturnValueOnce(mockSession);

      const newSession = await sessionService.refreshSession("valid-token");
      expect(newSession.token).toBeDefined();
      expect(newSession.expiresAt).toBeGreaterThan(mockSession.expiresAt);
    });

    it("fails to refresh expired session", async () => {
      const mockSession = {
        token: "expired-token",
        expiresAt: Date.now() - 3600000,
        uid: "test-uid",
      };

      vi.mocked(mockStorage.getItem).mockReturnValueOnce(mockSession);

      await expect(
        sessionService.refreshSession("expired-token")
      ).rejects.toThrow(TokenForgeError);
    });

    it("handles refresh errors", async () => {
      vi.mocked(getAuth().createCustomToken).mockRejectedValueOnce(
        new Error("Token refresh failed")
      );

      const mockSession = {
        token: "valid-token",
        expiresAt: Date.now() + 3600000,
        uid: "test-uid",
      };

      vi.mocked(mockStorage.getItem).mockReturnValueOnce(mockSession);

      await expect(
        sessionService.refreshSession("valid-token")
      ).rejects.toThrow(TokenForgeError);
    });
  });

  describe("invalidateSession", () => {
    it("invalidates an active session", async () => {
      const token = "valid-token";
      await sessionService.invalidateSession(token);

      expect(mockStorage.removeItem).toHaveBeenCalledWith(
        expect.stringContaining(token)
      );
    });

    it("handles already invalidated session", async () => {
      vi.mocked(mockStorage.removeItem).mockRejectedValueOnce(
        new Error("Session not found")
      );

      await expect(
        sessionService.invalidateSession("invalid-token")
      ).resolves.not.toThrow();
    });
  });

  describe("getSessionData", () => {
    it("retrieves session data", async () => {
      const mockSession = {
        token: "valid-token",
        expiresAt: Date.now() + 3600000,
        uid: "test-uid",
        email: "test@example.com",
      };

      vi.mocked(mockStorage.getItem).mockReturnValueOnce(mockSession);

      const sessionData = await sessionService.getSessionData("valid-token");
      expect(sessionData).toEqual(mockSession);
    });

    it("returns null for invalid session", async () => {
      vi.mocked(mockStorage.getItem).mockReturnValueOnce(null);

      const sessionData = await sessionService.getSessionData("invalid-token");
      expect(sessionData).toBeNull();
    });
  });

  describe("validateMultiTabSession", () => {
    it("validates session across tabs", async () => {
      const mockSession = {
        token: "valid-token",
        expiresAt: Date.now() + 3600000,
        uid: "test-uid",
      };

      vi.mocked(mockStorage.getItem).mockReturnValueOnce(mockSession);

      // Simulate browser storage event
      const storageEvent = new StorageEvent("storage", {
        key: "session_valid-token",
        newValue: JSON.stringify(mockSession),
      });
      window.dispatchEvent(storageEvent);

      const isValid = await sessionService.validateMultiTabSession(
        "valid-token"
      );
      expect(isValid).toBe(true);
    });

    it("detects session invalidation from other tab", async () => {
      // Simulate session invalidation from another tab
      const storageEvent = new StorageEvent("storage", {
        key: "session_valid-token",
        newValue: null,
      });
      window.dispatchEvent(storageEvent);

      const isValid = await sessionService.validateMultiTabSession(
        "valid-token"
      );
      expect(isValid).toBe(false);
    });
  });

  describe("cleanupExpiredSessions", () => {
    it("removes expired sessions", async () => {
      const mockSessions = {
        session_1: {
          token: "token-1",
          expiresAt: Date.now() - 3600000, // Expired
        },
        session_2: {
          token: "token-2",
          expiresAt: Date.now() + 3600000, // Active
        },
      };

      vi.mocked(mockStorage.getItem).mockImplementation(
        (key) => mockSessions[key]
      );

      await sessionService.cleanupExpiredSessions();

      expect(mockStorage.removeItem).toHaveBeenCalledWith("session_1");
      expect(mockStorage.removeItem).not.toHaveBeenCalledWith("session_2");
    });
  });
});
