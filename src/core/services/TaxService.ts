import { TaxConfig, TaxCalculation } from '../types/tax';
import { getAddress, isAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';

export class TaxService {
  private static readonly BASE_TAX_RATE = 0.005; // 0.5%
  private static readonly MAX_ADDITIONAL_TAX_RATE = 0.015; // 1.5%
  
  private static readonly DEFAULT_DISTRIBUTION = {
    tokenForge: 0.6,     // 60%
    development: 0.2,    // 20%
    burnAndBuyback: 0.15, // 15%
    stakers: 0.05        // 5%
  };

  public static validateTaxConfig(config: TaxConfig): boolean {
    // Vérifier que la taxe additionnelle ne dépasse pas le maximum
    if (config.additionalTax > this.MAX_ADDITIONAL_TAX_RATE) {
      throw new Error(`La taxe additionnelle ne peut pas dépasser ${this.MAX_ADDITIONAL_TAX_RATE * 100}%`);
    }

    // Vérifier que la distribution totalise 100%
    const totalDistribution = Object.values(config.distribution).reduce((a, b) => a + b, 0);
    if (Math.abs(totalDistribution - 1) > 0.0001) {
      throw new Error('La distribution de la taxe de base doit totaliser 100%');
    }

    // Vérifier l'adresse du destinataire de la taxe additionnelle
    if (config.additionalTaxConfig.enabled && !isAddress(config.additionalTaxConfig.recipient)) {
      throw new Error('Adresse de destinataire de taxe additionnelle invalide');
    }

    return true;
  }

  public static calculateTax(amount: number, config: TaxConfig): TaxCalculation {
    const baseTaxAmount = amount * this.BASE_TAX_RATE;
    const additionalTaxAmount = config.additionalTaxConfig.enabled ? 
      amount * config.additionalTax : 0;

    return {
      totalTaxAmount: baseTaxAmount + additionalTaxAmount,
      baseTaxAmount,
      additionalTaxAmount,
      distribution: {
        tokenForge: baseTaxAmount * config.distribution.tokenForge,
        development: baseTaxAmount * config.distribution.development,
        burnAndBuyback: baseTaxAmount * config.distribution.burnAndBuyback,
        stakers: baseTaxAmount * config.distribution.stakers,
        creator: additionalTaxAmount
      }
    };
  }

  public static getDefaultTaxConfig(): TaxConfig {
    return {
      baseTax: this.BASE_TAX_RATE,
      additionalTax: 0,
      distribution: { ...this.DEFAULT_DISTRIBUTION },
      additionalTaxConfig: {
        enabled: false,
        recipient: AddressZero
      }
    };
  }
}
