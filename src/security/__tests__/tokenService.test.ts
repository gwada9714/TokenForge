import { describe, it, expect, vi, beforeEach } from "vitest";
import { tokenService } from "../tokenService";
import { getAuth } from "firebase-admin/auth";
import { SecureStorageService } from "@/services/secureStorageService";
import { TokenForgeError } from "@/utils/errors";
import type { TokenMetadata, TokenValidationResult } from "@/types/auth";

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

describe("Token Service", () => {
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
    mockStorage = new SecureStorageService("tokens");
  });

  describe("createToken", () => {
    it("creates authentication token successfully", async () => {
      const metadata: TokenMetadata = {
        userId: "test-uid",
        type: "auth",
        expiresIn: 3600,
        permissions: ["read", "write"],
      };

      const token = await tokenService.createToken(metadata);

      expect(token).toBeDefined();
      expect(token.value).toMatch(
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
      );
      expect(token.expiresAt).toBeGreaterThan(Date.now());
      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it("creates refresh token with longer expiry", async () => {
      const metadata: TokenMetadata = {
        userId: "test-uid",
        type: "refresh",
        expiresIn: 86400, // 24 hours
        permissions: ["refresh"],
      };

      const token = await tokenService.createToken(metadata);

      expect(token.expiresAt).toBeGreaterThan(Date.now() + 85000000); // ~23.6 hours
    });

    it("includes custom claims in token", async () => {
      const metadata: TokenMetadata = {
        userId: "test-uid",
        type: "auth",
        expiresIn: 3600,
        permissions: ["read"],
        customClaims: {
          role: "admin",
        },
      };

      await tokenService.createToken(metadata);

      expect(getAuth().createCustomToken).toHaveBeenCalledWith(
        "test-uid",
        expect.objectContaining({
          role: "admin",
        })
      );
    });

    it("handles token creation errors", async () => {
      const metadata: TokenMetadata = {
        userId: "test-uid",
        type: "auth",
        expiresIn: 3600,
        permissions: ["read"],
      };

      vi.mocked(getAuth().createCustomToken).mockRejectedValueOnce(
        new Error("Token creation failed")
      );

      await expect(tokenService.createToken(metadata)).rejects.toThrow(
        TokenForgeError
      );
    });
  });

  describe("validateToken", () => {
    it("validates valid token", async () => {
      const token = "valid-token";
      const mockTokenData = {
        value: token,
        expiresAt: Date.now() + 3600000,
        metadata: {
          userId: "test-uid",
          type: "auth",
          permissions: ["read"],
        },
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(mockTokenData);
      vi.mocked(getAuth().verifyIdToken).mockResolvedValueOnce({
        uid: "test-uid",
      });

      const result = await tokenService.validateToken(token);
      expect(result.isValid).toBe(true);
      expect(result.userId).toBe("test-uid");
    });

    it("detects expired token", async () => {
      const token = "expired-token";
      const mockTokenData = {
        value: token,
        expiresAt: Date.now() - 3600000,
        metadata: {
          userId: "test-uid",
          type: "auth",
          permissions: ["read"],
        },
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(mockTokenData);

      const result = await tokenService.validateToken(token);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Token expired");
    });

    it("validates token permissions", async () => {
      const token = "valid-token";
      const mockTokenData = {
        value: token,
        expiresAt: Date.now() + 3600000,
        metadata: {
          userId: "test-uid",
          type: "auth",
          permissions: ["read"],
        },
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(mockTokenData);
      vi.mocked(getAuth().verifyIdToken).mockResolvedValueOnce({
        uid: "test-uid",
      });

      const result = await tokenService.validateToken(token, ["read"]);
      expect(result.isValid).toBe(true);
    });

    it("detects insufficient permissions", async () => {
      const token = "valid-token";
      const mockTokenData = {
        value: token,
        expiresAt: Date.now() + 3600000,
        metadata: {
          userId: "test-uid",
          type: "auth",
          permissions: ["read"],
        },
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(mockTokenData);
      vi.mocked(getAuth().verifyIdToken).mockResolvedValueOnce({
        uid: "test-uid",
      });

      const result = await tokenService.validateToken(token, ["write"]);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Insufficient permissions");
    });
  });

  describe("refreshToken", () => {
    it("refreshes valid token", async () => {
      const refreshToken = "valid-refresh-token";
      const mockTokenData = {
        value: refreshToken,
        expiresAt: Date.now() + 86400000,
        metadata: {
          userId: "test-uid",
          type: "refresh",
          permissions: ["refresh"],
        },
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(mockTokenData);
      vi.mocked(getAuth().verifyIdToken).mockResolvedValueOnce({
        uid: "test-uid",
      });

      const newToken = await tokenService.refreshToken(refreshToken);
      expect(newToken).toBeDefined();
      expect(newToken.value).not.toBe(refreshToken);
    });

    it("prevents refresh token reuse", async () => {
      const refreshToken = "used-refresh-token";
      const mockTokenData = {
        value: refreshToken,
        expiresAt: Date.now() + 86400000,
        metadata: {
          userId: "test-uid",
          type: "refresh",
          permissions: ["refresh"],
        },
        used: true,
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(mockTokenData);

      await expect(tokenService.refreshToken(refreshToken)).rejects.toThrow(
        TokenForgeError
      );
    });

    it("validates refresh token type", async () => {
      const token = "auth-token";
      const mockTokenData = {
        value: token,
        expiresAt: Date.now() + 3600000,
        metadata: {
          userId: "test-uid",
          type: "auth",
          permissions: ["read"],
        },
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(mockTokenData);

      await expect(tokenService.refreshToken(token)).rejects.toThrow(
        TokenForgeError
      );
    });
  });

  describe("revokeToken", () => {
    it("revokes active token", async () => {
      const token = "active-token";
      const mockTokenData = {
        value: token,
        expiresAt: Date.now() + 3600000,
        metadata: {
          userId: "test-uid",
          type: "auth",
          permissions: ["read"],
        },
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(mockTokenData);

      await tokenService.revokeToken(token);
      expect(mockStorage.removeItem).toHaveBeenCalledWith(
        expect.stringContaining(token)
      );
    });

    it("handles already revoked token", async () => {
      const token = "revoked-token";
      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(null);

      await expect(tokenService.revokeToken(token)).resolves.not.toThrow();
    });
  });

  describe("getTokenMetadata", () => {
    it("retrieves token metadata", async () => {
      const token = "valid-token";
      const mockTokenData = {
        value: token,
        expiresAt: Date.now() + 3600000,
        metadata: {
          userId: "test-uid",
          type: "auth",
          permissions: ["read"],
        },
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(mockTokenData);

      const metadata = await tokenService.getTokenMetadata(token);
      expect(metadata).toEqual(mockTokenData.metadata);
    });

    it("returns null for invalid token", async () => {
      const token = "invalid-token";
      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(null);

      const metadata = await tokenService.getTokenMetadata(token);
      expect(metadata).toBeNull();
    });
  });
});
