import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiKeyService } from "../apiKeyService";
import { SecureStorageService } from "@/services/secureStorageService";
import { TokenForgeError } from "@/utils/errors";
import type { ApiKeyPermissions } from "@/types/auth";

// Mock SecureStorage
vi.mock("@/services/secureStorageService", () => ({
  SecureStorageService: vi.fn(() => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    listItems: vi.fn(),
  })),
}));

describe("API Key Service", () => {
  let mockStorage: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage = new SecureStorageService("api-keys");
  });

  describe("generateApiKey", () => {
    it("generates valid API key", async () => {
      const permissions: ApiKeyPermissions = {
        read: true,
        write: false,
        admin: false,
      };

      const apiKey = await apiKeyService.generateApiKey(
        "Test Key",
        permissions
      );

      expect(apiKey).toMatch(/^tk_[a-zA-Z0-9]{32}$/);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining("api_key_"),
        expect.objectContaining({
          name: "Test Key",
          permissions,
          createdAt: expect.any(Number),
        })
      );
    });

    it("validates required permissions", async () => {
      const invalidPermissions = {} as ApiKeyPermissions;

      await expect(
        apiKeyService.generateApiKey("Test Key", invalidPermissions)
      ).rejects.toThrow(TokenForgeError);
    });

    it("prevents duplicate key names", async () => {
      vi.mocked(mockStorage.listItems).mockResolvedValueOnce([
        {
          key: "api_key_1",
          value: { name: "Test Key" },
        },
      ]);

      const permissions: ApiKeyPermissions = {
        read: true,
        write: false,
        admin: false,
      };

      await expect(
        apiKeyService.generateApiKey("Test Key", permissions)
      ).rejects.toThrow(TokenForgeError);
    });
  });

  describe("validateApiKey", () => {
    it("validates existing API key", async () => {
      const mockApiKey = {
        key: "tk_1234567890abcdef1234567890abcdef",
        permissions: {
          read: true,
          write: false,
          admin: false,
        },
        createdAt: Date.now(),
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(mockApiKey);

      const result = await apiKeyService.validateApiKey(mockApiKey.key);
      expect(result).toBe(true);
    });

    it("rejects invalid API key format", async () => {
      const invalidKey = "invalid-key";

      const result = await apiKeyService.validateApiKey(invalidKey);
      expect(result).toBe(false);
    });

    it("rejects expired API key", async () => {
      const mockApiKey = {
        key: "tk_1234567890abcdef1234567890abcdef",
        permissions: {
          read: true,
          write: false,
          admin: false,
        },
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days old
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(mockApiKey);

      const result = await apiKeyService.validateApiKey(mockApiKey.key);
      expect(result).toBe(false);
    });
  });

  describe("getApiKeyPermissions", () => {
    it("retrieves API key permissions", async () => {
      const mockPermissions: ApiKeyPermissions = {
        read: true,
        write: true,
        admin: false,
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce({
        permissions: mockPermissions,
      });

      const permissions = await apiKeyService.getApiKeyPermissions(
        "tk_1234567890abcdef1234567890abcdef"
      );
      expect(permissions).toEqual(mockPermissions);
    });

    it("returns null for non-existent key", async () => {
      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(null);

      const permissions = await apiKeyService.getApiKeyPermissions(
        "tk_1234567890abcdef1234567890abcdef"
      );
      expect(permissions).toBeNull();
    });
  });

  describe("revokeApiKey", () => {
    it("revokes existing API key", async () => {
      const apiKey = "tk_1234567890abcdef1234567890abcdef";

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce({
        key: apiKey,
      });

      await apiKeyService.revokeApiKey(apiKey);
      expect(mockStorage.removeItem).toHaveBeenCalledWith(
        expect.stringContaining(apiKey)
      );
    });

    it("handles non-existent key revocation", async () => {
      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(null);

      await expect(
        apiKeyService.revokeApiKey("tk_1234567890abcdef1234567890abcdef")
      ).rejects.toThrow(TokenForgeError);
    });
  });

  describe("listApiKeys", () => {
    it("lists all API keys", async () => {
      const mockKeys = [
        {
          key: "api_key_1",
          value: {
            name: "Test Key 1",
            permissions: {
              read: true,
              write: false,
              admin: false,
            },
            createdAt: Date.now(),
          },
        },
        {
          key: "api_key_2",
          value: {
            name: "Test Key 2",
            permissions: {
              read: true,
              write: true,
              admin: false,
            },
            createdAt: Date.now(),
          },
        },
      ];

      vi.mocked(mockStorage.listItems).mockResolvedValueOnce(mockKeys);

      const keys = await apiKeyService.listApiKeys();
      expect(keys).toHaveLength(2);
      expect(keys[0]).toHaveProperty("name", "Test Key 1");
      expect(keys[1]).toHaveProperty("name", "Test Key 2");
    });

    it("filters expired keys", async () => {
      const mockKeys = [
        {
          key: "api_key_1",
          value: {
            name: "Active Key",
            permissions: {
              read: true,
              write: false,
              admin: false,
            },
            createdAt: Date.now(),
          },
        },
        {
          key: "api_key_2",
          value: {
            name: "Expired Key",
            permissions: {
              read: true,
              write: true,
              admin: false,
            },
            createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days old
          },
        },
      ];

      vi.mocked(mockStorage.listItems).mockResolvedValueOnce(mockKeys);

      const keys = await apiKeyService.listApiKeys();
      expect(keys).toHaveLength(1);
      expect(keys[0]).toHaveProperty("name", "Active Key");
    });
  });

  describe("updateApiKeyPermissions", () => {
    it("updates permissions for existing key", async () => {
      const apiKey = "tk_1234567890abcdef1234567890abcdef";
      const newPermissions: ApiKeyPermissions = {
        read: true,
        write: true,
        admin: false,
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce({
        key: apiKey,
        name: "Test Key",
        permissions: {
          read: true,
          write: false,
          admin: false,
        },
        createdAt: Date.now(),
      });

      await apiKeyService.updateApiKeyPermissions(apiKey, newPermissions);

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining(apiKey),
        expect.objectContaining({
          permissions: newPermissions,
        })
      );
    });

    it("prevents admin permission escalation", async () => {
      const apiKey = "tk_1234567890abcdef1234567890abcdef";
      const newPermissions: ApiKeyPermissions = {
        read: true,
        write: true,
        admin: true, // Attempting to escalate to admin
      };

      vi.mocked(mockStorage.getItem).mockResolvedValueOnce({
        key: apiKey,
        permissions: {
          read: true,
          write: true,
          admin: false,
        },
      });

      await expect(
        apiKeyService.updateApiKeyPermissions(apiKey, newPermissions)
      ).rejects.toThrow(TokenForgeError);
    });

    it("handles non-existent key update", async () => {
      vi.mocked(mockStorage.getItem).mockResolvedValueOnce(null);

      await expect(
        apiKeyService.updateApiKeyPermissions(
          "tk_1234567890abcdef1234567890abcdef",
          {
            read: true,
            write: false,
            admin: false,
          }
        )
      ).rejects.toThrow(TokenForgeError);
    });
  });
});
