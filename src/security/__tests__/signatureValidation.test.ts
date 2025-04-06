import { describe, it, expect, vi, beforeEach } from "vitest";
import { signatureValidationService } from "../signatureValidation";
import { createPublicClient, http } from "viem";
import { TokenForgeError } from "@/utils/errors";
import type { SignatureRequest, AddressValidation } from "@/types/security";

// Mock Viem
vi.mock("viem", () => ({
  createPublicClient: vi.fn(),
  http: vi.fn(),
  verifyMessage: vi.fn(),
  recoverMessageAddress: vi.fn(),
  getAddress: vi.fn(),
  isAddress: vi.fn(),
}));

describe("Signature Validation Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Viem mock
    vi.mocked(createPublicClient).mockReturnValue({
      verifyMessage: vi.fn(),
      getAddress: vi.fn(),
      isAddress: vi.fn(),
    } as any);
  });

  describe("validateSignature", () => {
    it("validates correct signature", async () => {
      const request: SignatureRequest = {
        message: "Sign this message",
        signature: "0x1234...",
        address: "0x5678...",
      };

      vi.mocked(createPublicClient().verifyMessage).mockResolvedValueOnce(true);

      const result = await signatureValidationService.validateSignature(
        request
      );
      expect(result.isValid).toBe(true);
    });

    it("detects invalid signature", async () => {
      const request: SignatureRequest = {
        message: "Sign this message",
        signature: "0x1234...",
        address: "0x5678...",
      };

      vi.mocked(createPublicClient().verifyMessage).mockResolvedValueOnce(
        false
      );

      const result = await signatureValidationService.validateSignature(
        request
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid signature");
    });

    it("validates signature format", async () => {
      const request: SignatureRequest = {
        message: "Sign this message",
        signature: "invalid-signature",
        address: "0x5678...",
      };

      const result = await signatureValidationService.validateSignature(
        request
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid signature format");
    });

    it("validates message format", async () => {
      const request: SignatureRequest = {
        message: "",
        signature: "0x1234...",
        address: "0x5678...",
      };

      const result = await signatureValidationService.validateSignature(
        request
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid message format");
    });
  });

  describe("recoverAddress", () => {
    it("recovers correct address", async () => {
      const message = "Sign this message";
      const signature = "0x1234...";
      const expectedAddress = "0x5678...";

      vi.mocked(
        createPublicClient().recoverMessageAddress
      ).mockResolvedValueOnce(expectedAddress);

      const recoveredAddress = await signatureValidationService.recoverAddress(
        message,
        signature
      );
      expect(recoveredAddress).toBe(expectedAddress);
    });

    it("handles recovery failure", async () => {
      const message = "Sign this message";
      const signature = "0x1234...";

      vi.mocked(
        createPublicClient().recoverMessageAddress
      ).mockRejectedValueOnce(new Error("Recovery failed"));

      await expect(
        signatureValidationService.recoverAddress(message, signature)
      ).rejects.toThrow(TokenForgeError);
    });
  });

  describe("validateAddress", () => {
    it("validates correct address", async () => {
      const validation: AddressValidation = {
        address: "0x1234...",
        chainId: 1,
      };

      vi.mocked(createPublicClient().isAddress).mockReturnValueOnce(true);

      const result = await signatureValidationService.validateAddress(
        validation
      );
      expect(result.isValid).toBe(true);
    });

    it("detects invalid address format", async () => {
      const validation: AddressValidation = {
        address: "invalid-address",
        chainId: 1,
      };

      vi.mocked(createPublicClient().isAddress).mockReturnValueOnce(false);

      const result = await signatureValidationService.validateAddress(
        validation
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid address format");
    });

    it("validates checksum address", async () => {
      const validation: AddressValidation = {
        address: "0x1234...",
        chainId: 1,
        validateChecksum: true,
      };

      vi.mocked(createPublicClient().getAddress).mockReturnValueOnce(
        "0x1234..."
      );
      vi.mocked(createPublicClient().isAddress).mockReturnValueOnce(true);

      const result = await signatureValidationService.validateAddress(
        validation
      );
      expect(result.isValid).toBe(true);
    });

    it("detects invalid checksum", async () => {
      const validation: AddressValidation = {
        address: "0x1234...",
        chainId: 1,
        validateChecksum: true,
      };

      vi.mocked(createPublicClient().getAddress).mockReturnValueOnce(
        "0x5678..."
      );
      vi.mocked(createPublicClient().isAddress).mockReturnValueOnce(true);

      const result = await signatureValidationService.validateAddress(
        validation
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid address checksum");
    });
  });

  describe("validateAddressType", () => {
    it("validates EOA address", async () => {
      const address = "0x1234...";

      vi.mocked(createPublicClient().getCode).mockResolvedValueOnce("0x");

      const result = await signatureValidationService.validateAddressType(
        address
      );
      expect(result.isContract).toBe(false);
    });

    it("detects contract address", async () => {
      const address = "0x1234...";

      vi.mocked(createPublicClient().getCode).mockResolvedValueOnce(
        "0x1234..."
      );

      const result = await signatureValidationService.validateAddressType(
        address
      );
      expect(result.isContract).toBe(true);
    });

    it("handles validation errors", async () => {
      const address = "0x1234...";

      vi.mocked(createPublicClient().getCode).mockRejectedValueOnce(
        new Error("Network error")
      );

      await expect(
        signatureValidationService.validateAddressType(address)
      ).rejects.toThrow(TokenForgeError);
    });
  });

  describe("validateSignatureExpiry", () => {
    it("validates non-expired signature", () => {
      const timestamp = Date.now() - 300000; // 5 minutes ago
      const maxAge = 3600000; // 1 hour

      const result = signatureValidationService.validateSignatureExpiry(
        timestamp,
        maxAge
      );
      expect(result.isValid).toBe(true);
    });

    it("detects expired signature", () => {
      const timestamp = Date.now() - 7200000; // 2 hours ago
      const maxAge = 3600000; // 1 hour

      const result = signatureValidationService.validateSignatureExpiry(
        timestamp,
        maxAge
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Signature expired");
    });

    it("validates future timestamps", () => {
      const timestamp = Date.now() + 60000; // 1 minute in future
      const maxAge = 3600000; // 1 hour

      const result = signatureValidationService.validateSignatureExpiry(
        timestamp,
        maxAge
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid timestamp");
    });
  });

  describe("validateSignatureNonce", () => {
    it("validates unique nonce", async () => {
      const nonce = "123456";
      const address = "0x1234...";

      // Mock storage check
      vi.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(null);

      const result = await signatureValidationService.validateSignatureNonce(
        nonce,
        address
      );
      expect(result.isValid).toBe(true);
    });

    it("detects used nonce", async () => {
      const nonce = "123456";
      const address = "0x1234...";

      // Mock storage check
      vi.spyOn(Storage.prototype, "getItem").mockReturnValueOnce("used");

      const result = await signatureValidationService.validateSignatureNonce(
        nonce,
        address
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Nonce already used");
    });

    it("validates nonce format", async () => {
      const nonce = "invalid-nonce";
      const address = "0x1234...";

      const result = await signatureValidationService.validateSignatureNonce(
        nonce,
        address
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid nonce format");
    });
  });
});
