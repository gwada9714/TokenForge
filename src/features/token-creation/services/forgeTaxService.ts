import {
  createPublicClient,
  http,
  type TransactionReceipt,
  parseEther,
} from "viem";
import { BlockchainNetwork } from "../components/DeploymentOptions";

export interface TaxConfig {
  baseTaxRate: number; // 0.5% taxe de forge
  customTaxRate: number; // Taxe personnalisée (max 1.5%)
  forgeWallet: `0x${string}`;
  treasuryWallet: `0x${string}`;
}

export class ForgeTaxService {
  private readonly BASE_TAX_RATE = 0.5; // 0.5%
  private readonly MAX_CUSTOM_TAX_RATE = 1.5; // 1.5%

  constructor(
    private readonly forgeWallet: `0x${string}`,
    private readonly treasuryWallet: `0x${string}`
  ) {}

  calculateTaxDistribution(
    amount: bigint,
    customTaxRate: number
  ): {
    forgeAmount: bigint;
    treasuryAmount: bigint;
    creatorAmount: bigint;
  } {
    // Valider les entrées
    if (amount <= 0n) {
      throw new Error("Le montant doit être positif");
    }

    const validCustomRate = Math.min(
      Math.max(0, customTaxRate),
      this.MAX_CUSTOM_TAX_RATE
    );

    // Calculer les montants en utilisant uniquement BigInt
    const basisPoints = 10000n; // Pour éviter les décimales
    const forgeRate = BigInt(Math.floor(this.BASE_TAX_RATE * 100));
    const customRate = BigInt(Math.floor(validCustomRate * 100));

    const forgeAmount = (amount * forgeRate) / basisPoints;
    const treasuryAmount = (forgeAmount * 20n) / 100n; // 20% de la taxe de forge
    const creatorAmount = (amount * customRate) / basisPoints;

    return {
      forgeAmount,
      treasuryAmount,
      creatorAmount,
    };
  }

  async validateTaxPayment(
    receipt: TransactionReceipt,
    expectedTax: bigint
  ): Promise<boolean> {
    if (!receipt.status) return false;
    const taxPaid = this.extractTaxFromReceipt(receipt);
    return taxPaid >= expectedTax;
  }

  getTaxConfig(customTaxRate: number): TaxConfig {
    return {
      baseTaxRate: this.BASE_TAX_RATE,
      customTaxRate: Math.min(customTaxRate, this.MAX_CUSTOM_TAX_RATE),
      forgeWallet: this.forgeWallet,
      treasuryWallet: this.treasuryWallet,
    };
  }

  private extractTaxFromReceipt(receipt: TransactionReceipt): bigint {
    // À implémenter avec les événements de transfert
    return BigInt(0);
  }
}
