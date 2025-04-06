import { describe, it, expect, beforeEach } from "vitest";
import { ForgeTaxService } from "../services/forgeTaxService";
import type { TransactionReceipt } from "viem";

describe("ForgeTaxService", () => {
  let service: ForgeTaxService;
  const mockForgeWallet =
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" as `0x${string}`;
  const mockTreasuryWallet =
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44f" as `0x${string}`;

  beforeEach(() => {
    service = new ForgeTaxService(mockForgeWallet, mockTreasuryWallet);
  });

  describe("calculateTaxDistribution", () => {
    it("should calculate correct tax distribution for base tax", () => {
      const amount = BigInt(1000000); // 1M tokens
      const customTaxRate = 0;

      const { forgeAmount, treasuryAmount, creatorAmount } =
        service.calculateTaxDistribution(amount, customTaxRate);

      // 0.5% base tax
      expect(forgeAmount).toBe(BigInt(5000)); // 0.5% of 1M
      // 20% of forge tax goes to treasury
      expect(treasuryAmount).toBe(BigInt(1000)); // 0.1% of 1M
      // No custom tax
      expect(creatorAmount).toBe(BigInt(0));
    });

    it("should calculate correct tax distribution with custom tax", () => {
      const amount = BigInt(1000000);
      const customTaxRate = 1.5; // Maximum custom tax

      const { forgeAmount, treasuryAmount, creatorAmount } =
        service.calculateTaxDistribution(amount, customTaxRate);

      expect(forgeAmount).toBe(BigInt(5000)); // 0.5% of 1M
      expect(treasuryAmount).toBe(BigInt(1000)); // 0.1% of 1M
      expect(creatorAmount).toBe(BigInt(15000)); // 1.5% of 1M
    });

    it("should cap custom tax at maximum rate", () => {
      const amount = BigInt(1000000);
      const customTaxRate = 2.0; // Exceeds maximum

      const { creatorAmount } = service.calculateTaxDistribution(
        amount,
        customTaxRate
      );

      expect(creatorAmount).toBe(BigInt(15000)); // Should be capped at 1.5%
    });
  });

  describe("getTaxConfig", () => {
    it("should return correct tax configuration", () => {
      const config = service.getTaxConfig(1.0);

      expect(config.baseTaxRate).toBe(0.5);
      expect(config.customTaxRate).toBe(1.0);
      expect(config.forgeWallet).toBe(mockForgeWallet);
      expect(config.treasuryWallet).toBe(mockTreasuryWallet);
    });

    it("should cap custom tax rate at maximum", () => {
      const config = service.getTaxConfig(2.0);

      expect(config.customTaxRate).toBe(1.5);
    });
  });

  describe("validateTaxPayment", () => {
    it("should return false for failed transactions", async () => {
      const mockReceipt = {
        status: false,
      } as TransactionReceipt;

      const result = await service.validateTaxPayment(
        mockReceipt,
        BigInt(1000)
      );
      expect(result).toBe(false);
    });
  });
});
