import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { User as FirebaseUser, IdTokenResult } from "firebase/auth";

// Import services first
import { auth } from "../../../../config/firebase";
import { notificationService } from "../notificationService";
import { tabSyncService } from "../tabSyncService";
import { AuthPersistence } from "../../store/authPersistence";
import { sessionService } from "../sessionService";

// Mock modules
vi.mock("../notificationService", () => ({
  notificationService: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../tabSyncService", () => ({
  tabSyncService: {
    subscribe: vi.fn(),
    broadcast: vi.fn(),
  },
}));

vi.mock("../../../../config/firebase", () => ({
  auth: {
    currentUser: null,
    signOut: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../../store/authPersistence", () => ({
  AuthPersistence: {
    getInstance: vi.fn().mockReturnValue({
      load: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    }),
  },
}));

// Mock implementations
const mockedAuth = vi.mocked(auth, true);
const mockedNotificationService = vi.mocked(notificationService, true);
const mockedTabSyncService = vi.mocked(tabSyncService, true);
const mockedAuthPersistence = vi.mocked(AuthPersistence.getInstance(), true);

describe("SessionService", () => {
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  let mockUser: Partial<FirebaseUser>;
  let unsubscribeSync: () => void;
  let syncSubscriber:
    | ((message: {
        type: string;
        timestamp: number;
        tabId: string;
        payload?: any;
      }) => void)
    | null = null;
  let mockConsoleError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    // Create mock user
    mockUser = {
      uid: "test-uid",
      email: "test@example.com",
      emailVerified: true,
      getIdToken: vi.fn().mockResolvedValue("mock-token"),
      getIdTokenResult: vi.fn().mockResolvedValue({
        token: "mock-token",
        claims: {
          admin: true,
          canCreateToken: true,
        },
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        signInProvider: "password",
        signInSecondFactor: null,
      } as IdTokenResult),
    };

    // Setup console.error mock
    mockConsoleError = vi.fn();
    vi.spyOn(console, "error").mockImplementation(mockConsoleError);

    // Setup auth mock
    (mockedAuth as any).currentUser = mockUser;

    // Setup AuthPersistence mock
    vi.mocked(mockedAuthPersistence.load).mockResolvedValue({
      version: 1,
      timestamp: Date.now(),
      account: null,
      lastProvider: null,
      user: null,
      lastLogin: Date.now(),
    });

    // Setup tabSyncService mock
    unsubscribeSync = vi.fn();
    vi.mocked(mockedTabSyncService.subscribe).mockImplementation((callback) => {
      syncSubscriber = callback;
      return unsubscribeSync;
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
    (mockedAuth as any).currentUser = null;
    unsubscribeSync();
    syncSubscriber = null;
    vi.restoreAllMocks();
  });

  describe("initSession", () => {
    it("devrait initialiser une nouvelle session", async () => {
      await sessionService.initSession();

      expect(mockedAuthPersistence.save).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionInfo: expect.objectContaining({
            refreshToken: "mock-token",
          }),
          user: expect.objectContaining({
            uid: "test-uid",
            email: "test@example.com",
          }),
        })
      );
    });

    it("devrait gérer les erreurs d'initialisation", async () => {
      (mockedAuth as any).currentUser = null;

      await expect(sessionService.initSession()).rejects.toThrow(
        "Failed to initialize session"
      );
    });

    it("devrait détecter une session expirée", async () => {
      vi.mocked(mockedAuthPersistence.load).mockResolvedValueOnce({
        version: 1,
        timestamp: Date.now(),
        account: null,
        lastProvider: null,
        user: null,
        lastLogin: Date.now(),
        sessionInfo: {
          expiresAt: Date.now() - 1000,
          lastActivity: Date.now() - 1000,
          refreshToken: "expired-token",
        },
      });

      await sessionService.refreshSession();
      expect(mockedAuthPersistence.clear).toHaveBeenCalled();
    });

    it("devrait rafraîchir la session avant expiration", async () => {
      vi.mocked(mockedAuthPersistence.load).mockResolvedValueOnce({
        version: 1,
        timestamp: Date.now(),
        account: null,
        lastProvider: null,
        user: null,
        lastLogin: Date.now(),
        sessionInfo: {
          expiresAt: Date.now() + 4 * 60 * 1000, // 4 minutes avant expiration
          lastActivity: Date.now(),
          refreshToken: "valid-token",
        },
      });

      await sessionService.refreshSession();
      expect(mockedAuthPersistence.save).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionInfo: expect.objectContaining({
            refreshToken: "valid-token",
          }),
        })
      );
    });
  });

  describe("user activity", () => {
    it("devrait mettre à jour lastActivity", async () => {
      const now = Date.now();
      vi.mocked(mockedAuthPersistence.load).mockResolvedValueOnce({
        version: 1,
        timestamp: Date.now(),
        account: null,
        lastProvider: null,
        user: null,
        lastLogin: Date.now(),
        sessionInfo: {
          expiresAt: now + SESSION_TIMEOUT,
          lastActivity: now,
          refreshToken: "valid-token",
        },
      });

      await sessionService.updateActivity();

      expect(mockedAuthPersistence.save).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionInfo: expect.objectContaining({
            lastActivity: expect.any(Number),
          }),
        })
      );
    });

    it("devrait propager l'activité aux autres onglets", async () => {
      await sessionService.initSession();

      // Simuler une activité d'un autre onglet
      if (syncSubscriber) {
        syncSubscriber({
          type: "session",
          timestamp: Date.now(),
          tabId: "other-tab",
          payload: {
            lastActivity: Date.now(),
          },
        });
      }

      expect(mockedAuthPersistence.save).toHaveBeenCalled();
    });
  });

  describe("session management", () => {
    it("devrait nettoyer les données de session", async () => {
      await sessionService.initSession();
      await sessionService.endSession();

      expect(mockedAuthPersistence.clear).toHaveBeenCalled();
      expect(mockedTabSyncService.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "session",
          payload: expect.objectContaining({
            action: "logout",
          }),
        })
      );
    });
  });

  describe("error handling", () => {
    it("devrait gérer les erreurs de rafraîchissement de session", async () => {
      vi.mocked(mockedAuthPersistence.load).mockRejectedValueOnce(
        new Error("Load failed")
      );

      await sessionService.refreshSession();
      expect(mockedNotificationService.error).toHaveBeenCalledWith(
        "Error refreshing session"
      );
    });

    it("devrait gérer les erreurs de synchronisation", async () => {
      vi.mocked(mockedAuthPersistence.save).mockRejectedValueOnce(
        new Error("Save failed")
      );

      // Simuler une session valide
      vi.mocked(mockedAuthPersistence.load).mockResolvedValueOnce({
        version: 1,
        timestamp: Date.now(),
        account: null,
        lastProvider: null,
        user: null,
        lastLogin: Date.now(),
        sessionInfo: {
          expiresAt: Date.now() + 3600000,
          lastActivity: Date.now(),
          refreshToken: "valid-token",
        },
      });

      await sessionService.updateActivity();
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Failed to update activity:",
        expect.any(Error)
      );
    });
  });
});
