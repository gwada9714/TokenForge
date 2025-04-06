import { TaxConfig } from "@/types/tokenFeatures";
import { getAddress, isAddress } from "@ethersproject/address";
import { AddressZero } from "@ethersproject/constants";

export class TaxService {
  private static readonly BASE_TAX_RATE = 0.5; // 0.5%
  private static readonly MAX_ADDITIONAL_TAX_RATE = 1.5; // 1.5%

  private static readonly DEFAULT_DISTRIBUTION = {
    treasury: 60, // 60%
    development: 20, // 20%
    buyback: 15, // 15%
    staking: 5, // 5%
  };

  public static validateTaxConfig(config: TaxConfig): boolean {
    // Vérifier que la somme des parts est égale à 100%
    const totalShares =
      config.distribution.treasury +
      config.distribution.development +
      config.distribution.buyback +
      config.distribution.staking;

    if (totalShares !== 100) {
      throw new Error(
        "La somme des parts de distribution doit être égale à 100%"
      );
    }

    // Vérifier que la taxe additionnelle ne dépasse pas le maximum
    if (config.additionalTaxRate > this.MAX_ADDITIONAL_TAX_RATE) {
      throw new Error(
        `La taxe additionnelle ne peut pas dépasser ${this.MAX_ADDITIONAL_TAX_RATE}%`
      );
    }

    // Vérifier l'adresse du créateur si la taxe additionnelle est activée
    if (config.enabled && !isAddress(config.creatorWallet)) {
      throw new Error("Adresse du créateur invalide");
    }

    return true;
  }

  public static getDefaultTaxConfig(): TaxConfig {
    return {
      enabled: false,
      baseTaxRate: this.BASE_TAX_RATE,
      additionalTaxRate: 0,
      creatorWallet: AddressZero,
      distribution: this.DEFAULT_DISTRIBUTION,
    };
  }

  public static calculateTotalTax(
    amount: number,
    config: TaxConfig
  ): {
    baseTax: number;
    additionalTax: number;
    total: number;
  } {
    const baseTax = amount * (config.baseTaxRate / 100);
    const additionalTax = config.enabled
      ? amount * (config.additionalTaxRate / 100)
      : 0;

    return {
      baseTax,
      additionalTax,
      total: baseTax + additionalTax,
    };
  }
}
