import { describe, it, expect, vi, beforeEach } from "vitest";
import { securityService } from "../securityService";
import { getAuth } from "firebase-admin/auth";
import { createPublicClient } from "viem";
import { TokenForgeError } from "@/utils/errors";

// Mock Firebase Admin
vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn(),
    getUser: vi.fn(),
    setCustomUserClaims: vi.fn(),
  })),
}));

// Mock Viem
vi.mock("viem", () => ({
  createPublicClient: vi.fn(),
  http: vi.fn(),
}));

describe("Security Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Firebase Admin mock
    vi.mocked(getAuth).mockReturnValue({
      verifyIdToken: vi.fn().mockResolvedValue({
        uid: "test-uid",
        email: "test@example.com",
      }),
      getUser: vi.fn().mockResolvedValue({
        uid: "test-uid",
        email: "test@example.com",
        customClaims: { isAdmin: false },
      }),
      setCustomUserClaims: vi.fn(),
    } as any);

    // Setup Viem mock
    vi.mocked(createPublicClient).mockReturnValue({
      getBalance: vi.fn().mockResolvedValue(BigInt(1000000000000000000)),
      getBlockNumber: vi.fn().mockResolvedValue(BigInt(1000000)),
    } as any);
  });

  describe("validateToken", () => {
    it("validates a valid token", async () => {
      const token = "valid-token";
      const result = await securityService.validateToken(token);

      expect(getAuth().verifyIdToken).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        uid: "test-uid",
        email: "test@example.com",
      });
    });

    it("throws error for invalid token", async () => {
      const token = "invalid-token";
      vi.mocked(getAuth().verifyIdToken).mockRejectedValueOnce(
        new Error("Invalid token")
      );

      await expect(securityService.validateToken(token)).rejects.toThrow(
        TokenForgeError
      );
    });
  });

  describe("verifyWalletSignature", () => {
    it("verifies a valid signature", async () => {
      const data = {
        message: "Test message",
        signature: "0x1234...",
        address: "0x5678...",
      };

      const result = await securityService.verifyWalletSignature(
        data.message,
        data.signature,
        data.address
      );

      expect(result).toBe(true);
    });

    it("rejects an invalid signature", async () => {
      const data = {
        message: "Test message",
        signature: "invalid-signature",
        address: "0x5678...",
      };

      const result = await securityService.verifyWalletSignature(
        data.message,
        data.signature,
        data.address
      );

      expect(result).toBe(false);
    });
  });

  describe("setUserRole", () => {
    it("sets admin role successfully", async () => {
      const uid = "test-uid";
      const role = "admin";

      await securityService.setUserRole(uid, role);

      expect(getAuth().setCustomUserClaims).toHaveBeenCalledWith(uid, {
        isAdmin: true,
      });
    });

    it("sets user role successfully", async () => {
      const uid = "test-uid";
      const role = "user";

      await securityService.setUserRole(uid, role);

      expect(getAuth().setCustomUserClaims).toHaveBeenCalledWith(uid, {
        isAdmin: false,
      });
    });

    it("throws error for invalid role", async () => {
      const uid = "test-uid";
      const role = "invalid-role";

      await expect(securityService.setUserRole(uid, role)).rejects.toThrow(
        TokenForgeError
      );
    });
  });

  describe("validateChainId", () => {
    it("validates supported chain ID", () => {
      const chainId = 1; // Ethereum Mainnet
      const result = securityService.validateChainId(chainId);

      expect(result).toBe(true);
    });

    it("rejects unsupported chain ID", () => {
      const chainId = 999; // Invalid chain
      const result = securityService.validateChainId(chainId);

      expect(result).toBe(false);
    });
  });

  describe("generateNonce", () => {
    it("generates unique nonces", () => {
      const nonce1 = securityService.generateNonce();
      const nonce2 = securityService.generateNonce();

      expect(nonce1).not.toBe(nonce2);
      expect(typeof nonce1).toBe("string");
      expect(nonce1.length).toBeGreaterThan(0);
    });
  });

  describe("validateAddress", () => {
    it("validates correct Ethereum address", () => {
      const address = "0x1234567890123456789012345678901234567890";
      const result = securityService.validateAddress(address);

      expect(result).toBe(true);
    });

    it("rejects invalid Ethereum address", () => {
      const address = "invalid-address";
      const result = securityService.validateAddress(address);

      expect(result).toBe(false);
    });

    it("rejects null address", () => {
      const address = "0x0000000000000000000000000000000000000000";
      const result = securityService.validateAddress(address);

      expect(result).toBe(false);
    });
  });

  describe("validatePermissions", () => {
    it("validates user with required permissions", async () => {
      const uid = "test-uid";
      const requiredPermissions = ["read", "write"];

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {
          permissions: ["read", "write", "delete"],
        },
      } as any);

      const result = await securityService.validatePermissions(
        uid,
        requiredPermissions
      );
      expect(result).toBe(true);
    });

    it("rejects user without required permissions", async () => {
      const uid = "test-uid";
      const requiredPermissions = ["admin"];

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {
          permissions: ["read", "write"],
        },
      } as any);

      const result = await securityService.validatePermissions(
        uid,
        requiredPermissions
      );
      expect(result).toBe(false);
    });

    it("handles user without any permissions", async () => {
      const uid = "test-uid";
      const requiredPermissions = ["read"];

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {},
      } as any);

      const result = await securityService.validatePermissions(
        uid,
        requiredPermissions
      );
      expect(result).toBe(false);
    });
  });

  describe("rateLimit", () => {
    it("tracks request counts correctly", () => {
      const ip = "127.0.0.1";

      // Make multiple requests
      for (let i = 0; i < 5; i++) {
        const result = securityService.checkRateLimit(ip);
        expect(result).toBe(true);
      }

      // Should be rate limited after too many requests
      const result = securityService.checkRateLimit(ip);
      expect(result).toBe(false);
    });

    it("resets rate limit after window", async () => {
      const ip = "127.0.0.1";

      // Make requests up to limit
      for (let i = 0; i < 5; i++) {
        securityService.checkRateLimit(ip);
      }

      // Wait for rate limit window to expire
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Should be able to make requests again
      const result = securityService.checkRateLimit(ip);
      expect(result).toBe(true);
    });
  });
});
