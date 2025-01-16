import { TaxConfig } from '@/types/tokenFeatures';
import { getAddress, isAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';

export class TaxService {
  private static readonly DEFAULT_TAX_RATE = 5; // 5%
  private static readonly DEFAULT_TRANSFER_TAX_RATE = 2; // 2%
  
  private static readonly DEFAULT_DISTRIBUTION = {
    forgeShare: 10,        // 10%
    redistributionShare: 30, // 30%
    liquidityShare: 30,     // 30%
    burnShare: 30          // 30%
  };

  public static validateTaxConfig(config: TaxConfig): boolean {
    // Vérifier que la somme des parts est égale à 100%
    const totalShares = 
      config.forgeShare + 
      config.redistributionShare + 
      config.liquidityShare + 
      config.burnShare;

    if (totalShares !== 100) {
      throw new Error('La somme des parts de distribution doit être égale à 100%');
    }

    // Vérifier l'adresse du destinataire
    if (config.enabled && !isAddress(config.recipient)) {
      throw new Error('Adresse de destinataire de taxe invalide');
    }

    return true;
  }

  public static getDefaultTaxConfig(): TaxConfig {
    return {
      enabled: false,
      buyTax: this.DEFAULT_TAX_RATE,
      sellTax: this.DEFAULT_TAX_RATE,
      transferTax: this.DEFAULT_TRANSFER_TAX_RATE,
      recipient: AddressZero,
      ...this.DEFAULT_DISTRIBUTION
    };
  }

  public static calculateEffectiveTax(amount: number, taxRate: number): number {
    return amount * (taxRate / 100);
  }
}
