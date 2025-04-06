import { describe, it, expect, vi, beforeEach } from "vitest";
import { SecureStorageService } from "../secureStorageService";
import CryptoJS from "crypto-js";

vi.mock("crypto-js", () => ({
  default: {
    AES: {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    },
    enc: {
      Utf8: {
        stringify: vi.fn(),
        parse: vi.fn(),
      },
    },
  },
}));

describe("SecureStorageService", () => {
  let secureStorage: SecureStorageService;
  const mockKey = "test-encryption-key";
  const mockData = { test: "data" };
  const mockEncryptedData = "encrypted-data";

  beforeEach(() => {
    vi.clearAllMocks();
    secureStorage = new SecureStorageService(mockKey);

    // Mock localStorage
    const mockStorage: { [key: string]: string } = {};
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
      mockStorage[key] = value;
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key) => mockStorage[key] || null
    );
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation((key) => {
      delete mockStorage[key];
    });
  });

  describe("setItem", () => {
    it("encrypts and stores data", () => {
      vi.mocked(CryptoJS.AES.encrypt).mockReturnValue({
        toString: () => mockEncryptedData,
      } as any);

      secureStorage.setItem("testKey", mockData);

      expect(CryptoJS.AES.encrypt).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "testKey",
        mockEncryptedData
      );
    });

    it("handles encryption errors", () => {
      vi.mocked(CryptoJS.AES.encrypt).mockImplementation(() => {
        throw new Error("Encryption failed");
      });

      expect(() => secureStorage.setItem("testKey", mockData)).toThrow(
        "Encryption failed"
      );
    });
  });

  describe("getItem", () => {
    it("retrieves and decrypts data", () => {
      const mockDecryptedData = JSON.stringify(mockData);
      vi.mocked(localStorage.getItem).mockReturnValue(mockEncryptedData);
      vi.mocked(CryptoJS.AES.decrypt).mockReturnValue({
        toString: () => mockDecryptedData,
      } as any);

      const result = secureStorage.getItem("testKey");

      expect(localStorage.getItem).toHaveBeenCalledWith("testKey");
      expect(CryptoJS.AES.decrypt).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("returns null for non-existent items", () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const result = secureStorage.getItem("nonExistentKey");

      expect(result).toBeNull();
    });

    it("handles decryption errors", () => {
      vi.mocked(localStorage.getItem).mockReturnValue(mockEncryptedData);
      vi.mocked(CryptoJS.AES.decrypt).mockImplementation(() => {
        throw new Error("Decryption failed");
      });

      expect(() => secureStorage.getItem("testKey")).toThrow(
        "Decryption failed"
      );
    });
  });

  describe("removeItem", () => {
    it("removes item from storage", () => {
      secureStorage.removeItem("testKey");

      expect(localStorage.removeItem).toHaveBeenCalledWith("testKey");
    });
  });

  describe("clear", () => {
    it("clears all secure storage items", () => {
      const mockKeys = ["key1", "key2", "key3"];
      vi.spyOn(Object, "keys").mockReturnValue(mockKeys);

      secureStorage.clear();

      mockKeys.forEach((key) => {
        expect(localStorage.removeItem).toHaveBeenCalledWith(key);
      });
    });
  });
});
